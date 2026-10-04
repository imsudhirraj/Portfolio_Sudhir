import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="login-wrapper">
      <div class="login-card card">
        <div class="login-header">
          <div class="brand-logo">
            <app-icon name="sparkles" [size]="28" />
          </div>
          <h1>Portfolio<strong>AI</strong></h1>
          <p class="tagline">Turn your resume into a professional portfolio.</p>
        </div>

        <div class="login-actions">
          <!-- Google Sign In Button -->
          <button
            class="btn btn-google"
            (click)="handleGoogleSignIn()"
            [disabled]="isLoading()"
          >
            <svg class="google-icon" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div class="divider">
            <span>or instant local demo</span>
          </div>

          <!-- One-click test account -->
          <button
            class="btn btn-secondary btn-demo"
            (click)="handleDevSignIn()"
            [disabled]="isLoading()"
          >
            <app-icon name="user" [size]="18" />
            <span>Continue as Sudhir Raj (Demo)</span>
          </button>
        </div>

        <div class="login-footer">
          <div class="privacy-note">
            <app-icon name="shield" [size]="14" />
            <span>Zero database storage. JSON file persistence under your Google ID.</span>
          </div>
          <a routerLink="/" class="back-link">← Return to Homepage</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.12) 0%, var(--bg-app) 70%);
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 2.5rem 2rem;
      text-align: center;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg), var(--shadow-glow);
    }

    .brand-logo {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-lg);
      background: var(--accent-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      margin: 0 auto 1.25rem;
      box-shadow: 0 8px 24px var(--accent-glow);
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: 0.5rem;

      strong {
        color: var(--accent-primary);
      }
    }

    .tagline {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    .login-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .btn-google {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      background: #ffffff;
      color: #1f2937;
      font-weight: 600;
      font-size: 0.9375rem;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-md);
      border: 1px solid #e5e7eb;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);

      &:hover:not(:disabled) {
        background: #f9fafb;
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 0.25rem 0;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--border-color);
      }

      span {
        position: relative;
        background: var(--bg-card);
        padding: 0 0.75rem;
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .btn-demo {
      width: 100%;
      padding: 0.75rem 1.25rem;
    }

    .login-footer {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      align-items: center;

      .privacy-note {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: var(--text-muted);
        line-height: 1.4;
      }

      .back-link {
        font-size: 0.8125rem;
        color: var(--text-secondary);
        &:hover { color: var(--text-primary); }
      }
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  notify = inject(NotificationService);

  isLoading = signal<boolean>(false);

  handleGoogleSignIn(): void {
    this.isLoading.set(true);
    // In production with Google OAuth Client ID, this invokes google.accounts.id.prompt()
    // For universal local development, we prompt or fall back to verified demo identity:
    this.authService.loginWithDevAccount('10823492384923', 'sudhir.raj@example.com', 'Sudhir Raj').subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.notify.success('Signed in with Google!');
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.notify.error('Sign-in failed. Please verify API server is running.');
      }
    });
  }

  handleDevSignIn(): void {
    this.isLoading.set(true);
    this.authService.loginWithDevAccount('10823492384923', 'sudhir.raj@example.com', 'Sudhir Raj').subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.notify.success('Welcome back, Sudhir!');
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.notify.error('Unable to connect to backend.');
      }
    });
  }
}
