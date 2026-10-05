import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioStateService } from '../../core/services/portfolio-state.service';

@Component({
  selector: 'app-themes-picker',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="themes-view">
      <div class="view-header">
        <h2>Theme & Design Studio</h2>
        <p>Switch between 4 professional presentation themes and customize design tokens. Content remains completely untouched.</p>
      </div>

      <!-- Theme Cards Selection -->
      <div class="themes-grid">
        <div
          class="theme-card card"
          [class.active]="state.portfolio()?.theme?.name === 'developer'"
          (click)="setThemeName('developer')"
        >
          <div class="theme-preview-box dev-preview">
            <span class="preview-tag">Engineering</span>
            <div class="preview-mini-title">Developer Theme</div>
            <div class="code-lines">
              <span class="line"></span>
              <span class="line short"></span>
            </div>
          </div>
          <div class="theme-card-info">
            <div class="theme-title-row">
              <h4>Developer</h4>
              @if (state.portfolio()?.theme?.name === 'developer') {
                <span class="badge badge-primary">Active</span>
              }
            </div>
            <p>Modern engineering portfolio with terminal accents, technology tags, and sleek dark aesthetic.</p>
          </div>
        </div>

        <div
          class="theme-card card"
          [class.active]="state.portfolio()?.theme?.name === 'minimal'"
          (click)="setThemeName('minimal')"
        >
          <div class="theme-preview-box min-preview">
            <span class="preview-tag">Recruiter-Focused</span>
            <div class="preview-mini-title">Minimal Theme</div>
            <div class="code-lines">
              <span class="line"></span>
              <span class="line short"></span>
            </div>
          </div>
          <div class="theme-card-info">
            <div class="theme-title-row">
              <h4>Minimal</h4>
              @if (state.portfolio()?.theme?.name === 'minimal') {
                <span class="badge badge-primary">Active</span>
              }
            </div>
            <p>Monochrome, ultra-clean, high-contrast layout favored by executive recruiters and HR screeners.</p>
          </div>
        </div>

        <div
          class="theme-card card"
          [class.active]="state.portfolio()?.theme?.name === 'executive'"
          (click)="setThemeName('executive')"
        >
          <div class="theme-preview-box exec-preview">
            <span class="preview-tag">Corporate</span>
            <div class="preview-mini-title">Executive Theme</div>
            <div class="code-lines">
              <span class="line"></span>
              <span class="line short"></span>
            </div>
          </div>
          <div class="theme-card-info">
            <div class="theme-title-row">
              <h4>Executive</h4>
              @if (state.portfolio()?.theme?.name === 'executive') {
                <span class="badge badge-primary">Active</span>
              }
            </div>
            <p>Deep navy and slate palette with refined serif headings suited for senior leaders and directors.</p>
          </div>
        </div>

        <div
          class="theme-card card"
          [class.active]="state.portfolio()?.theme?.name === 'elegant'"
          (click)="setThemeName('elegant')"
        >
          <div class="theme-preview-box eleg-preview">
            <span class="preview-tag">Editorial</span>
            <div class="preview-mini-title">Elegant Theme</div>
            <div class="code-lines">
              <span class="line"></span>
              <span class="line short"></span>
            </div>
          </div>
          <div class="theme-card-info">
            <div class="theme-title-row">
              <h4>Elegant</h4>
              @if (state.portfolio()?.theme?.name === 'elegant') {
                <span class="badge badge-primary">Active</span>
              }
            </div>
            <p>Warm paper tones and sophisticated literary typography for creative technologists and researchers.</p>
          </div>
        </div>
      </div>

      <!-- Color & Typography Customizer Box -->
      @if (state.portfolio()?.theme; as t) {
        <div class="customizer-box card">
          <h3>Design Customization</h3>
          <p class="customizer-desc">Tailor accent colors, typography, and card radiuses to fit your personal brand.</p>

          <div class="controls-grid">
            <!-- Primary Color -->
            <div class="control-group">
              <label>Primary Brand Color</label>
              <div class="color-picker-row">
                <input
                  type="color"
                  class="color-input"
                  [(ngModel)]="t.primaryColor"
                  (ngModelChange)="onModelChange()"
                />
                <input
                  type="text"
                  class="input-control hex-input"
                  [(ngModel)]="t.primaryColor"
                  (ngModelChange)="onModelChange()"
                />
              </div>
              <div class="swatches-row">
                @for (c of presetColors; track c) {
                  <button
                    class="swatch-btn"
                    [style.background]="c"
                    [class.selected]="t.primaryColor === c"
                    (click)="t.primaryColor = c; onModelChange()"
                  ></button>
                }
              </div>
            </div>

            <!-- Accent Color -->
            <div class="control-group">
              <label>Accent Secondary Color</label>
              <div class="color-picker-row">
                <input
                  type="color"
                  class="color-input"
                  [(ngModel)]="t.accentColor"
                  (ngModelChange)="onModelChange()"
                />
                <input
                  type="text"
                  class="input-control hex-input"
                  [(ngModel)]="t.accentColor"
                  (ngModelChange)="onModelChange()"
                />
              </div>
            </div>

            <!-- Font Family -->
            <div class="control-group">
              <label>Body & Heading Font</label>
              <select
                class="input-control"
                [(ngModel)]="t.font"
                (ngModelChange)="onModelChange()"
              >
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Geometric)</option>
                <option value="JetBrains Mono">JetBrains Mono (Developer)</option>
                <option value="Playfair Display">Playfair Display (Editorial Serif)</option>
              </select>
            </div>

            <!-- Border Radius -->
            <div class="control-group">
              <label>Corner Radius</label>
              <select
                class="input-control"
                [(ngModel)]="t.borderRadius"
                (ngModelChange)="onModelChange()"
              >
                <option value="sm">Subtle (4px)</option>
                <option value="md">Rounded (10px)</option>
                <option value="lg">Curved (16px)</option>
                <option value="full">Pill / Circular</option>
              </select>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .themes-view {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      max-width: 960px;
    }

    .view-header {
      h2 { font-size: 1.625rem; margin-bottom: 0.375rem; }
      p { font-size: 0.9375rem; }
    }

    .themes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .theme-card {
      cursor: pointer;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 0;
      transition: all var(--transition-normal);

      &:hover {
        transform: translateY(-3px);
        border-color: rgba(99, 102, 241, 0.4);
      }

      &.active {
        border-color: var(--accent-primary);
        box-shadow: 0 0 20px var(--accent-glow);
      }
    }

    .theme-preview-box {
      height: 120px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .preview-tag {
        font-size: 0.6875rem;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.05em;
      }

      .preview-mini-title {
        font-size: 0.9375rem;
        font-weight: 700;
      }

      .code-lines {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .line {
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          width: 80%;

          &.short { width: 50%; }
        }
      }

      &.dev-preview {
        background: #090d16;
        color: #6366f1;
      }

      &.min-preview {
        background: #ffffff;
        color: #111827;
        .line { background: #e5e7eb; }
      }

      &.exec-preview {
        background: #0f172a;
        color: #38bdf8;
        font-family: 'Playfair Display', Georgia, serif;
      }

      &.eleg-preview {
        background: #faf8f5;
        color: #292524;
        font-family: 'Playfair Display', Georgia, serif;
        .line { background: #e7e5e4; }
      }
    }

    .theme-card-info {
      padding: 1.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .theme-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h4 { font-size: 1rem; font-weight: 700; }
      }

      p {
        font-size: 0.8125rem;
        line-height: 1.4;
      }
    }

    .customizer-box {
      padding: 1.75rem;

      h3 { font-size: 1.25rem; margin-bottom: 0.25rem; }
      .customizer-desc { font-size: 0.875rem; margin-bottom: 1.5rem; }
    }

    .controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-secondary);
      }
    }

    .color-picker-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .color-input {
        width: 40px;
        height: 38px;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        background: transparent;
      }

      .hex-input {
        font-family: var(--font-mono);
        text-transform: uppercase;
      }
    }

    .swatches-row {
      display: flex;
      gap: 0.375rem;

      .swatch-btn {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;

        &.selected {
          border-color: #ffffff;
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
        }
      }
    }
  `]
})
export class ThemesComponent {
  state = inject(PortfolioStateService);

  presetColors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#06b6d4'  // Cyan
  ];

  setThemeName(name: 'developer' | 'minimal' | 'executive' | 'elegant'): void {
    this.state.updatePortfolio(p => {
      p.theme.name = name;
      return p;
    });
  }

  onModelChange(): void {
    const current = this.state.portfolio();
    if (current) {
      this.state.updateTheme(current.theme);
    }
  }
}
