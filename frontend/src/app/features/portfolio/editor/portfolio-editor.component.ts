import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PortfolioStateService } from '../../../core/services/portfolio-state.service';
import { IconComponent } from '../../../shared/components/icon.component';

@Component({
  selector: 'app-portfolio-editor',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="editor-shell">
      <div class="editor-header">
        <div>
          <h2>Portfolio Editor</h2>
          <p>Every field is completely customizable. Changes autosave automatically.</p>
        </div>

        <div class="editor-quick-links">
          <a routerLink="/dashboard/preview" class="btn btn-secondary btn-sm">
            <app-icon name="eye" [size]="15" />
            <span>Open Live Preview</span>
          </a>
        </div>
      </div>

      <!-- Horizontal Tabs -->
      <nav class="editor-tabs">
        <a routerLink="personal-info" routerLinkActive="active" class="tab-link">
          <app-icon name="user" [size]="16" />
          <span>Personal Info</span>
        </a>
        <a routerLink="summary" routerLinkActive="active" class="tab-link">
          <app-icon name="edit" [size]="16" />
          <span>About Me</span>
        </a>
        <a routerLink="experience" routerLinkActive="active" class="tab-link">
          <app-icon name="briefcase" [size]="16" />
          <span>Experience ({{ state.portfolio()?.experience?.length || 0 }})</span>
        </a>
        <a routerLink="projects" routerLinkActive="active" class="tab-link">
          <app-icon name="code" [size]="16" />
          <span>Projects ({{ state.portfolio()?.projects?.length || 0 }})</span>
        </a>
        <a routerLink="skills" routerLinkActive="active" class="tab-link">
          <app-icon name="sparkles" [size]="16" />
          <span>Skills ({{ state.portfolio()?.skills?.length || 0 }})</span>
        </a>
        <a routerLink="education" routerLinkActive="active" class="tab-link">
          <app-icon name="grad-cap" [size]="16" />
          <span>Education</span>
        </a>
        <a routerLink="certifications" routerLinkActive="active" class="tab-link">
          <app-icon name="award" [size]="16" />
          <span>Certifications</span>
        </a>
        <a routerLink="sections" routerLinkActive="active" class="tab-link">
          <app-icon name="layout" [size]="16" />
          <span>Sections & Visibility</span>
        </a>
      </nav>

      <!-- Active Tab Outlet -->
      <div class="tab-content card">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .editor-shell {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .editor-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;

      h2 {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.875rem;
      }
    }

    .editor-tabs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);

      &::-webkit-scrollbar {
        height: 4px;
      }
    }

    .tab-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      white-space: nowrap;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--bg-elevated);
        color: var(--text-primary);
      }

      &.active {
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
        font-weight: 600;
      }
    }

    .tab-content {
      padding: 2rem;
      min-height: 400px;
    }
  `]
})
export class PortfolioEditorComponent {
  state = inject(PortfolioStateService);
}
