import { createWorker } from 'tesseract.js';

async function test() {
  console.log('Testing createWorker with node...');
  try {
    const worker = await createWorker('eng', 1, {
      langPath: 'http://localhost:5000/tessdata',
      logger: m => console.log('Tesseract progress:', m)
    });
    console.log('Worker initialized successfully!');
    await worker.terminate();
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
