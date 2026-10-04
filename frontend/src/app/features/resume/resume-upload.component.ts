import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResumeApiService, StoredResumeInfo } from '../../core/services/resume-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="resume-view">
      <div class="view-header">
        <h2>Build Your Portfolio From Your Resume</h2>
        <p>Upload a PDF or DOCX resume. Our AI extraction engine will read the document and prepare structured suggestions for you to review.</p>
      </div>

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
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              (change)="onFileSelected($event)"
              hidden
            />
          </label>

          <span class="file-hint">Supported formats: PDF / DOCX • Max size: 10MB</span>
        </div>
      </div>

      <!-- Uploading / Processing Progress Indicator -->
      @if (isUploading()) {
        <div class="upload-progress card animate-fade-in">
          <div class="progress-info">
            <app-icon name="refresh" [size]="18" customClass="spinning" />
            <span>Securely uploading and verifying document headers...</span>
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
              (click)="analyzeWithAi()"
              [disabled]="isAnalyzing()"
            >
              <app-icon name="sparkles" [size]="18" />
              <span>{{ isAnalyzing() ? 'AI Parsing Document...' : 'Analyze with AI' }}</span>
            </button>

            <a [href]="resumeApi.downloadUrl()" target="_blank" class="btn btn-secondary btn-sm" title="Download current resume">
              <app-icon name="external" [size]="14" />
              <span>Download</span>
            </a>

            <button class="btn btn-ghost btn-sm" (click)="deleteResume()" title="Delete resume file">
              <app-icon name="trash" [size]="14" />
              <span>Delete</span>
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
      p { font-size: 0.9375rem; }
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

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ResumeUploadComponent implements OnInit {
  resumeApi = inject(ResumeApiService);
  notify = inject(NotificationService);
  router = inject(Router);

  isDragging = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  isAnalyzing = signal<boolean>(false);
  resumeInfo = signal<StoredResumeInfo | null>(null);

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
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      this.notify.error('Only PDF and DOCX documents are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.notify.error('File exceeds maximum 10MB size limit.');
      return;
    }

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

  analyzeWithAi(): void {
    this.isAnalyzing.set(true);
    this.resumeApi.analyze().subscribe({
      next: res => {
        this.isAnalyzing.set(false);
        if (res.success) {
          this.notify.success('Resume analyzed by AI! Review the suggestions below.');
          this.router.navigate(['/dashboard/ai-review']);
        }
      },
      error: err => {
        this.isAnalyzing.set(false);
        this.notify.error(err.error?.message || 'AI document analysis failed.');
      }
    });
  }

  deleteResume(): void {
    this.resumeApi.delete().subscribe({
      next: () => {
        this.resumeInfo.set(null);
        this.notify.info('Resume deleted.');
      }
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
