import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioStateService } from '../../../core/services/portfolio-state.service';
import { EducationItem } from '../../../core/models/portfolio.model';
import { IconComponent } from '../../../shared/components/icon.component';

@Component({
  selector: 'app-education-editor',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="editor-section">
      <div class="section-title-row">
        <div>
          <h3>Academic Education</h3>
          <p>Degrees, universities, specializations, and honors.</p>
        </div>

        <button class="btn btn-primary btn-sm" (click)="addNewEducation()">
          <app-icon name="plus" [size]="16" />
          <span>Add Education</span>
        </button>
      </div>

      <div class="education-list">
        @for (item of state.portfolio()?.education; track item.id; let idx = $index) {
          <div class="item-card card">
            <div class="card-top-bar">
              <div class="item-summary">
                <span class="degree-title">{{ item.degree || 'Degree' }} {{ item.fieldOfStudy ? 'in ' + item.fieldOfStudy : '' }}</span>
                <span class="inst-name">• {{ item.institution || 'University' }}</span>
                <span class="dates-pill">{{ item.startDate }} — {{ item.endDate }}</span>
              </div>

              <div class="item-controls">
                <button class="icon-btn-ctrl delete" (click)="removeEducation(item.id)" title="Delete">
                  <app-icon name="trash" [size]="14" />
                </button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Institution / University *</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.institution"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. National Institute of Technology"
                />
              </div>

              <div class="form-group">
                <label>Degree *</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.degree"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. Bachelor of Technology"
                />
              </div>

              <div class="form-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.fieldOfStudy"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. Computer Science and Engineering"
                />
              </div>

              <div class="form-group">
                <label>Grade / GPA / Honors</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.grade"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. 8.8 / 10 CGPA / Magna Cum Laude"
                />
              </div>

              <div class="form-group">
                <label>Start Year</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.startDate"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. 2016"
                />
              </div>

              <div class="form-group">
                <label>End Year</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.endDate"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. 2020"
                />
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state card">
            <app-icon name="grad-cap" [size]="32" />
            <p>No education records added yet.</p>
            <button class="btn btn-secondary btn-sm" (click)="addNewEducation()">
              <span>+ Add Education Record</span>
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

    .education-list {
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
    }

    .item-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;

      .degree-title { font-weight: 700; color: var(--text-primary); }
      .inst-name { color: var(--accent-primary); }
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

        &.delete:hover {
          color: var(--error);
          border-color: var(--error);
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
export class EducationComponent {
  state = inject(PortfolioStateService);

  addNewEducation(): void {
    const item: EducationItem = {
      id: Math.random().toString(36).substring(2, 9),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      activities: ''
    };
    this.state.addEducation(item);
  }

  removeEducation(id: string): void {
    this.state.removeEducation(id);
  }

  onModelChange(): void {
    const current = this.state.portfolio();
    if (current) {
      this.state.updatePortfolio(p => p);
    }
  }
}
