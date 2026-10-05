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
      <!-- Ambient Glow Orbs -->
      <div class="ambient-glow glow-1"></div>
      <div class="ambient-glow glow-2"></div>

      <div class="login-container">
        <div class="login-card glass-panel">
          <!-- Card Header -->
          <div class="login-header">
            <div class="brand-badge">
              <span class="badge-pill">
                <app-icon name="sparkles" [size]="14" />
                AI Career Suite
              </span>
            </div>

            <div class="brand-logo">
              <app-icon name="sparkles" [size]="30" />
            </div>

            <h1 class="brand-title">Portfolio<span class="gradient-text">AI</span></h1>
            <p class="tagline">Sign in with your Google account to create, customize, and publish your professional portfolio.</p>
          </div>

          <!-- Main Actions -->
          <div class="login-actions">
            <!-- Insecure HTTP Warning (Google OAuth strictly blocks http:// on public domains with origin_mismatch) -->
            @if (isInsecureHttpOrigin()) {
              <div class="https-alert-card animate-slide-down">
                <div class="alert-icon">⚠️</div>
                <div class="alert-body">
                  <strong>HTTPS Required for Google Sign-In</strong>
                  <p>You are accessing via <code>http://</code> ("Not secure"). Google OAuth blocks <code>http://</code> with <code>Error 400: origin_mismatch</code>.</p>
                  <div class="alert-actions">
                    <a [href]="secureUrl" class="btn-sm btn-primary">Switch to HTTPS</a>
                    <button class="btn-sm btn-ghost" (click)="showHttpsHelp.set(!showHttpsHelp())" type="button">
                      {{ showHttpsHelp() ? 'Hide Guide' : 'How to enable SSL?' }}
                    </button>
                  </div>
                  @if (showHttpsHelp()) {
                    <div class="https-help-box animate-slide-down">
                      <p style="margin: 0 0 0.25rem 0;"><strong>MonsterASP.net Free SSL (Takes 30 seconds):</strong></p>
                      <ol>
                        <li>Log into your <strong>MonsterASP.net Control Panel</strong>.</li>
                        <li>Go to <strong>Domains</strong> in the left menu.</li>
                        <li>Click the <strong>green lock icon</strong> next to <code>sudhirraj.runasp.net</code>.</li>
                        <li>Select <strong>Let's Encrypt</strong> &rarr; click <strong>Enable HTTPS</strong>!</li>
                      </ol>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Google Sign-In Container (Stabilized for Zero Layout Shift) -->
            <div class="google-auth-button-container">
              <!-- Native Google GIS Slot (renders official Google Sign-In button when ready) -->
              <div id="googleBtnSlot" class="google-slot-wrapper" [class.rendered]="isGoogleGsiRendered()"></div>

              <!-- Primary Google Trigger Button (triggers device Google account popup) -->
              @if (!isGoogleGsiRendered()) {
                <button
                  class="btn-google"
                  (click)="triggerGoogleDevicePopup()"
                  [disabled]="isLoading()"
                  type="button"
                >
                  <div class="google-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </div>
                  <span class="btn-text">
                    {{ isLoading() ? 'Signing in...' : 'Sign in with Google' }}
                  </span>
                  @if (isLoading()) {
                    <span class="spinner"></span>
                  }
                </button>
              }
            </div>

            <!-- Google OAuth Setup Card (Shown if Google Client ID is not yet configured) -->
            @if (!hasValidGoogleClientId() || showOauthSetup()) {
              <div class="oauth-setup-card animate-slide-down">
                <div class="setup-header">
                  <span class="status-chip" [class.live]="hasValidGoogleClientId()">
                    <span class="dot"></span>
                    {{ hasValidGoogleClientId() ? 'Google OAuth Connected' : 'Google Setup Required' }}
                  </span>
                  <h4>Connect Google Cloud Client ID</h4>
                  <p>To enable the native Google Account popup on your device, paste your Google Cloud Client ID (100% Free):</p>
                </div>

                <div class="form-group">
                  <input
                    type="text"
                    class="input-control font-mono"
                    [(ngModel)]="inputClientId"
                    placeholder="xxxx-xxxx.apps.googleusercontent.com"
                  />
                </div>

                <div class="setup-actions">
                  <button class="btn-sm btn-primary" (click)="saveGoogleClientId()" type="button">
                    Save & Test Google Popup
                  </button>
                  @if (hasStoredClientId()) {
                    <button class="btn-sm btn-secondary" (click)="clearGoogleClientId()" type="button">
                      Reset
                    </button>
                  }
                  <button class="btn-sm btn-ghost" (click)="showInstructions.set(!showInstructions())" type="button">
                    {{ showInstructions() ? 'Hide Guide' : 'How to get free ID?' }}
                  </button>
                </div>

                <!-- Collapsible Step-by-Step Instructions -->
                @if (showInstructions()) {
                  <div class="instructions-box animate-slide-down">
                    <p class="inst-step"><strong>Step 1:</strong> Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener">Google Cloud Console</a> (Free).</p>
                    <p class="inst-step"><strong>Step 2:</strong> Go to <em>APIs & Services &rarr; Credentials</em> and click <strong>Create Credentials &rarr; OAuth client ID</strong>.</p>
                    <p class="inst-step"><strong>Step 3:</strong> Select <strong>Web application</strong>. Under <em>Authorized JavaScript origins</em>, add:</p>
                    <div class="code-box">
                      <code>http://localhost:4200</code><br/>
                      <code>https://sudhirraj.runasp.net</code>
                    </div>
                    <p class="inst-step"><strong>Step 4:</strong> Click <strong>Create</strong>, copy the Client ID, and paste it above!</p>
                  </div>
                }
              </div>
            }

            <!-- Settings toggle when Client ID is already configured -->
            @if (hasValidGoogleClientId() && !showOauthSetup()) {
              <div class="oauth-toggle-container">
                <button
                  type="button"
                  class="toggle-link"
                  (click)="showOauthSetup.set(true)"
                >
                  <app-icon name="settings" [size]="13" />
                  <span>Google Cloud OAuth Settings</span>
                </button>
              </div>
            }

            <!-- Developer Offline Access (PIN Required — Never Anonymous) -->
            <div class="dev-toggle-container">
              <button
                type="button"
                class="toggle-link text-muted"
                (click)="showDevMode.set(!showDevMode())"
              >
                <app-icon name="shield" [size]="12" />
                <span>{{ showDevMode() ? 'Hide Developer Access' : 'Developer Access (PIN Required)' }}</span>
              </button>
            </div>

            @if (showDevMode()) {
              <form (ngSubmit)="handleDevSubmit()" class="email-form animate-slide-down">
                <div class="form-group">
                  <label for="userEmail">Account Email</label>
                  <div class="input-wrapper">
                    <app-icon name="mail" [size]="16" class="input-icon" />
                    <input
                      id="userEmail"
                      type="email"
                      class="input-control"
                      [(ngModel)]="devEmailInput"
                      name="devEmailInput"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="userName">Full Name (Optional)</label>
                  <div class="input-wrapper">
                    <app-icon name="user" [size]="16" class="input-icon" />
                    <input
                      id="userName"
                      type="text"
                      class="input-control"
                      [(ngModel)]="devNameInput"
                      name="devNameInput"
                      placeholder="Your Name"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="securityKey">Security PIN</label>
                  <div class="input-wrapper">
                    <app-icon name="shield" [size]="16" class="input-icon" />
                    <input
                      id="securityKey"
                      type="password"
                      class="input-control font-mono"
                      [(ngModel)]="devPinInput"
                      name="devPinInput"
                      placeholder="Enter security PIN"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn-secondary-glow"
                  [disabled]="isLoading() || !devEmailInput || !devPinInput"
                >
                  <span>Authenticate with PIN</span>
                  <app-icon name="arrow-right" [size]="16" />
                </button>
              </form>
            }
          </div>

          <!-- Card Footer -->
          <div class="login-footer">
            <div class="security-pills">
              <div class="pill">
                <app-icon name="shield" [size]="14" />
                <span>Private & Secure • Isolated Workspaces</span>
              </div>
            </div>

            <a routerLink="/" class="back-link">
              <span>&larr; Back to Homepage</span>
            </a>
          </div>
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
      padding: 2rem 1.25rem;
      background-color: var(--bg-app);
      position: relative;
      overflow: hidden;
    }

    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.35;
    }

    .glow-1 {
      width: 460px;
      height: 460px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0) 70%);
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
    }

    .glow-2 {
      width: 360px;
      height: 360px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%);
      bottom: -80px;
      right: 15%;
    }

    .login-container {
      width: 100%;
      max-width: 460px;
      position: relative;
      z-index: 1;
      animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .login-card {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      text-align: center;
    }

    .login-header {
      margin-bottom: 1.75rem;
    }

    .brand-badge {
      display: flex;
      justify-content: center;
      margin-bottom: 1.125rem;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.3rem 0.8rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .brand-logo {
      width: 58px;
      height: 58px;
      margin: 0 auto 1.125rem;
      border-radius: 16px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
    }

    .brand-title {
      font-size: 1.875rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }

    .gradient-text {
      background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .tagline {
      font-size: 0.875rem;
      color: #94a3b8;
      line-height: 1.5;
    }

    .login-actions {
      display: flex;
      flex-direction: column;
      gap: 1.125rem;
      margin-bottom: 1.5rem;
    }

    .google-auth-button-container {
      position: relative;
      width: 100%;
      min-height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .google-slot-wrapper {
      display: none;
      justify-content: center;
      width: 100%;
      min-height: 48px;
    }

    .google-slot-wrapper.rendered {
      display: flex;
    }

    .btn-google {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.875rem;
      width: 100%;
      padding: 0.875rem 1.5rem;
      border-radius: 12px;
      background: #ffffff;
      color: #1e293b;
      font-size: 0.95rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-google:hover:not(:disabled) {
      background: #f8fafc;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15);
    }

    .btn-google:disabled {
      opacity: 0.75;
      cursor: not-allowed;
    }

    .google-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(30, 41, 59, 0.2);
      border-top-color: #1e293b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .email-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      text-align: left;
      background: rgba(15, 23, 42, 0.6);
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .form-group label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 0.875rem;
      color: #64748b;
      pointer-events: none;
    }

    .input-wrapper .input-control {
      padding-left: 2.375rem;
    }

    .input-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
      font-size: 0.875rem;
      transition: all 0.15s ease;
      outline: none;
    }

    .input-control:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .font-mono {
      font-family: var(--font-mono, monospace);
      font-size: 0.8125rem;
    }

    .btn-secondary-glow {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #e0e7ff;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary-glow:hover:not(:disabled) {
      background: rgba(99, 102, 241, 0.35);
      border-color: #6366f1;
      transform: translateY(-1px);
    }

    .oauth-toggle-container,
    .dev-toggle-container {
      display: flex;
      justify-content: center;
      margin-top: 0.25rem;
    }

    .toggle-link {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background: transparent;
      border: none;
      color: #818cf8;
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: color 0.15s ease;
    }

    .toggle-link:hover {
      color: #a5b4fc;
    }

    .toggle-link.text-muted {
      color: #64748b;
    }

    .toggle-link.text-muted:hover {
      color: #94a3b8;
    }

    .https-alert-card {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 12px;
      padding: 1rem;
      text-align: left;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .alert-icon {
      font-size: 1.25rem;
      line-height: 1;
    }

    .alert-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .alert-body strong {
      color: #fbbf24;
      font-size: 0.8125rem;
    }

    .alert-body p {
      font-size: 0.75rem;
      color: #cbd5e1;
      margin: 0;
      line-height: 1.4;
    }

    .alert-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.25rem;
      align-items: center;
    }

    .https-help-box {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.625rem 0.875rem;
      margin-top: 0.35rem;
      font-size: 0.725rem;
      color: #94a3b8;
    }

    .https-help-box ol {
      margin: 0.25rem 0 0 1rem;
      padding: 0;
    }

    .https-help-box li {
      margin-bottom: 0.2rem;
    }

    .oauth-setup-card {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: 14px;
      padding: 1.25rem;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      font-size: 0.6875rem;
      font-weight: 600;
      margin-bottom: 0.375rem;
    }

    .status-chip.live {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .status-chip .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .setup-header h4 {
      font-size: 0.9375rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 0.25rem;
    }

    .setup-header p {
      font-size: 0.775rem;
      color: #94a3b8;
      line-height: 1.45;
    }

    .setup-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .btn-sm {
      padding: 0.5rem 0.875rem;
      font-size: 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-sm.btn-primary {
      background: #6366f1;
      color: #ffffff;
    }

    .btn-sm.btn-primary:hover {
      background: #4f46e5;
    }

    .btn-sm.btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }

    .btn-sm.btn-secondary:hover {
      background: rgba(255, 255, 255, 0.14);
    }

    .btn-sm.btn-ghost {
      background: transparent;
      color: #818cf8;
      text-decoration: underline;
      padding: 0.5rem 0.25rem;
    }

    .btn-sm.btn-ghost:hover {
      color: #a5b4fc;
    }

    .instructions-box {
      background: rgba(2, 6, 23, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.875rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .inst-step {
      font-size: 0.75rem;
      color: #cbd5e1;
      line-height: 1.4;
      margin: 0;
    }

    .inst-step a {
      color: #818cf8;
      text-decoration: underline;
    }

    .code-box {
      background: rgba(0, 0, 0, 0.4);
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      font-family: var(--font-mono, monospace);
      font-size: 0.72rem;
      color: #a5b4fc;
      line-height: 1.5;
    }

    .login-footer {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      align-items: center;
      padding-top: 0.25rem;
    }

    .security-pills .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: #64748b;
    }

    .back-link {
      font-size: 0.8125rem;
      color: #94a3b8;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .back-link:hover {
      color: #ffffff;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-down {
      animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit {
  authService = inject(AuthService);
  router = inject(Router);
  notify = inject(NotificationService);

  isLoading = signal<boolean>(false);
  isGoogleGsiRendered = signal<boolean>(false);
  showOauthSetup = signal<boolean>(false);
  showInstructions = signal<boolean>(false);
  showDevMode = signal<boolean>(false);
  showHttpsHelp = signal<boolean>(false);

  devEmailInput = '';
  devNameInput = '';
  devPinInput = '';

  get secureUrl(): string {
    if (typeof window === 'undefined') return 'https://sudhirraj.runasp.net/login';
    return 'https://' + window.location.host + window.location.pathname;
  }

  isInsecureHttpOrigin(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.location.protocol === 'http:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    );
  }

  private readonly defaultClientId = '790891587195-05dlm3kcb4qf6c35chk65erc314dc58i.apps.googleusercontent.com';
  private readonly clientStorageKey = 'portfolio_custom_google_client_id';
  googleClientId: string | null = this.defaultClientId;
  inputClientId = this.defaultClientId;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadGoogleConfig();
  }

  ngAfterViewInit(): void {
    if (this.hasValidGoogleClientId()) {
      this.tryInitGoogleGsi();
    }
  }

  private loadGoogleConfig(): void {
    // 1. Check local storage override first
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.clientStorageKey);
      if (stored && this.isValidClientId(stored)) {
        this.googleClientId = stored;
        this.inputClientId = stored;
        this.tryInitGoogleGsi();
        return;
      }
    }

    // 2. Query server auth configuration
    this.authService.getAuthConfig().subscribe({
      next: res => {
        if (res.success && res.data?.googleClientId && this.isValidClientId(res.data.googleClientId)) {
          this.googleClientId = res.data.googleClientId;
          this.inputClientId = this.googleClientId;
          this.tryInitGoogleGsi();
        }
      },
      error: () => {}
    });
  }

  hasValidGoogleClientId(): boolean {
    return !!this.googleClientId && this.isValidClientId(this.googleClientId);
  }

  hasStoredClientId(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return !!localStorage.getItem(this.clientStorageKey);
  }

  private isValidClientId(clientId: string): boolean {
    return (
      !!clientId &&
      clientId.length > 20 &&
      clientId.includes('.apps.googleusercontent.com') &&
      !clientId.startsWith('YOUR_') &&
      !clientId.toLowerCase().includes('placeholder')
    );
  }

  private tryInitGoogleGsi(): void {
    if (!this.hasValidGoogleClientId()) return;

    if (typeof google !== 'undefined' && google?.accounts?.id) {
      this.initGoogleGsi();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof google !== 'undefined' && google?.accounts?.id) {
          clearInterval(interval);
          this.initGoogleGsi();
        } else if (attempts >= 20) {
          clearInterval(interval);
        }
      }, 250);
    }
  }

  private initGoogleGsi(): void {
    if (!this.hasValidGoogleClientId()) return;

    try {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (res: any) => this.handleGoogleCredential(res?.credential),
        auto_select: false,
        cancel_on_tap_outside: false
      });

      const slot = document.getElementById('googleBtnSlot');
      if (slot) {
        google.accounts.id.renderButton(slot, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        });
        this.isGoogleGsiRendered.set(true);
      }
    } catch {
      this.isGoogleGsiRendered.set(false);
    }
  }

  triggerGoogleDevicePopup(): void {
    if (this.isInsecureHttpOrigin()) {
      this.notify.warning('Google Sign-In strictly requires HTTPS on public domains. Please switch to HTTPS or enable Free SSL in MonsterASP.');
      return;
    }

    if (!this.hasValidGoogleClientId()) {
      this.showOauthSetup.set(true);
      this.notify.info('To enable the native Google device popup, please configure your Google Cloud Client ID below.');
      return;
    }

    // Google OAuth2 Token Client (opens Google account selector window on this device)
    if (typeof google !== 'undefined' && google?.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: this.googleClientId,
          scope: 'email profile openid',
          callback: (res: any) => {
            if (res?.access_token) {
              this.handleGoogleAccessToken(res.access_token);
            } else if (res?.error) {
              this.notify.error(`Google authentication cancelled or failed.`);
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('OAuth2 popup error:', e);
      }
    }

    // Secondary fallback: GIS One-Tap Prompt
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      try {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            this.notify.info('Google prompt not displayed. Please check popup blockers.');
          }
        });
        return;
      } catch {}
    }

    this.notify.warning('Google Identity Services library is still loading. Please try again in a moment.');
  }

  handleGoogleCredential(credential: string): void {
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

  handleGoogleAccessToken(accessToken: string): void {
    if (!accessToken) return;

    this.isLoading.set(true);
    this.authService.loginWithGoogle({ accessToken }).subscribe({
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

  handleDevSubmit(): void {
    const email = this.devEmailInput.trim().toLowerCase();
    const pin = this.devPinInput.trim();

    if (!email || !email.includes('@')) {
      this.notify.warning('Please enter a valid email.');
      return;
    }

    if (!pin) {
      this.notify.warning('Security PIN is required for developer access.');
      return;
    }

    this.isLoading.set(true);
    const name = this.devNameInput.trim() || email.split('@')[0];

    this.authService.loginWithDevAccount(undefined, email, name, pin).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.notify.success(`Welcome, ${res.data?.name || name}!`);
          this.router.navigate(['/dashboard']);
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.notify.error(err.error?.message || 'Authentication verification failed.');
      }
    });
  }

  saveGoogleClientId(): void {
    if (!this.isValidClientId(this.inputClientId)) {
      this.notify.warning('Please enter a valid Google Client ID ending in .apps.googleusercontent.com');
      return;
    }

    this.googleClientId = this.inputClientId.trim();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.clientStorageKey, this.googleClientId);
    }

    this.notify.success('Google Client ID saved! Initializing device popup...');
    this.tryInitGoogleGsi();
    setTimeout(() => {
      this.triggerGoogleDevicePopup();
    }, 400);
  }

  clearGoogleClientId(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.clientStorageKey);
    }
    this.googleClientId = null;
    this.inputClientId = '';
    this.isGoogleGsiRendered.set(false);
    this.notify.info('Google Client ID reset.');
  }
}
