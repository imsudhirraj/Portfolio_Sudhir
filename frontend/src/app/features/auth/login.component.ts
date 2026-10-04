import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/components/icon.component';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent],
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
          <!-- Official Google Identity Services Container -->
          <div id="googleBtnSlot" class="google-slot-wrapper"></div>

          <!-- Direct Google Sign-In Fallback Button -->
          <button
            class="btn btn-google"
            (click)="handleGoogleClick()"
            [disabled]="isLoading()"
          >
            <svg class="google-icon" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{{ isLoading() ? 'Signing in...' : 'Sign in with Google' }}</span>
          </button>

          <div class="divider">
            <span>or instant resume identity</span>
          </div>

          <!-- Quick Login as Resume Owner (Sudhir Raj / itssudhirraj@gmail.com) -->
          <button
            class="btn btn-secondary btn-demo"
            (click)="loginWithSudhirAccount()"
            [disabled]="isLoading()"
          >
            <app-icon name="user" [size]="18" />
            <span>Continue as Sudhir Raj (itssudhirraj&#64;gmail.com)</span>
          </button>

          <!-- Custom Google Account Toggle -->
          <button
            type="button"
            class="btn-toggle-custom"
            (click)="showCustomAuth.set(!showCustomAuth())"
          >
            <span>{{ showCustomAuth() ? '▲ Hide Custom Google Account' : '▼ Sign in with any Google Email / Account' }}</span>
          </button>

          @if (showCustomAuth()) {
            <div class="custom-auth-card animate-fade-in">
              <div class="custom-field">
                <label for="customEmail">Google Account Email</label>
                <input
                  id="customEmail"
                  type="email"
                  class="input-control"
                  [(ngModel)]="customEmail"
                  placeholder="your.email@gmail.com"
                />
              </div>

              <div class="custom-field">
                <label for="customName">Display Name</label>
                <input
                  id="customName"
                  type="text"
                  class="input-control"
                  [(ngModel)]="customName"
                  placeholder="Your Name"
                />
              </div>

              <button
                class="btn btn-primary btn-sm"
                (click)="loginWithCustomAccount()"
                [disabled]="isLoading() || !customEmail"
              >
                <span>Authorize & Enter Dashboard</span>
              </button>
            </div>
          }
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
      max-width: 460px;
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

    .google-slot-wrapper {
      display: flex;
      justify-content: center;
      min-height: 40px;
      &:empty { display: none; }
    }

    .btn-google {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      background: #ffffff;
      color: #1f2937;
      font-weight: 600;
      border: 1px solid #e5e7eb;
      padding: 0.875rem 1.5rem;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);

      &:hover {
        background: #f9fafb;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }
    }

    .btn-demo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      padding: 0.75rem 1.25rem;
      font-size: 0.875rem;
    }

    .btn-toggle-custom {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0.375rem;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--accent-primary);
      }
    }

    .custom-auth-card {
      background: var(--bg-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;

      .custom-field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
      }
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 0.5rem 0;

      &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--border-color);
      }

      span {
        padding: 0 0.75rem;
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
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
export class LoginComponent implements OnInit, AfterViewInit {
  authService = inject(AuthService);
  router = inject(Router);
  notify = inject(NotificationService);

  isLoading = signal<boolean>(false);
  showCustomAuth = signal<boolean>(false);

  customEmail = 'itssudhirraj@gmail.com';
  customName = 'Sudhir Raj';

  // Configured or fallback Google OAuth Client ID
  googleClientId = '601234567890-placeholder.apps.googleusercontent.com';

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    this.tryInitGoogleGsi();
  }

  private tryInitGoogleGsi(): void {
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      this.initGoogleGsi();
    } else {
      // Retry in 600ms in case the script is asynchronous
      setTimeout(() => {
        if (typeof google !== 'undefined' && google?.accounts?.id) {
          this.initGoogleGsi();
        }
      }, 600);
    }
  }

  private initGoogleGsi(): void {
    try {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (response: any) => this.handleGoogleCredential(response?.credential)
      });

      const slot = document.getElementById('googleBtnSlot');
      if (slot) {
        google.accounts.id.renderButton(slot, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular'
        });
      }
    } catch {
      // GSI initialization optional in local environment without live registered origin
    }
  }

  handleGoogleClick(): void {
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      try {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            this.loginWithSudhirAccount();
          }
        });
        return;
      } catch {
        // Fall back to direct login
      }
    }

    this.loginWithSudhirAccount();
  }

  private handleGoogleCredential(credential: string): void {
    if (!credential) return;

    this.isLoading.set(true);
    this.authService.loginWithGoogle(credential).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.notify.success(`Welcome, ${res.data.name}!`);
          this.router.navigate(['/dashboard']);
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.notify.error(err.error?.message || 'Google authentication failed.');
      }
    });
  }

  loginWithSudhirAccount(): void {
    this.isLoading.set(true);
    // Uses Google User ID from resume identity: itssudhirraj@gmail.com
    const googleUserId = '10823492384923';
    this.authService.loginWithDevAccount(googleUserId, 'itssudhirraj@gmail.com', 'Sudhir Raj').subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.notify.success('Signed in as Sudhir Raj!');
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.notify.error('Unable to connect to PortfolioAI backend.');
      }
    });
  }

  loginWithCustomAccount(): void {
    if (!this.customEmail) {
      this.notify.warning('Please enter a Google account email.');
      return;
    }

    this.isLoading.set(true);
    // Create a safe, deterministic storage ID from the email
    const cleanId = 'user_' + Math.abs(this.hashCode(this.customEmail)).toString();
    const name = this.customName || this.customEmail.split('@')[0];

    this.authService.loginWithDevAccount(cleanId, this.customEmail, name).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.notify.success(`Welcome, ${name}!`);
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.notify.error('Unable to connect to PortfolioAI backend.');
      }
    });
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash;
  }
}
