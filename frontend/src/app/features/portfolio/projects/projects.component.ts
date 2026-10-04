import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioStateService } from '../../../core/services/portfolio-state.service';
import { AiApiService } from '../../../core/services/ai-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProjectItem } from '../../../core/models/portfolio.model';
import { IconComponent } from '../../../shared/components/icon.component';

@Component({
  selector: 'app-projects-editor',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="editor-section">
      <div class="section-title-row">
        <div>
          <h3>Featured Projects & Case Studies</h3>
          <p>Showcase real-world architectures, GitHub repos, and live deployments.</p>
        </div>

        <button class="btn btn-primary btn-sm" (click)="addNewProject()">
          <app-icon name="plus" [size]="16" />
          <span>Add Project</span>
        </button>
      </div>

      <div class="projects-list">
        @for (item of state.portfolio()?.projects; track item.id; let idx = $index) {
          <div class="item-card card">
            <div class="card-top-bar">
              <div class="item-summary">
                <span class="project-name">{{ item.name || 'Untitled Project' }}</span>
                @if (item.isFeatured) {
                  <span class="badge badge-warning">★ Featured</span>
                }
                @if (item.role) {
                  <span class="role-tag">{{ item.role }}</span>
                }
              </div>

              <div class="item-controls">
                <button
                  class="btn-ai-sm"
                  (click)="polishWithAi(item)"
                  [disabled]="isAiImprovingId() === item.id"
                  title="Improve description with AI"
                >
                  <app-icon name="sparkles" [size]="14" />
                  <span>{{ isAiImprovingId() === item.id ? 'Polishing...' : 'AI Polish' }}</span>
                </button>
                <button class="icon-btn-ctrl" (click)="moveItem(idx, -1)" [disabled]="idx === 0" title="Move Up">↑</button>
                <button class="icon-btn-ctrl" (click)="moveItem(idx, 1)" [disabled]="idx === (state.portfolio()?.projects?.length || 1) - 1" title="Move Down">↓</button>
                <button class="icon-btn-ctrl delete" (click)="removeProject(item.id)" title="Delete">
                  <app-icon name="trash" [size]="14" />
                </button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.name"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. Distributed Event Pipeline"
                />
              </div>

              <div class="form-group">
                <label>Your Role in Project</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.role"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. Lead Architect / Full Stack Creator"
                />
              </div>

              <div class="form-group">
                <label>Live Demo URL</label>
                <input
                  type="url"
                  class="input-control"
                  [(ngModel)]="item.projectUrl"
                  (ngModelChange)="onModelChange()"
                  placeholder="https://myproject.com"
                />
              </div>

              <div class="form-group">
                <label>GitHub Repository URL</label>
                <input
                  type="url"
                  class="input-control"
                  [(ngModel)]="item.githubUrl"
                  (ngModelChange)="onModelChange()"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div class="featured-checkbox">
              <label>
                <input
                  type="checkbox"
                  [(ngModel)]="item.isFeatured"
                  (ngModelChange)="onModelChange()"
                />
                <span>Highlight as Featured Project</span>
              </label>
            </div>

            <div class="form-group">
              <label>Project Overview & Business Impact</label>
              <textarea
                rows="3"
                class="input-control"
                [(ngModel)]="item.description"
                (ngModelChange)="onModelChange()"
                placeholder="Detail the technical architecture, problem statement, key challenges overcome, and quantifiable outcomes..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>Technologies & Tools (comma separated)</label>
              <input
                type="text"
                class="input-control"
                [ngModel]="item.technologies.join(', ')"
                (ngModelChange)="updateTechStack(item, $event)"
                placeholder="e.g. Angular 20, .NET 9, RabbitMQ, Redis, Docker"
              />
            </div>
          </div>
        } @empty {
          <div class="empty-state card">
            <app-icon name="code" [size]="32" />
            <p>No projects added yet.</p>
            <button class="btn btn-secondary btn-sm" (click)="addNewProject()">
              <span>+ Add Your First Project</span>
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

    .projects-list {
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
      gap: 0.625rem;

      .project-name {
        font-weight: 700;
        font-size: 1rem;
        color: var(--text-primary);
      }

      .role-tag {
        font-size: 0.75rem;
        color: var(--text-muted);
        background: var(--bg-secondary);
        padding: 0.125rem 0.5rem;
        border-radius: var(--radius-full);
      }
    }

    .item-controls {
      display: flex;
      align-items: center;
      gap: 0.375rem;

      .btn-ai-sm {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.3);
        color: #818cf8;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.625rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.25);
          color: #ffffff;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

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
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .featured-checkbox {
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
export class ProjectsComponent {
  state = inject(PortfolioStateService);
  aiApi = inject(AiApiService);
  notify = inject(NotificationService);

  isAiImprovingId = signal<string | null>(null);

  addNewProject(): void {
    const item: ProjectItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      description: '',
      role: '',
      technologies: [],
      responsibilities: [],
      achievements: [],
      projectUrl: '',
      githubUrl: '',
      isFeatured: false
    };
    this.state.addProject(item);
  }

  removeProject(id: string): void {
    this.state.removeProject(id);
  }

  moveItem(index: number, delta: number): void {
    const current = this.state.portfolio();
    if (!current) return;

    const list = [...current.projects];
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    this.state.updatePortfolio(p => {
      p.projects = list;
      return p;
    });
  }

  updateTechStack(item: ProjectItem, raw: string): void {
    item.technologies = raw.split(',').map(s => s.trim()).filter(s => !!s);
    this.onModelChange();
  }

  polishWithAi(item: ProjectItem): void {
    if (!item.description) {
      this.notify.warning('Please enter a brief description first.');
      return;
    }

    this.isAiImprovingId.set(item.id);
    this.aiApi.improveProject(item.description, item.role || 'Software Engineer', item.technologies).subscribe({
      next: res => {
        this.isAiImprovingId.set(null);
        if (res.success && res.data) {
          item.description = res.data;
          this.onModelChange();
          this.notify.success(`AI polished "${item.name}" description!`);
        }
      },
      error: () => {
        this.isAiImprovingId.set(null);
        this.notify.error('AI polish failed.');
      }
    });
  }

  onModelChange(): void {
    const current = this.state.portfolio();
    if (current) {
      this.state.updatePortfolio(p => p);
    }
  }
}
