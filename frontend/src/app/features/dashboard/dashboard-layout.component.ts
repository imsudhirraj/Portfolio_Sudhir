import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PortfolioStateService } from '../../core/services/portfolio-state.service';
import { ThemeService } from '../../core/services/theme.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="dashboard-shell">
      <!-- Sidebar -->
      <aside class="dashboard-sidebar">
        <div class="sidebar-header">
          <div class="brand">
            <div class="brand-badge">
              <app-icon name="sparkles" [size]="18" />
            </div>
            <span class="brand-name">Portfolio<strong>AI</strong></span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group">
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              <app-icon name="layout" [size]="18" />
              <span>Overview</span>
            </a>
          </div>

          <div class="nav-group">
            <div class="group-title">Portfolio Editor</div>
            <a routerLink="/dashboard/editor/personal-info" routerLinkActive="active" class="nav-item">
              <app-icon name="user" [size]="18" />
              <span>Personal Info</span>
            </a>
            <a routerLink="/dashboard/editor/summary" routerLinkActive="active" class="nav-item">
              <app-icon name="edit" [size]="18" />
              <span>About Me</span>
            </a>
            <a routerLink="/dashboard/editor/experience" routerLinkActive="active" class="nav-item">
              <app-icon name="briefcase" [size]="18" />
              <span>Experience</span>
            </a>
            <a routerLink="/dashboard/editor/projects" routerLinkActive="active" class="nav-item">
              <app-icon name="code" [size]="18" />
              <span>Projects</span>
            </a>
            <a routerLink="/dashboard/editor/skills" routerLinkActive="active" class="nav-item">
              <app-icon name="sparkles" [size]="18" />
              <span>Skills</span>
            </a>
            <a routerLink="/dashboard/editor/education" routerLinkActive="active" class="nav-item">
              <app-icon name="grad-cap" [size]="18" />
              <span>Education</span>
            </a>
            <a routerLink="/dashboard/editor/certifications" routerLinkActive="active" class="nav-item">
              <app-icon name="award" [size]="18" />
              <span>Certifications</span>
            </a>
            <a routerLink="/dashboard/editor/sections" routerLinkActive="active" class="nav-item">
              <app-icon name="layout" [size]="18" />
              <span>Sections & Order</span>
            </a>
          </div>

          <div class="nav-group">
            <div class="group-title">AI Tools</div>
            <a routerLink="/dashboard/resume" routerLinkActive="active" class="nav-item">
              <app-icon name="upload" [size]="18" />
              <span>Resume Analyzer</span>
            </a>
            <a routerLink="/dashboard/ai-review" routerLinkActive="active" class="nav-item">
              <app-icon name="check-circle" [size]="18" />
              <span>AI Review</span>
            </a>
            <a routerLink="/dashboard/ai-assistant" routerLinkActive="active" class="nav-item">
              <app-icon name="sparkles" [size]="18" />
              <span>Content Assistant</span>
            </a>
          </div>

          <div class="nav-group">
            <div class="group-title">Design & Live</div>
            <a routerLink="/dashboard/themes" routerLinkActive="active" class="nav-item">
              <app-icon name="palette" [size]="18" />
              <span>Themes & Styling</span>
            </a>
            <a routerLink="/dashboard/preview" routerLinkActive="active" class="nav-item">
              <app-icon name="eye" [size]="18" />
              <span>Live Preview</span>
            </a>
          </div>

          <div class="nav-group">
            <div class="group-title">Configuration</div>
            <a routerLink="/dashboard/settings" routerLinkActive="active" class="nav-item">
              <app-icon name="settings" [size]="18" />
              <span>Settings & Privacy</span>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="storage-tag">
            <span class="dot"></span>
            <span>JSON File Persistence</span>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="dashboard-main">
        <!-- Top App Bar -->
        <header class="app-bar">
          <div class="bar-left">
            <!-- Autosave Indicator -->
            <div class="autosave-status">
              @switch (state.savingStatus()) {
                @case ('saving') {
                  <span class="autosave-badge saving">
                    <app-icon name="refresh" [size]="14" customClass="spinning" />
                    <span>Saving...</span>
                  </span>
                }
                @case ('saved') {
                  <span class="autosave-badge saved">
                    <app-icon name="check" [size]="14" />
                    <span>✓ Saved</span>
                  </span>
                }
                @case ('error') {
                  <span class="autosave-badge error">
                    <span>Unable to save</span>
                    <button class="btn btn-sm btn-outline" (click)="state.retrySave()">Retry</button>
                  </span>
                }
                @default {
                  <span class="autosave-badge idle">All changes saved</span>
                }
              }
            </div>
          </div>

          <div class="bar-right">
            <!-- Publication Pill -->
            @if (state.portfolio()?.publication?.isPublished) {
              <a
                [routerLink]="['/u', state.portfolio()?.publication?.slug]"
                target="_blank"
                class="pub-pill published"
                title="View live public portfolio"
              >
                <span class="dot"></span>
                <span>/u/{{ state.portfolio()?.publication?.slug }}</span>
                <app-icon name="external" [size]="14" />
              </a>
            } @else {
              <span class="pub-pill draft">
                <span class="dot"></span>
                <span>Draft</span>
              </span>
            }

            <!-- Theme Toggle -->
            <button class="icon-btn" (click)="themeService.toggleTheme()" title="Toggle Theme">
              <app-icon [name]="themeService.currentMode() === 'dark' ? 'sun' : 'moon'" [size]="18" />
            </button>

            <!-- User Menu -->
            <div class="user-profile">
              <div class="avatar">{{ userInitials() }}</div>
              <span class="username">{{ authService.currentUser()?.name }}</span>
              <button class="icon-btn logout-btn" (click)="authService.logout()" title="Sign Out">
                <app-icon name="logout" [size]="16" />
              </button>
            </div>
          </div>
        </header>

        <!-- Route Content -->
        <main class="dashboard-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-shell {
      display: flex;
      min-height: 100vh;
      background: var(--bg-app);
    }

    .dashboard-sidebar {
      width: 260px;
      flex-shrink: 0;
      background: var(--bg-primary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);

      .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .brand-badge {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }

        .brand-name {
          font-family: var(--font-heading);
          font-size: 1.125rem;
          font-weight: 700;
          letter-spacing: -0.02em;

          strong {
            color: var(--accent-primary);
          }
        }
      }
    }

    .sidebar-nav {
      padding: 1rem 0.75rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .group-title {
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        padding: 0.5rem 0.75rem 0.25rem;
      }
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
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

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border-color);

      .storage-tag {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: var(--text-muted);

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--success);
        }
      }
    }

    .dashboard-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .app-bar {
      height: 64px;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-glass);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .bar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .pub-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3125rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.published {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: var(--success);
        .dot { background: var(--success); }
      }

      &.draft {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
        color: var(--warning);
        .dot { background: var(--warning); }
      }
    }

    .icon-btn {
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        color: var(--text-primary);
        border-color: var(--accent-primary);
      }
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding-left: 0.5rem;
      border-left: 1px solid var(--border-color);

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        background: var(--accent-gradient);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.8125rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .username {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .logout-btn {
        width: 30px;
        height: 30px;
        margin-left: 0.25rem;
      }
    }

    .dashboard-content {
      flex: 1;
      padding: 2rem;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 900px) {
      .dashboard-sidebar {
        width: 72px;
        .brand-name, .group-title, .nav-item span, .storage-tag span {
          display: none;
        }
        .nav-item {
          justify-content: center;
        }
      }
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  authService = inject(AuthService);
  state = inject(PortfolioStateService);
  themeService = inject(ThemeService);

  userInitials(): string {
    const name = this.authService.currentUser()?.name || 'User';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  ngOnInit(): void {
    this.state.loadPortfolio();
  }
}
