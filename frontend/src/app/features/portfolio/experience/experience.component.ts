import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioStateService } from '../../../core/services/portfolio-state.service';
import { ExperienceItem } from '../../../core/models/portfolio.model';
import { IconComponent } from '../../../shared/components/icon.component';

@Component({
  selector: 'app-experience-editor',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="editor-section">
      <div class="section-title-row">
        <div>
          <h3>Work Experience</h3>
          <p>Highlight your professional career, roles, impact, and technology stack.</p>
        </div>

        <button class="btn btn-primary btn-sm" (click)="addNewExperience()">
          <app-icon name="plus" [size]="16" />
          <span>Add Experience</span>
        </button>
      </div>

      <!-- Experience Cards List -->
      <div class="experience-list">
        @for (item of state.portfolio()?.experience; track item.id; let idx = $index) {
          <div class="item-card card">
            <div class="card-top-bar">
              <div class="item-summary">
                <span class="role-title">{{ item.jobTitle || 'Untitled Role' }}</span>
                <span class="divider">•</span>
                <span class="company-name">{{ item.company || 'Unknown Company' }}</span>
                <span class="dates-pill">{{ item.startDate }} — {{ item.isCurrent ? 'Present' : (item.endDate || 'Date') }}</span>
              </div>

              <div class="item-controls">
                <button
                  class="icon-btn-ctrl"
                  (click)="moveItem(idx, -1)"
                  [disabled]="idx === 0"
                  title="Move Up"
                >
                  ↑
                </button>
                <button
                  class="icon-btn-ctrl"
                  (click)="moveItem(idx, 1)"
                  [disabled]="idx === (state.portfolio()?.experience?.length || 1) - 1"
                  title="Move Down"
                >
                  ↓
                </button>
                <button
                  class="icon-btn-ctrl delete"
                  (click)="removeExperience(item.id)"
                  title="Delete"
                >
                  <app-icon name="trash" [size]="14" />
                </button>
              </div>
            </div>

            <div class="item-fields">
              <div class="form-grid">
                <div class="form-group">
                  <label>Company / Organization *</label>
                  <input
                    type="text"
                    class="input-control"
                    [(ngModel)]="item.company"
                    (ngModelChange)="onModelChange()"
                    placeholder="e.g. Acme Innovations"
                  />
                </div>

                <div class="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    class="input-control"
                    [(ngModel)]="item.jobTitle"
                    (ngModelChange)="onModelChange()"
                    placeholder="e.g. Lead Full Stack Engineer"
                  />
                </div>

                <div class="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    class="input-control"
                    [(ngModel)]="item.location"
                    (ngModelChange)="onModelChange()"
                    placeholder="e.g. Bengaluru, India or Remote"
                  />
                </div>

                <div class="dates-row">
                  <div class="form-group">
                    <label>Start Date</label>
                    <input
                      type="text"
                      class="input-control"
                      [(ngModel)]="item.startDate"
                      (ngModelChange)="onModelChange()"
                      placeholder="e.g. 2022-03"
                    />
                  </div>

                  <div class="form-group">
                    <label>End Date</label>
                    <input
                      type="text"
                      class="input-control"
                      [(ngModel)]="item.endDate"
                      [disabled]="item.isCurrent"
                      (ngModelChange)="onModelChange()"
                      placeholder="e.g. 2024-06"
                    />
                  </div>
                </div>
              </div>

              <div class="current-role-checkbox">
                <label>
                  <input
                    type="checkbox"
                    [(ngModel)]="item.isCurrent"
                    (ngModelChange)="onModelChange()"
                  />
                  <span>I currently work in this role</span>
                </label>
              </div>

              <div class="form-group">
                <label>Role Summary & Impact</label>
                <textarea
                  rows="3"
                  class="input-control"
                  [(ngModel)]="item.description"
                  (ngModelChange)="onModelChange()"
                  placeholder="Overview of your responsibilities, team leadership, and scope..."
                ></textarea>
              </div>

              <!-- Technologies Tags -->
              <div class="form-group">
                <label>Technologies Used (comma separated)</label>
                <input
                  type="text"
                  class="input-control"
                  [ngModel]="item.technologies.join(', ')"
                  (ngModelChange)="updateTechStack(item, $event)"
                  placeholder="e.g. C#, .NET 9, Angular, Docker, AWS"
                />
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state card">
            <app-icon name="briefcase" [size]="32" />
            <p>No work experiences added yet.</p>
            <button class="btn btn-secondary btn-sm" (click)="addNewExperience()">
              <span>+ Add Your First Role</span>
            </button>
          </div>
        }
      </div>
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

    .experience-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .item-card {
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      padding: 1.25rem;
      border-radius: var(--radius-md);
    }

    .card-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.875rem;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .item-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;

      .role-title {
        font-weight: 700;
        color: var(--text-primary);
      }

      .company-name {
        color: var(--accent-primary);
      }

      .divider {
        color: var(--text-muted);
      }

      .dates-pill {
        font-size: 0.75rem;
        background: var(--bg-secondary);
        padding: 0.125rem 0.5rem;
        border-radius: var(--radius-full);
        color: var(--text-muted);
      }
    }

    .item-controls {
      display: flex;
      gap: 0.375rem;

      .icon-btn-ctrl {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover:not(:disabled) {
          color: var(--text-primary);
          border-color: var(--accent-primary);
        }

        &.delete:hover {
          color: var(--error);
          border-color: var(--error);
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .dates-row {
      display: flex;
      gap: 0.75rem;
    }

    .current-role-checkbox {
      margin-bottom: 1rem;
      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8125rem;
        color: var(--text-secondary);
        cursor: pointer;
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-muted);
    }
  `]
})
export class ExperienceComponent {
  state = inject(PortfolioStateService);

  addNewExperience(): void {
    const item: ExperienceItem = {
      id: Math.random().toString(36).substring(2, 9),
      company: '',
      jobTitle: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      responsibilities: [],
      achievements: [],
      technologies: []
    };
    this.state.addExperience(item);
  }

  removeExperience(id: string): void {
    this.state.removeExperience(id);
  }

  moveItem(index: number, delta: number): void {
    const current = this.state.portfolio();
    if (!current) return;

    const list = [...current.experience];
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    this.state.updatePortfolio(p => {
      p.experience = list;
      return p;
    });
  }

  updateTechStack(item: ExperienceItem, raw: string): void {
    item.technologies = raw.split(',').map(s => s.trim()).filter(s => !!s);
    this.onModelChange();
  }

  onModelChange(): void {
    const current = this.state.portfolio();
    if (current) {
      this.state.updatePortfolio(p => p);
    }
  }
}
