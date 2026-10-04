import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { ResumeApiService } from '../../core/services/resume-api.service';
import { AiApiService } from '../../core/services/ai-api.service';
import { PortfolioApiService } from '../../core/services/portfolio-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserSettings } from '../../core/models/settings.model';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="settings-view">
      <div class="view-header">
        <h2>Settings & Privacy</h2>
        <p>Manage your account preferences, document storage privacy, and zero-database data lifecycle.</p>
      </div>

      <!-- Appearance -->
      <div class="settings-card card">
        <div class="card-title-row">
          <app-icon name="sun" [size]="20" />
          <h3>Interface Appearance</h3>
        </div>
        <p class="section-desc">Select how PortfolioAI looks on your device.</p>

        <div class="theme-options-grid">
          <label class="theme-option" [class.selected]="settings.themeMode === 'dark'">
            <input type="radio" name="themeMode" value="dark" [(ngModel)]="settings.themeMode" (ngModelChange)="onThemeModeChange()" />
            <div class="option-content">
              <strong>Dark Mode (Default)</strong>
              <span>High contrast, low eyestrain dark slate aesthetic</span>
            </div>
          </label>

          <label class="theme-option" [class.selected]="settings.themeMode === 'light'">
            <input type="radio" name="themeMode" value="light" [(ngModel)]="settings.themeMode" (ngModelChange)="onThemeModeChange()" />
            <div class="option-content">
              <strong>Light Mode</strong>
              <span>Clean, crisp white and slate styling</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Resume Privacy -->
      <div class="settings-card card">
        <div class="card-title-row">
          <app-icon name="shield" [size]="20" />
          <h3>Resume & Document Privacy</h3>
        </div>
        <p class="section-desc">Control automated document retention and manual file purges.</p>

        <label class="checkbox-row">
          <input
            type="checkbox"
            [(ngModel)]="settings.autoDeleteResumeAfterAnalysis"
            (ngModelChange)="saveSettings()"
          />
          <div class="checkbox-label">
            <strong>Delete resume file immediately after AI analysis</strong>
            <span>When enabled, the server extracts resume text for parsing, then automatically deletes the original PDF/DOCX file from disk.</span>
          </div>
        </label>

        <div class="danger-actions-row">
          <button class="btn btn-secondary btn-sm" (click)="deleteResumeFile()">
            <app-icon name="trash" [size]="14" />
            <span>Purge Uploaded Resume File</span>
          </button>
          <button class="btn btn-secondary btn-sm" (click)="deleteAiAnalysis()">
            <app-icon name="trash" [size]="14" />
            <span>Purge AI Analysis Cache</span>
          </button>
        </div>
      </div>

      <!-- Account Deletion -->
      <div class="settings-card card danger-zone">
        <div class="card-title-row">
          <app-icon name="trash" [size]="20" />
          <h3 class="danger-title">Delete Account & All Data</h3>
        </div>
        <p class="section-desc">
          Permanently eradicate your entire personal storage folder (<code>/storage/users/&#123;id&#125;/</code>) and release your public slug.
        </p>

        <button class="btn btn-danger" (click)="showDeleteModal.set(true)">
          <span>Delete Account</span>
        </button>
      </div>

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="modal-overlay animate-fade-in">
          <div class="modal-dialog card">
            <div class="modal-header">
              <div class="badge badge-error">Irreversible Action</div>
              <h3>Delete Account and All Data?</h3>
            </div>

            <div class="modal-body">
              <p>This will permanently and irreversibly delete:</p>
              <ul class="delete-checklist">
                <li>✓ Complete Portfolio data (portfolio.json)</li>
                <li>✓ Stored resume file (resume.pdf / docx)</li>
                <li>✓ AI analysis history (latest-analysis.json)</li>
                <li>✓ Custom URL slug registration (slugs.json)</li>
                <li>✓ User settings and entire disk folder</li>
              </ul>
              <p class="warning-text">This action cannot be undone. All your files will be purged from the server filesystem immediately.</p>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="showDeleteModal.set(false)" [disabled]="isDeletingAccount()">
                <span>Cancel</span>
              </button>
              <button class="btn btn-danger" (click)="confirmAccountDeletion()" [disabled]="isDeletingAccount()">
                <span>{{ isDeletingAccount() ? 'Deleting Everything...' : 'Delete Everything' }}</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .settings-view {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      max-width: 840px;
    }

    .view-header {
      h2 { font-size: 1.625rem; margin-bottom: 0.375rem; }
      p { font-size: 0.9375rem; }
    }

    .settings-card {
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      &.danger-zone {
        border-color: rgba(239, 68, 68, 0.3);
        background: rgba(239, 68, 68, 0.03);
      }
    }

    .card-title-row {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      color: var(--accent-primary);

      h3 { font-size: 1.125rem; color: var(--text-primary); }
      .danger-title { color: var(--error); }
    }

    .section-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: -0.5rem;
    }

    .theme-options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .theme-option {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &.selected {
        border-color: var(--accent-primary);
        background: rgba(99, 102, 241, 0.1);
      }

      input { margin-top: 0.25rem; accent-color: var(--accent-primary); }

      .option-content {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;

        strong { font-size: 0.875rem; }
        span { font-size: 0.75rem; color: var(--text-muted); }
      }
    }

    .checkbox-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;

      input { margin-top: 0.25rem; accent-color: var(--accent-primary); }

      .checkbox-label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        strong { font-size: 0.875rem; }
        span { font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; }
      }
    }

    .danger-actions-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-dialog {
      width: 100%;
      max-width: 480px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      background: var(--bg-primary);
      border: 1px solid rgba(239, 68, 68, 0.4);

      h3 { font-size: 1.25rem; margin-top: 0.5rem; }
    }

    .delete-checklist {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 1rem 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .warning-text {
      font-size: 0.8125rem;
      color: var(--error);
      font-weight: 500;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `]
})
export class SettingsComponent implements OnInit {
  themeService = inject(ThemeService);
  resumeApi = inject(ResumeApiService);
  aiApi = inject(AiApiService);
  portfolioApi = inject(PortfolioApiService);
  authService = inject(AuthService);
  notify = inject(NotificationService);
  router = inject(Router);

  settings: UserSettings = {
    themeMode: 'dark',
    autoDeleteResumeAfterAnalysis: false,
    emailNotifications: true
  };

  showDeleteModal = signal<boolean>(false);
  isDeletingAccount = signal<boolean>(false);

  ngOnInit(): void {
    this.themeService.loadServerSettings().subscribe({
      next: res => {
        if (res.success && res.data) {
          this.settings = res.data;
        }
      }
    });
  }

  onThemeModeChange(): void {
    if (this.settings.themeMode === 'light' || this.settings.themeMode === 'dark') {
      this.themeService.setTheme(this.settings.themeMode);
    }
    this.saveSettings();
  }

  saveSettings(): void {
    this.themeService.saveServerSettings(this.settings).subscribe({
      next: () => {
        this.notify.success('Settings updated.');
      }
    });
  }

  deleteResumeFile(): void {
    this.resumeApi.delete().subscribe({
      next: () => {
        this.notify.success('Resume file deleted from server.');
      }
    });
  }

  deleteAiAnalysis(): void {
    this.aiApi.deleteAnalysis().subscribe({
      next: () => {
        this.notify.success('AI analysis cache deleted from server.');
      }
    });
  }

  confirmAccountDeletion(): void {
    this.isDeletingAccount.set(true);
    this.themeService.deleteAccount().subscribe({
      next: () => {
        this.isDeletingAccount.set(false);
        this.showDeleteModal.set(false);
        this.notify.info('Account and all associated files deleted.');
        this.authService.logout();
      },
      error: () => {
        this.isDeletingAccount.set(false);
        this.notify.error('Failed to delete account.');
      }
    });
  }
}
