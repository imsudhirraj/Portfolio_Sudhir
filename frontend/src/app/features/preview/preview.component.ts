import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioStateService } from '../../core/services/portfolio-state.service';
import { PortfolioRendererComponent } from '../../shared/components/portfolio-renderer.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-live-preview',
  standalone: true,
  imports: [RouterLink, PortfolioRendererComponent, IconComponent],
  template: `
    <div class="preview-page">
      <!-- Toolbar -->
      <div class="preview-toolbar card">
        <div class="toolbar-left">
          <span class="preview-label">Live Preview Mode:</span>
          <div class="device-switcher">
            <button
              class="device-btn"
              [class.active]="state.previewDevice() === 'desktop'"
              (click)="state.setPreviewDevice('desktop')"
              title="Desktop View (100%)"
            >
              <app-icon name="layout" [size]="16" />
              <span>Desktop</span>
            </button>
            <button
              class="device-btn"
              [class.active]="state.previewDevice() === 'tablet'"
              (click)="state.setPreviewDevice('tablet')"
              title="Tablet View (768px)"
            >
              <span>Tablet (768px)</span>
            </button>
            <button
              class="device-btn"
              [class.active]="state.previewDevice() === 'mobile'"
              (click)="state.setPreviewDevice('mobile')"
              title="Mobile View (375px)"
            >
              <span>Mobile (375px)</span>
            </button>
          </div>
        </div>

        <div class="toolbar-right">
          <span class="theme-tag">
            Theme: <strong>{{ state.portfolio()?.theme?.name || 'developer' }}</strong>
          </span>

          <a routerLink="/dashboard/themes" class="btn btn-secondary btn-sm">
            <app-icon name="palette" [size]="14" />
            <span>Change Theme</span>
          </a>

          @if (state.portfolio()?.publication?.isPublished) {
            <a
              [routerLink]="['/u', state.portfolio()?.publication?.slug]"
              target="_blank"
              class="btn btn-primary btn-sm"
            >
              <app-icon name="external" [size]="14" />
              <span>Open Public URL</span>
            </a>
          }
        </div>
      </div>

      <!-- Preview Frame Viewport -->
      <div class="viewport-stage">
        <div class="viewport-container" [class]="'viewport-' + state.previewDevice()">
          <div class="device-chrome">
            <div class="chrome-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="chrome-title">
              portfolioai.com/u/{{ state.portfolio()?.publication?.slug || 'preview' }}
            </div>
          </div>

          <div class="viewport-canvas-wrapper">
            <app-portfolio-renderer [data]="state.portfolio()" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      height: 100%;
    }

    .preview-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;

      .toolbar-left, .toolbar-right {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .preview-label {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-muted);
      }
    }

    .device-switcher {
      display: flex;
      background: var(--bg-elevated);
      padding: 0.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);

      .device-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 6px;
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--text-primary);
        }

        &.active {
          background: var(--bg-primary);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }
      }
    }

    .theme-tag {
      font-size: 0.8125rem;
      color: var(--text-muted);
      strong {
        color: var(--accent-primary);
        text-transform: capitalize;
      }
    }

    .viewport-stage {
      flex: 1;
      display: flex;
      justify-content: center;
      padding: 1.5rem 0;
      background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 80%);
      overflow-x: auto;
    }

    .viewport-container {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), var(--shadow-glow);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;

      &.viewport-desktop {
        width: 100%;
        max-width: 1200px;
      }

      &.viewport-tablet {
        width: 768px;
      }

      &.viewport-mobile {
        width: 375px;
      }
    }

    .device-chrome {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.625rem 1rem;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);

      .chrome-dots {
        display: flex;
        gap: 0.375rem;
        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          &.red { background: #ef4444; }
          &.yellow { background: #f59e0b; }
          &.green { background: #10b981; }
        }
      }

      .chrome-title {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .viewport-canvas-wrapper {
      flex: 1;
      overflow-y: auto;
      max-height: 80vh;
    }
  `]
})
export class LivePreviewComponent {
  state = inject(PortfolioStateService);
}
