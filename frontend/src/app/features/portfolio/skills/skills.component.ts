import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioStateService } from '../../../core/services/portfolio-state.service';
import { SkillItem } from '../../../core/models/portfolio.model';
import { IconComponent } from '../../../shared/components/icon.component';

@Component({
  selector: 'app-skills-editor',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="editor-section">
      <div class="section-title-row">
        <div>
          <h3>Skills & Proficiencies</h3>
          <p>Organize your technical toolkit by category. No artificial percentages.</p>
        </div>
      </div>

      <!-- Add New Skill Form Box -->
      <div class="add-skill-card card">
        <h4>+ Add New Skill</h4>
        <div class="add-grid">
          <div class="form-group">
            <label>Skill Name</label>
            <input
              type="text"
              class="input-control"
              [(ngModel)]="newSkillName"
              placeholder="e.g. C#, Angular, PostgreSQL"
              (keydown.enter)="addSkill()"
            />
          </div>

          <div class="form-group">
            <label>Category</label>
            <select class="input-control select-control" [(ngModel)]="newSkillCategory">
              <option value="Backend">Backend</option>
              <option value="Frontend">Frontend</option>
              <option value="Database">Database</option>
              <option value="Cloud">Cloud</option>
              <option value="DevOps">DevOps</option>
              <option value="Tools">Tools</option>
              <option value="Messaging">Messaging</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label>Proficiency</label>
            <select class="input-control select-control" [(ngModel)]="newSkillLevel">
              <option value="Expert">Expert</option>
              <option value="Advanced">Advanced</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Beginner">Beginner</option>
            </select>
          </div>

          <div class="add-btn-col">
            <button class="btn btn-primary" (click)="addSkill()" [disabled]="!newSkillName.trim()">
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="category-tabs">
        <button
          class="cat-chip"
          [class.active]="selectedCategory() === 'All'"
          (click)="selectedCategory.set('All')"
        >
          All ({{ state.portfolio()?.skills?.length || 0 }})
        </button>
        @for (cat of categories; track cat) {
          <button
            class="cat-chip"
            [class.active]="selectedCategory() === cat"
            (click)="selectedCategory.set(cat)"
          >
            {{ cat }} ({{ getCategoryCount(cat) }})
          </button>
        }
      </div>

      <!-- Skills Display Chips -->
      <div class="skills-grid">
        @for (skill of filteredSkills(); track skill.id) {
          <div class="skill-card">
            <div class="skill-info">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="badge" [class]="getLevelBadgeClass(skill.level)">{{ skill.level }}</span>
            </div>
            <div class="skill-actions">
              <span class="skill-cat-tag">{{ skill.category }}</span>
              <button class="delete-chip" (click)="removeSkill(skill.id)" title="Remove skill">
                <app-icon name="x" [size]="14" />
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state card full-width">
            <app-icon name="sparkles" [size]="28" />
            <p>No skills found for this category.</p>
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

    .add-skill-card {
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      padding: 1.25rem;
      border-radius: var(--radius-md);

      h4 {
        font-size: 0.9375rem;
        margin-bottom: 0.75rem;
      }
    }

    .add-grid {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1.5fr auto;
      gap: 1rem;
      align-items: flex-end;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .form-group {
        margin-bottom: 0;
      }
    }

    .select-control {
      cursor: pointer;
    }

    .category-tabs {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;

      &::-webkit-scrollbar { height: 4px; }

      .cat-chip {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
        font-weight: 500;
        border-radius: var(--radius-full);
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        cursor: pointer;
        white-space: nowrap;
        transition: all var(--transition-fast);

        &:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        &.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: var(--accent-primary);
          color: #818cf8;
          font-weight: 600;
        }
      }
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;

      .full-width {
        grid-column: 1 / -1;
      }
    }

    .skill-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: all var(--transition-fast);

      &:hover {
        border-color: rgba(99, 102, 241, 0.3);
      }

      .skill-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;

        .skill-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }
      }

      .skill-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .skill-cat-tag {
          font-size: 0.6875rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .delete-chip {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.125rem;
          border-radius: 4px;
          display: flex;
          align-items: center;

          &:hover {
            color: var(--error);
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
    }
  `]
})
export class SkillsComponent {
  state = inject(PortfolioStateService);

  categories = ['Backend', 'Frontend', 'Database', 'Cloud', 'DevOps', 'Tools', 'Messaging', 'Security', 'Other'];
  selectedCategory = signal<string>('All');

  newSkillName = '';
  newSkillCategory: any = 'Backend';
  newSkillLevel: any = 'Advanced';

  filteredSkills = computed(() => {
    const list = this.state.portfolio()?.skills || [];
    const cat = this.selectedCategory();
    if (cat === 'All') return list;
    return list.filter(s => s.category.toLowerCase() === cat.toLowerCase());
  });

  getCategoryCount(cat: string): number {
    const list = this.state.portfolio()?.skills || [];
    return list.filter(s => s.category.toLowerCase() === cat.toLowerCase()).length;
  }

  addSkill(): void {
    if (!this.newSkillName.trim()) return;

    const skill: SkillItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: this.newSkillName.trim(),
      category: this.newSkillCategory,
      level: this.newSkillLevel
    };

    this.state.addSkill(skill);
    this.newSkillName = '';
  }

  removeSkill(id: string): void {
    this.state.removeSkill(id);
  }

  getLevelBadgeClass(level: string): string {
    switch (level?.toLowerCase()) {
      case 'expert': return 'badge-primary';
      case 'advanced': return 'badge-success';
      case 'intermediate': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  }
}
