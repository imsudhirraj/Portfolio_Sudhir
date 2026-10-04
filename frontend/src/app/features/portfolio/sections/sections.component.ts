import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioStateService } from '../../../core/services/portfolio-state.service';

@Component({
  selector: 'app-sections-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="editor-section">
      <div class="section-title-row">
        <div>
          <h3>Section Visibility & Ordering</h3>
          <p>Toggle sections on or off and rearrange the layout order of your portfolio.</p>
        </div>
      </div>

      @if (state.portfolio()?.sections; as sec) {
        <div class="sections-container">
          <div class="sections-list card">
            <h4>Enabled Sections</h4>
            <div class="toggles-grid">
              <label class="toggle-card">
                <input type="checkbox" [(ngModel)]="sec.hero" (ngModelChange)="onModelChange()" />
                <div class="toggle-content">
                  <span class="sec-name">Hero Introduction</span>
                  <span class="sec-desc">Headline, full name, avatar, socials</span>
                </div>
              </label>

              <label class="toggle-card">
                <input type="checkbox" [(ngModel)]="sec.about" (ngModelChange)="onModelChange()" />
                <div class="toggle-content">
                  <span class="sec-name">About Me / Summary</span>
                  <span class="sec-desc">Executive bio and career highlights</span>
                </div>
              </label>

              <label class="toggle-card">
                <input type="checkbox" [(ngModel)]="sec.skills" (ngModelChange)="onModelChange()" />
                <div class="toggle-content">
                  <span class="sec-name">Skills & Stack</span>
                  <span class="sec-desc">Categorized technical toolset</span>
                </div>
              </label>

              <label class="toggle-card">
                <input type="checkbox" [(ngModel)]="sec.experience" (ngModelChange)="onModelChange()" />
                <div class="toggle-content">
                  <span class="sec-name">Work Experience</span>
                  <span class="sec-desc">Career history, responsibilities, impact</span>
                </div>
              </label>

              <label class="toggle-card">
                <input type="checkbox" [(ngModel)]="sec.projects" (ngModelChange)="onModelChange()" />
                <div class="toggle-content">
                  <span class="sec-name">Projects & Portfolios</span>
                  <span class="sec-desc">Code repos, live apps, case studies</span>
                </div>
              </label>

              <label class="toggle-card">
                <input type="checkbox" [(ngModel)]="sec.education" (ngModelChange)="onModelChange()" />
                <div class="toggle-content">
                  <span class="sec-name">Education</span>
                  <span class="sec-desc">Degrees, academic achievements</span>
                </div>
              </label>

              <label class="toggle-card">
                <input type="checkbox" [(ngModel)]="sec.certifications" (ngModelChange)="onModelChange()" />
                <div class="toggle-content">
                  <span class="sec-name">Certifications</span>
                  <span class="sec-desc">Vendor credentials, licenses</span>
                </div>
              </label>

              <label class="toggle-card">
                <input type="checkbox" [(ngModel)]="sec.contact" (ngModelChange)="onModelChange()" />
                <div class="toggle-content">
                  <span class="sec-name">Contact Information</span>
                  <span class="sec-desc">Email, phone, location, direct connect</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Section Order Reordering Box -->
          <div class="order-box card">
            <h4>Layout Order</h4>
            <p class="order-hint">Use arrows to adjust the vertical flow on your published page:</p>

            <div class="order-items">
              @for (secKey of sec.sectionOrder; track secKey; let idx = $index) {
                <div class="order-item">
                  <span class="order-num">{{ idx + 1 }}</span>
                  <span class="order-name">{{ formatSectionName(secKey) }}</span>
                  <div class="order-btns">
                    <button
                      class="btn-arrow"
                      (click)="moveSection(idx, -1)"
                      [disabled]="idx === 0"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      class="btn-arrow"
                      (click)="moveSection(idx, 1)"
                      [disabled]="idx === sec.sectionOrder.length - 1"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .editor-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 { font-size: 1.25rem; }
      p { font-size: 0.875rem; }
    }

    .sections-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .toggles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .toggle-card {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: rgba(99, 102, 241, 0.4);
      }

      input[type="checkbox"] {
        margin-top: 0.25rem;
        accent-color: var(--accent-primary);
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      .toggle-content {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;

        .sec-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .sec-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      }
    }

    .order-box {
      h4 { margin-bottom: 0.25rem; }
      .order-hint { font-size: 0.75rem; margin-bottom: 1rem; }
    }

    .order-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .order-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0.875rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);

      .order-num {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--text-muted);
        width: 20px;
      }

      .order-name {
        font-size: 0.875rem;
        font-weight: 500;
        flex: 1;
      }

      .order-btns {
        display: flex;
        gap: 0.25rem;

        .btn-arrow {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 26px;
          height: 26px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover:not(:disabled) {
            color: var(--text-primary);
            border-color: var(--accent-primary);
          }

          &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }
        }
      }
    }
  `]
})
export class SectionsComponent {
  state = inject(PortfolioStateService);

  formatSectionName(key: string): string {
    const names: Record<string, string> = {
      hero: 'Hero Introduction',
      about: 'About Me',
      skills: 'Skills & Stack',
      experience: 'Experience',
      projects: 'Projects',
      education: 'Education',
      certifications: 'Certifications',
      contact: 'Contact Info'
    };
    return names[key] || key;
  }

  moveSection(index: number, delta: number): void {
    const current = this.state.portfolio();
    if (!current) return;

    const list = [...current.sections.sectionOrder];
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    current.sections.sectionOrder = list;
    this.onModelChange();
  }

  onModelChange(): void {
    const current = this.state.portfolio();
    if (current) {
      this.state.updateSections(current.sections);
    }
  }
}
