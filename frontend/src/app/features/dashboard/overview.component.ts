import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioStateService } from '../../core/services/portfolio-state.service';
import { AuthService } from '../../core/auth/auth.service';
import { PortfolioApiService } from '../../core/services/portfolio-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/components/icon.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink, IconComponent, FormsModule],
  template: `
    <div class="overview-view">
      <!-- Welcome Banner -->
      <div class="welcome-card card">
        <div class="welcome-text">
          <h1>Welcome back, {{ authService.currentUser()?.name }} 👋</h1>
          <p>Your AI-powered portfolio is structured, safely stored in JSON files, and ready to share.</p>
        </div>

        <!-- Completion Meter -->
        <div class="completion-box">
          <div class="completion-header">
            <span class="label">Portfolio Completion</span>
            <span class="percent">{{ state.completionPercentage() }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" [style.width.%]="state.completionPercentage()"></div>
          </div>
        </div>

        <!-- Quick Actions Row -->
        <div class="quick-actions">
          <a routerLink="/dashboard/editor/personal-info" class="btn btn-secondary">
            <app-icon name="edit" [size]="16" />
            <span>Edit Portfolio</span>
          </a>
          <a routerLink="/dashboard/resume" class="btn btn-secondary">
            <app-icon name="upload" [size]="16" />
            <span>Upload Resume</span>
          </a>
          <a routerLink="/dashboard/preview" class="btn btn-secondary">
            <app-icon name="eye" [size]="16" />
            <span>Preview</span>
          </a>
          <button class="btn btn-primary" (click)="openPublishModal()">
            <app-icon name="globe" [size]="16" />
            <span>{{ state.portfolio()?.publication?.isPublished ? 'Manage Publishing' : 'Publish' }}</span>
          </button>
        </div>
      </div>

      <!-- Publishing Status & Slug Management -->
      <div class="grid-2">
        <div class="card pub-card">
          <div class="card-header">
            <div class="title-with-icon">
              <app-icon name="globe" [size]="20" />
              <h3>Publication Status</h3>
            </div>
            @if (state.portfolio()?.publication?.isPublished) {
              <span class="badge badge-success">✓ Published</span>
            } @else {
              <span class="badge badge-warning">● Draft</span>
            }
          </div>

          @if (state.portfolio()?.publication?.isPublished) {
            <div class="pub-details">
              <p class="pub-desc">Your portfolio is currently accessible publicly online:</p>
              <div class="pub-url-box">
                <span class="url-text">http://localhost:4200/u/{{ state.portfolio()?.publication?.slug }}</span>
                <div class="box-actions">
                  <button class="btn btn-sm btn-secondary" (click)="copyPublicUrl()" title="Copy Link">
                    <app-icon name="copy" [size]="14" />
                    <span>Copy</span>
                  </button>
                  <a [routerLink]="['/u', state.portfolio()?.publication?.slug]" target="_blank" class="btn btn-sm btn-primary">
                    <app-icon name="external" [size]="14" />
                    <span>Open</span>
                  </a>
                </div>
              </div>
              <div class="unpublish-row">
                <button class="btn btn-sm btn-outline" (click)="handleUnpublish()" [disabled]="isPublishing()">
                  <span>Unpublish Portfolio</span>
                </button>
              </div>
            </div>
          } @else {
            <div class="draft-details">
              <p>Your portfolio is currently in private draft mode. Publish to get your shareable link.</p>
              <div class="slug-input-group">
                <span class="url-prefix">localhost:4200/u/</span>
                <input
                  type="text"
                  class="input-control slug-input"
                  [(ngModel)]="customSlug"
                  placeholder="your-name"
                  (input)="onSlugInput()"
                />
              </div>
              <div class="slug-feedback">
                @if (slugChecking()) {
                  <span class="hint checking">Checking slug availability...</span>
                } @else if (slugAvailable() === true) {
                  <span class="hint available">✓ Slug is available!</span>
                } @else if (slugAvailable() === false) {
                  <span class="hint error">✗ Slug is reserved or already taken.</span>
                }
              </div>
              <button
                class="btn btn-primary"
                (click)="handlePublish()"
                [disabled]="isPublishing() || slugAvailable() === false"
              >
                <app-icon name="sparkles" [size]="16" />
                <span>{{ isPublishing() ? 'Publishing...' : 'Publish to Live URL' }}</span>
              </button>
            </div>
          }
        </div>

        <!-- Architecture & Storage Info -->
        <div class="card storage-info-card">
          <div class="card-header">
            <div class="title-with-icon">
              <app-icon name="shield" [size]="20" />
              <h3>Database-Free Architecture</h3>
            </div>
            <span class="badge badge-primary">JSON Engine</span>
          </div>

          <p class="desc">
            PortfolioAI operates with strict <strong>zero-database persistence</strong>. All your profiles,
            resumes, and themes are stored as structured JSON files directly under your authenticated ID:
          </p>

          <div class="path-display">
            <code>/storage/users/{{ authService.currentUser()?.userId }}/portfolio.json</code>
          </div>

          <div class="metrics-grid">
            <div class="metric">
              <span class="val">{{ state.portfolio()?.skills?.length || 0 }}</span>
              <span class="lbl">Skills</span>
            </div>
            <div class="metric">
              <span class="val">{{ state.portfolio()?.experience?.length || 0 }}</span>
              <span class="lbl">Experiences</span>
            </div>
            <div class="metric">
              <span class="val">{{ state.portfolio()?.projects?.length || 0 }}</span>
              <span class="lbl">Projects</span>
            </div>
            <div class="metric">
              <span class="val">{{ state.portfolio()?.theme?.name || 'developer' }}</span>
              <span class="lbl">Active Theme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-view {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .welcome-card {
      padding: 2.25rem;
      background: radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.12) 0%, var(--bg-card) 60%);

      h1 {
        font-size: 1.875rem;
        margin-bottom: 0.5rem;
      }

      p {
        font-size: 1rem;
        color: var(--text-secondary);
        max-width: 680px;
      }
    }

    .completion-box {
      margin: 1.75rem 0;
      max-width: 480px;

      .completion-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.8125rem;
        font-weight: 600;

        .percent {
          color: var(--accent-primary);
        }
      }

      .progress-track {
        height: 8px;
        background: var(--bg-elevated);
        border-radius: var(--radius-full);
        overflow: hidden;

        .progress-bar {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }
      }
    }

    .quick-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 1.5rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;

      .title-with-icon {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        color: var(--accent-primary);

        h3 {
          font-size: 1.125rem;
          color: var(--text-primary);
        }
      }
    }

    .pub-details, .draft-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .pub-url-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);

      .url-text {
        font-family: var(--font-mono);
        font-size: 0.8125rem;
        color: var(--accent-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .box-actions {
        display: flex;
        gap: 0.5rem;
      }
    }

    .slug-input-group {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
      overflow: hidden;

      .url-prefix {
        padding: 0 0.75rem;
        font-family: var(--font-mono);
        font-size: 0.8125rem;
        color: var(--text-muted);
        background: var(--bg-elevated);
        border-right: 1px solid var(--border-color);
        line-height: 2.5rem;
      }

      .slug-input {
        border: none;
        background: transparent;
        border-radius: 0;
        font-family: var(--font-mono);
        &:focus { box-shadow: none; }
      }
    }

    .slug-feedback {
      min-height: 1.25rem;
      font-size: 0.75rem;

      .hint {
        &.available { color: var(--success); }
        &.error { color: var(--error); }
        &.checking { color: var(--warning); }
      }
    }

    .path-display {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 0.625rem 0.875rem;
      border-radius: var(--radius-md);
      margin: 1rem 0;

      code {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--accent-secondary);
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-top: 1rem;

      .metric {
        background: var(--bg-elevated);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 0.75rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .val {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .lbl {
          font-size: 0.6875rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
      }
    }
  `]
})
export class OverviewComponent {
  authService = inject(AuthService);
  state = inject(PortfolioStateService);
  api = inject(PortfolioApiService);
  notify = inject(NotificationService);

  customSlug = 'sudhir-raj';
  slugChecking = signal<boolean>(false);
  slugAvailable = signal<boolean | null>(null);
  isPublishing = signal<boolean>(false);

  openPublishModal(): void {
    const slug = this.state.portfolio()?.publication?.slug || 'sudhir-raj';
    this.customSlug = slug;
  }

  onSlugInput(): void {
    const slug = this.customSlug.trim().toLowerCase();
    if (slug.length < 3) {
      this.slugAvailable.set(null);
      return;
    }

    this.slugChecking.set(true);
    this.api.checkSlugAvailability(slug, this.authService.currentUser()?.userId).subscribe({
      next: res => {
        this.slugChecking.set(false);
        this.slugAvailable.set(res.data?.available ?? false);
      },
      error: () => {
        this.slugChecking.set(false);
      }
    });
  }

  handlePublish(): void {
    const slug = this.customSlug.trim().toLowerCase();
    if (!slug) return;

    this.isPublishing.set(true);
    this.api.publish(slug).subscribe({
      next: res => {
        this.isPublishing.set(false);
        if (res.success && res.data) {
          this.state.updatePortfolio(p => {
            p.publication = res.data!;
            return p;
          }, false);
          this.notify.success('Portfolio successfully published online!');
        }
      },
      error: err => {
        this.isPublishing.set(false);
        this.notify.error(err.error?.message || 'Failed to publish portfolio.');
      }
    });
  }

  handleUnpublish(): void {
    this.isPublishing.set(true);
    this.api.unpublish().subscribe({
      next: res => {
        this.isPublishing.set(false);
        if (res.success && res.data) {
          this.state.updatePortfolio(p => {
            p.publication = res.data!;
            return p;
          }, false);
          this.notify.info('Portfolio unpublished. Link is now private.');
        }
      },
      error: () => {
        this.isPublishing.set(false);
        this.notify.error('Failed to unpublish portfolio.');
      }
    });
  }

  copyPublicUrl(): void {
    const slug = this.state.portfolio()?.publication?.slug;
    if (!slug) return;
    const url = `${window.location.origin}/u/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      this.notify.success('Public URL copied to clipboard!');
    });
  }
}
