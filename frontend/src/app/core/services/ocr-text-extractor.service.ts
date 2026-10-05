import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OcrTextExtractorService {
  private pdfWorkerInitialized = false;

  private async ensurePdfWorker(): Promise<any> {
    const pdfjsLib = await import('pdfjs-dist');
    if (!this.pdfWorkerInitialized && typeof window !== 'undefined') {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        this.pdfWorkerInitialized = true;
      } catch (err) {
        console.warn('Could not set custom workerSrc for pdfjs-dist', err);
      }
    }
    return pdfjsLib;
  }

  private async initTesseractWorker(onProgress?: (status: string) => void): Promise<any> {
    const { createWorker } = await import('tesseract.js');
    try {
      const worker = await createWorker('eng', 1, {
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract/tesseract-core-simd.wasm.js',
        langPath: '/tessdata'
      });
      return worker;
    } catch {
      // Fallback to standard CDN tesseract if local path has any hosting constraints
      return await createWorker('eng');
    }
  }

  /**
   * Universal extractor: Extracts digital text or runs OCR on scanned / image-based PDFs & images
   */
  public async extractText(
    file: File,
    onProgress?: (status: string) => void
  ): Promise<string> {
    const fileName = (file.name || '').toLowerCase();

    // 1. Direct Image Files (PNG, JPG, JPEG, WEBP)
    if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|tiff)$/i.test(fileName)) {
      return this.performOcrOnImage(file, onProgress);
    }

    // 2. PDF Files (Digital text first, OCR on canvas if image-based)
    if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
      return this.extractFromPdf(file, onProgress);
    }

    // 3. Plain Text / Markdown Files
    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || file.type.startsWith('text/')) {
      return await file.text();
    }

    return '';
  }

  /**
   * Extracts text from PDF using PDF.js digital glyphs, or OCR on rendered canvas if scanned
   */
  public async extractFromPdf(
    file: File,
    onProgress?: (status: string) => void
  ): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await this.ensurePdfWorker();

    try {
      if (onProgress) onProgress('Reading PDF document structure...');
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true
      });
      const pdf = await loadingTask.promise;

      let digitalText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const items = textContent.items as Array<any>;

        if (items && items.length > 0) {
          // Sort items by Y (top to bottom) and X (left to right)
          items.sort((a, b) => {
            const yDiff = (b.transform ? b.transform[5] : 0) - (a.transform ? a.transform[5] : 0);
            if (Math.abs(yDiff) > 4) return yDiff;
            return (a.transform ? a.transform[4] : 0) - (b.transform ? b.transform[4] : 0);
          });

          let currentY: number | null = null;
          let pageLines: string[] = [];
          let currentLine: string[] = [];

          for (const item of items) {
            const y = item.transform ? item.transform[5] : 0;
            const str = item.str || '';
            if (!str.trim()) continue;

            if (currentY === null || Math.abs(y - currentY) <= 4) {
              currentLine.push(str);
              currentY = y;
            } else {
              if (currentLine.length > 0) {
                pageLines.push(currentLine.join(' '));
              }
              currentLine = [str];
              currentY = y;
            }
          }

          if (currentLine.length > 0) {
            pageLines.push(currentLine.join(' '));
          }

          digitalText += pageLines.join('\n') + '\n\n';
        }
      }

      const cleanDigital = digitalText.trim();
      // If digital text is substantial, return it directly
      if (cleanDigital.length > 60) {
        return cleanDigital;
      }
    } catch (err) {
      console.warn('PDF.js text parsing encountered an issue, falling back to OCR:', err);
    }

    // Scanned / Image-based PDF detected -> Render pages to canvas and run OCR
    return this.performOcrOnPdfPages(arrayBuffer, onProgress);
  }

  /**
   * Render each page of a scanned PDF to canvas and run Tesseract OCR
   */
  public async performOcrOnPdfPages(
    arrayBuffer: ArrayBuffer,
    onProgress?: (status: string) => void
  ): Promise<string> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return '';
    }

    const pdfjsLib = await this.ensurePdfWorker();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true
    });
    const pdf = await loadingTask.promise;

    if (onProgress) onProgress(`Scanned image PDF detected (${pdf.numPages} pages). Initializing OCR engine...`);
    const worker = await this.initTesseractWorker(onProgress);
    let fullOcrText = '';

    try {
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (onProgress) {
          onProgress(`Running OCR on scanned page ${pageNum} of ${pdf.numPages}...`);
        }

        const page = await pdf.getPage(pageNum);
        // 2x scale for sharp character recognition
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvasContext: ctx, canvas, viewport } as any).promise;
          const ret = await worker.recognize(canvas);
          if (ret.data?.text) {
            fullOcrText += ret.data.text + '\n\n';
          }
        }
      }
    } finally {
      await worker.terminate();
    }

    return fullOcrText.trim();
  }

  /**
   * Direct image OCR (PNG, JPG, WEBP, etc.)
   */
  public async performOcrOnImage(
    file: File,
    onProgress?: (status: string) => void
  ): Promise<string> {
    if (onProgress) onProgress(`Running OCR on image ${file.name}...`);
    const worker = await this.initTesseractWorker(onProgress);
    try {
      const ret = await worker.recognize(file);
      return ret.data?.text?.trim() || '';
    } finally {
      await worker.terminate();
    }
  }
}
