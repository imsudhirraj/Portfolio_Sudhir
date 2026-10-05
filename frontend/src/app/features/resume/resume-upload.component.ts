import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ResumeApiService, StoredResumeInfo } from '../../core/services/resume-api.service';
import { PortfolioStateService } from '../../core/services/portfolio-state.service';
import { NotificationService } from '../../core/services/notification.service';
import { OcrTextExtractorService } from '../../core/services/ocr-text-extractor.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [IconComponent, FormsModule],
  template: `
    <div class="resume-view">
      <div class="view-header">
        <h2>Build Your Portfolio From Your Resume</h2>
        <p>Upload your resume document or paste your resume text. Our AI extraction engine reads your experience, skills, and projects to automatically assemble your portfolio.</p>
      </div>

      <!-- Mode Switcher Tabs -->
      <div class="mode-tabs">
        <button
          type="button"
          class="tab-btn"
          [class.active]="activeTab() === 'upload'"
          (click)="activeTab.set('upload')"
        >
          <app-icon name="upload" [size]="16" />
          <span>Upload Document (PDF / DOCX / TXT)</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          [class.active]="activeTab() === 'paste'"
          (click)="activeTab.set('paste')"
        >
          <app-icon name="edit" [size]="16" />
          <span>Paste Resume Text</span>
        </button>
      </div>

      @if (activeTab() === 'upload') {
        <!-- Drag & Drop Zone -->
        <div
          class="drop-zone card"
          [class.dragging]="isDragging()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <div class="drop-content">
            <div class="icon-circle">
              <app-icon name="upload" [size]="36" />
            </div>

            <div class="drop-text">
              <h3>Drag & Drop Resume</h3>
              <p>or click browse to select a file from your computer</p>
            </div>

            <label class="btn btn-secondary browse-btn">
              <span>Browse Files</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg,image/webp"
                (change)="onFileSelected($event)"
                hidden
              />
            </label>

            <span class="file-hint">Supported formats: PDF (digital or scanned/photos) • DOCX • TXT • PNG / JPG • Max: 10MB</span>
          </div>
        </div>

        <!-- Uploading / Processing Progress Indicator -->
        @if (isUploading()) {
          <div class="upload-progress card animate-fade-in">
            <div class="progress-info">
              <app-icon name="refresh" [size]="18" customClass="spinning" />
              <span>Securely uploading and verifying document structure...</span>
            </div>
          </div>
        }

        <!-- OCR Scanning Progress Card -->
        @if (isOcrRunning()) {
          <div class="ocr-progress-card card animate-fade-in">
            <div class="ocr-header">
              <div class="ocr-badge-row">
                <span class="ocr-badge">
                  <span class="pulsing-dot"></span>
                  Optical Character Recognition (OCR) Engine Active
                </span>
                <span class="ocr-tag">WebAssembly + Tesseract</span>
              </div>
              <h4>Reading text from document images & scanned pages...</h4>
              <p class="ocr-status-live">{{ ocrStatus() }}</p>
            </div>
            <div class="ocr-scan-bar">
              <div class="scan-beam"></div>
            </div>
            <div class="ocr-hint">
              <span>Extracting every word from your scanned PDF or photo without requiring external cloud services.</span>
            </div>
          </div>
        }

        <!-- Extraction Error Banner with Shortcut to Paste -->
        @if (extractionErrorMessage() && !isOcrRunning()) {
          <div class="extraction-error-card card animate-fade-in">
            <div class="error-header">
              <span class="error-badge">Extraction Note</span>
              <p class="error-desc">{{ extractionErrorMessage() }}</p>
            </div>
            <div class="error-action">
              <button class="btn btn-secondary btn-sm" (click)="triggerOcrExtraction(true)">
                <app-icon name="sparkles" [size]="14" />
                <span>Extract with In-Browser OCR</span>
              </button>
              <button class="btn btn-secondary btn-sm" (click)="switchToPaste()">
                <app-icon name="edit" [size]="14" />
                <span>Switch to Paste Resume Text</span>
              </button>
            </div>
          </div>
        }

        <!-- Uploaded Resume Status Card -->
        @if (resumeInfo()?.exists) {
          <div class="resume-status-card card animate-fade-in">
            <div class="status-left">
              <div class="badge badge-success">
                <app-icon name="check-circle" [size]="14" />
                <span>Resume Uploaded</span>
              </div>
              <div class="file-meta">
                <span class="file-name">{{ resumeInfo()?.fileName }}</span>
                <span class="file-size">{{ formatBytes(resumeInfo()?.fileSizeBytes || 0) }}</span>
              </div>
            </div>

            <div class="status-actions">
              <button
                class="btn btn-primary"
                (click)="analyzeAndBuild()"
                [disabled]="isAnalyzing() || isOcrRunning()"
              >
                <app-icon name="sparkles" [size]="18" />
                <span>{{ isAnalyzing() ? 'Building Portfolio from Resume...' : 'Analyze & Build Portfolio' }}</span>
              </button>

              <button
                class="btn btn-secondary"
                (click)="analyzeAndReview()"
                [disabled]="isAnalyzing() || isOcrRunning()"
              >
                <app-icon name="check-circle" [size]="16" />
                <span>Review Suggestions</span>
              </button>

              <button
                class="btn btn-secondary btn-sm"
                (click)="triggerOcrExtraction(true)"
                [disabled]="isAnalyzing() || isOcrRunning()"
                title="Extract text using local OCR engine"
              >
                <app-icon name="refresh" [size]="14" />
                <span>Run OCR</span>
              </button>

              <a [href]="resumeApi.downloadUrl()" target="_blank" class="btn btn-ghost btn-sm" title="Download current resume">
                <app-icon name="external" [size]="14" />
                <span>Download</span>
              </a>

              <button class="btn btn-ghost btn-sm" (click)="deleteResume()" title="Delete resume file" [disabled]="isAnalyzing() || isOcrRunning()">
                <app-icon name="trash" [size]="14" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        }
      } @else {
        <!-- Direct Text Paste Section -->
        <div class="paste-section card animate-fade-in">
          <div class="paste-header">
            <div>
              <h3>Paste Your Resume or CV Text</h3>
              <p>Ideal for scanned documents, LinkedIn profile exports, or documents with non-standard fonts.</p>
            </div>
            <div class="text-counts">
              <span>{{ pastedText().trim().length }} characters</span>
              <span>•</span>
              <span>{{ getWordCount(pastedText()) }} words</span>
            </div>
          </div>

          <textarea
            class="resume-textarea"
            [(ngModel)]="pastedText"
            placeholder="Paste your resume contents here (e.g. Name, Contact Details, Professional Summary, Skills, Work Experience, Education, Projects)..."
            rows="14"
          ></textarea>

          <div class="paste-actions">
            <div class="actions-left">
              <button
                class="btn btn-primary"
                (click)="analyzePastedText(true)"
                [disabled]="isAnalyzing() || pastedText().trim().length < 30"
              >
                <app-icon name="sparkles" [size]="18" />
                <span>{{ isAnalyzing() ? 'Building Portfolio from Text...' : 'Analyze & Build Portfolio' }}</span>
              </button>

              <button
                class="btn btn-secondary"
                (click)="analyzePastedText(false)"
                [disabled]="isAnalyzing() || pastedText().trim().length < 30"
              >
                <app-icon name="check-circle" [size]="16" />
                <span>Review Suggestions</span>
              </button>
            </div>

            <button
              class="btn btn-ghost btn-sm"
              (click)="pastedText.set('')"
              [disabled]="isAnalyzing() || !pastedText()"
            >
              Clear
            </button>
          </div>
        </div>
      }

      <!-- Privacy Pledge Banner -->
      <div class="privacy-banner card">
        <app-icon name="shield" [size]="20" />
        <div>
          <h4>Document Privacy & Protection</h4>
          <p>
            Your resume is saved solely in your private user storage folder (<code>/storage/users/&#123;id&#125;/resume/</code>).
            It is never shared with third parties or stored in any public cloud database.
            You can configure the system to automatically purge your resume file after analysis in Settings.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .resume-view {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      max-width: 860px;
    }

    .view-header {
      h2 { font-size: 1.625rem; margin-bottom: 0.375rem; }
      p { font-size: 0.9375rem; color: var(--text-secondary); }
    }

    .mode-tabs {
      display: flex;
      gap: 0.75rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;

      .tab-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: transparent;
        border: none;
        color: var(--text-secondary);
        padding: 0.625rem 1.125rem;
        font-size: 0.9375rem;
        font-weight: 500;
        cursor: pointer;
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);

        &:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }

        &.active {
          color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.1);
          font-weight: 600;
        }
      }
    }

    .drop-zone {
      border: 2px dashed rgba(99, 102, 241, 0.4);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 3.5rem 2rem;
      text-align: center;
      transition: all var(--transition-normal);
      cursor: pointer;

      &:hover, &.dragging {
        border-color: var(--accent-primary);
        background: rgba(99, 102, 241, 0.05);
        box-shadow: var(--shadow-glow);
      }
    }

    .drop-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;

      .icon-circle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: rgba(99, 102, 241, 0.1);
        color: var(--accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .drop-text {
        h3 { font-size: 1.25rem; margin-bottom: 0.25rem; }
        p { font-size: 0.875rem; }
      }

      .browse-btn {
        cursor: pointer;
      }

      .file-hint {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .upload-progress {
      padding: 1rem 1.5rem;
      background: var(--bg-elevated);

      .progress-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }
    }

    .extraction-error-card {
      background: rgba(239, 68, 68, 0.08);
      border-left: 4px solid var(--accent-danger, #ef4444);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .error-header {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        .error-badge {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent-danger, #ef4444);
        }

        .error-desc {
          font-size: 0.875rem;
          color: var(--text-primary);
          line-height: 1.45;
        }
      }

      .error-action {
        display: flex;
      }
    }

    .resume-status-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      background: var(--bg-card);
      border-color: rgba(16, 185, 129, 0.3);
      flex-wrap: wrap;
      gap: 1rem;

      .status-left {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .file-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .file-name {
            font-weight: 600;
            color: var(--text-primary);
          }

          .file-size {
            font-size: 0.75rem;
            color: var(--text-muted);
          }
        }
      }

      .status-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
    }

    .paste-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
      background: var(--bg-card);
      border-radius: var(--radius-lg);

      .paste-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        flex-wrap: wrap;

        h3 { font-size: 1.15rem; margin-bottom: 0.25rem; }
        p { font-size: 0.8125rem; color: var(--text-muted); }

        .text-counts {
          font-size: 0.75rem;
          color: var(--text-secondary);
          display: flex;
          gap: 0.5rem;
          align-items: center;
          font-family: var(--font-mono);
          background: var(--bg-secondary);
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-sm);
        }
      }

      .resume-textarea {
        width: 100%;
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 1rem;
        font-family: inherit;
        font-size: 0.875rem;
        line-height: 1.6;
        resize: vertical;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
      }

      .paste-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;

        .actions-left {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
      }
    }

    .privacy-banner {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: var(--bg-secondary);
      border-left: 3px solid var(--accent-primary);
      padding: 1.25rem 1.5rem;

      h4 { font-size: 0.9375rem; margin-bottom: 0.25rem; }
      p { font-size: 0.8125rem; line-height: 1.5; }
      code {
        font-family: var(--font-mono);
        color: var(--accent-secondary);
        font-size: 0.75rem;
      }
    }

    .ocr-progress-card {
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: var(--radius-lg);
      box-shadow: 0 8px 24px -4px rgba(99, 102, 241, 0.2);

      .ocr-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;

        .ocr-badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;

          .ocr-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            font-weight: 700;
            color: #818cf8;
            text-transform: uppercase;
            letter-spacing: 0.05em;

            .pulsing-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #818cf8;
              box-shadow: 0 0 10px #818cf8;
              animation: pulse-dot 1.5s infinite ease-in-out;
            }
          }

          .ocr-tag {
            font-size: 0.6875rem;
            font-family: var(--font-mono);
            color: var(--text-muted);
            background: rgba(255, 255, 255, 0.05);
            padding: 0.125rem 0.5rem;
            border-radius: 4px;
          }
        }

        h4 {
          font-size: 1.125rem;
          color: var(--text-primary);
          font-weight: 700;
          margin: 0;
        }

        .ocr-status-live {
          font-size: 0.875rem;
          color: var(--accent-primary);
          font-weight: 500;
          margin: 0;
        }
      }

      .ocr-scan-bar {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 9999px;
        overflow: hidden;
        position: relative;
        margin-bottom: 0.75rem;

        .scan-beam {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 35%;
          background: linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, #c084fc 100%);
          border-radius: 9999px;
          animation: scan-sweep 1.8s infinite ease-in-out;
        }
      }

      .ocr-hint {
        font-size: 0.8125rem;
        color: var(--text-muted);
      }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes scan-sweep {
      0% { left: -35%; }
      50% { left: 100%; }
      100% { left: -35%; }
    }

    @keyframes pulse-dot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.4; }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .resume-view {
        gap: 1.25rem;
      }

      .drop-zone {
        padding: 2.25rem 1rem;
      }

      .mode-tabs {
        flex-direction: column;
        gap: 0.5rem;

        .tab-btn {
          width: 100%;
          justify-content: center;
        }
      }

      .resume-status-card {
        padding: 1.25rem 1rem;

        .status-actions {
          width: 100%;

          .btn {
            flex: 1 1 auto;
            justify-content: center;
          }
        }
      }

      .paste-actions {
        .actions-left {
          width: 100%;

          .btn {
            flex: 1 1 auto;
            justify-content: center;
          }
        }
      }
    }
  `]
})
export class ResumeUploadComponent implements OnInit {
  resumeApi = inject(ResumeApiService);
  state = inject(PortfolioStateService);
  notify = inject(NotificationService);
  ocrService = inject(OcrTextExtractorService);
  router = inject(Router);

  activeTab = signal<'upload' | 'paste'>('upload');
  pastedText = signal<string>('');
  isDragging = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  isAnalyzing = signal<boolean>(false);
  isOcrRunning = signal<boolean>(false);
  ocrStatus = signal<string>('');
  resumeInfo = signal<StoredResumeInfo | null>(null);
  extractionErrorMessage = signal<string | null>(null);

  private lastSelectedFile: File | null = null;

  ngOnInit(): void {
    this.loadResumeInfo();
  }

  loadResumeInfo(): void {
    this.resumeApi.getInfo().subscribe({
      next: res => {
        if (res.success && res.data) {
          this.resumeInfo.set(res.data);
        }
      }
    });
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.extractionErrorMessage.set(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validFormats = ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'webp'];
    if (!ext || !validFormats.includes(ext)) {
      this.notify.error('Supported document formats: PDF (digital or scanned/photos), DOCX, TXT, PNG, and JPG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.notify.error('File exceeds maximum 10MB size limit.');
      return;
    }

    this.lastSelectedFile = file;
    this.isUploading.set(true);
    this.resumeApi.upload(file).subscribe({
      next: res => {
        this.isUploading.set(false);
        if (res.success) {
          this.notify.success('Resume uploaded successfully.');
          this.loadResumeInfo();
        }
      },
      error: err => {
        this.isUploading.set(false);
        this.notify.error(err.error?.message || 'Upload failed.');
      }
    });
  }

  analyzeAndBuild(): void {
    this.isAnalyzing.set(true);
    this.extractionErrorMessage.set(null);
    this.resumeApi.analyze(true).subscribe({
      next: res => {
        this.isAnalyzing.set(false);
        if (res.success) {
          if (res.data?.portfolio) {
            this.state.portfolio.set(res.data.portfolio);
          } else {
            this.state.loadPortfolio();
          }
          this.notify.success('AI has successfully built your portfolio from your resume!');
          this.router.navigate(['/dashboard/overview']);
        }
      },
      error: err => {
        this.isAnalyzing.set(false);
        const msg = err.error?.message || 'AI document analysis failed.';
        const isScanned =
          err.error?.errorCode === 'SCANNED_DOCUMENT_NOT_SUPPORTED' ||
          err.error?.errorCode === 'TEXT_EXTRACTION_FAILED' ||
          msg.includes('scanned image') ||
          msg.includes('without selectable text') ||
          msg.includes('Unable to read any text');

        if (isScanned) {
          this.triggerOcrExtraction(true);
          return;
        }

        this.extractionErrorMessage.set(msg);
        this.notify.error(msg);
      }
    });
  }

  analyzeAndReview(): void {
    this.isAnalyzing.set(true);
    this.extractionErrorMessage.set(null);
    this.resumeApi.analyze(false).subscribe({
      next: res => {
        this.isAnalyzing.set(false);
        if (res.success) {
          this.notify.success('Resume analyzed! Review suggestions below.');
          this.router.navigate(['/dashboard/ai-review']);
        }
      },
      error: err => {
        this.isAnalyzing.set(false);
        const msg = err.error?.message || 'AI document analysis failed.';
        const isScanned =
          err.error?.errorCode === 'SCANNED_DOCUMENT_NOT_SUPPORTED' ||
          err.error?.errorCode === 'TEXT_EXTRACTION_FAILED' ||
          msg.includes('scanned image') ||
          msg.includes('without selectable text') ||
          msg.includes('Unable to read any text');

        if (isScanned) {
          this.triggerOcrExtraction(false);
          return;
        }

        this.extractionErrorMessage.set(msg);
        this.notify.error(msg);
      }
    });
  }

  async triggerOcrExtraction(autoBuild: boolean = true): Promise<void> {
    this.isOcrRunning.set(true);
    this.isAnalyzing.set(true);
    this.extractionErrorMessage.set(null);
    this.ocrStatus.set('Scanned / image-based document detected. Initializing built-in OCR...');

    try {
      let fileToOcr: File | null = this.lastSelectedFile;

      if (!fileToOcr) {
        this.ocrStatus.set('Downloading document for OCR processing...');
        const blob = await firstValueFrom(this.resumeApi.downloadBlob());
        const fileName = this.resumeInfo()?.fileName || 'resume.pdf';
        fileToOcr = new File([blob], fileName, { type: blob.type || 'application/pdf' });
      }

      const extractedText = await this.ocrService.extractText(fileToOcr, status => {
        this.ocrStatus.set(status);
      });

      if (!extractedText || extractedText.trim().length < 30) {
        this.isOcrRunning.set(false);
        this.isAnalyzing.set(false);
        this.extractionErrorMessage.set('The document is low resolution or did not contain readable characters. Please paste your details in the text tab.');
        this.notify.warning('Could not detect clear text with OCR. Please paste your details directly.');
        this.switchToPaste();
        return;
      }

      const wordCount = extractedText.trim().split(/\s+/).length;
      this.ocrStatus.set(`Successfully extracted ${wordCount} words from document. Building portfolio...`);
      this.pastedText.set(extractedText);

      this.resumeApi.analyzeText(extractedText, autoBuild).subscribe({
        next: res => {
          this.isOcrRunning.set(false);
          this.isAnalyzing.set(false);
          if (res.success) {
            if (autoBuild) {
              if (res.data?.portfolio) {
                this.state.portfolio.set(res.data.portfolio);
              } else {
                this.state.loadPortfolio();
              }
              this.notify.success('AI successfully extracted text using OCR and built your portfolio!');
              this.router.navigate(['/dashboard/overview']);
            } else {
              this.notify.success('Resume text extracted via OCR! Review your details.');
              this.router.navigate(['/dashboard/ai-review']);
            }
          }
        },
        error: analyzeErr => {
          this.isOcrRunning.set(false);
          this.isAnalyzing.set(false);
          this.notify.info('OCR extracted text successfully! Review and edit in the text tab.');
          this.switchToPaste();
        }
      });
    } catch (ocrErr: any) {
      console.error('OCR Extraction Exception:', ocrErr);
      this.isOcrRunning.set(false);
      this.isAnalyzing.set(false);
      const errMsg = ocrErr?.message || 'OCR extraction could not be completed.';
      this.extractionErrorMessage.set(errMsg + ' You can use the Paste Resume Text tab to enter your details.');
      this.notify.warning(`OCR note: ${errMsg.slice(0, 75)}. Switching to text tab...`);
      this.switchToPaste();
    }
  }

  analyzePastedText(autoBuild: boolean): void {
    const text = this.pastedText().trim();
    if (text.length < 30) {
      this.notify.error('Please paste comprehensive resume text (minimum 30 characters).');
      return;
    }

    this.isAnalyzing.set(true);
    this.resumeApi.analyzeText(text, autoBuild).subscribe({
      next: res => {
        this.isAnalyzing.set(false);
        if (res.success) {
          if (autoBuild) {
            if (res.data?.portfolio) {
              this.state.portfolio.set(res.data.portfolio);
            } else {
              this.state.loadPortfolio();
            }
            this.notify.success('AI has successfully built your portfolio from your pasted resume text!');
            this.router.navigate(['/dashboard/overview']);
          } else {
            this.notify.success('Resume text analyzed! Review suggestions below.');
            this.router.navigate(['/dashboard/ai-review']);
          }
        }
      },
      error: err => {
        this.isAnalyzing.set(false);
        this.notify.error(err.error?.message || 'Failed to analyze resume text.');
      }
    });
  }

  switchToPaste(): void {
    this.activeTab.set('paste');
  }

  deleteResume(): void {
    this.resumeApi.delete().subscribe({
      next: () => {
        this.resumeInfo.set(null);
        this.lastSelectedFile = null;
        this.extractionErrorMessage.set(null);
        this.notify.info('Resume deleted.');
      }
    });
  }

  getWordCount(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
