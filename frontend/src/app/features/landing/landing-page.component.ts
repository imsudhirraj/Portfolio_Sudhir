import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="landing-page">
      <!-- Navbar -->
      <header class="landing-header">
        <div class="container header-container">
          <div class="brand">
            <div class="brand-badge">
              <app-icon name="sparkles" [size]="18" />
            </div>
            <span class="brand-name">Portfolio<strong>AI</strong></span>
          </div>

          <div class="header-actions">
            <button class="theme-toggle" (click)="themeService.toggleTheme()" title="Toggle theme">
              <app-icon [name]="themeService.currentMode() === 'dark' ? 'sun' : 'moon'" [size]="18" />
            </button>

            @if (authService.isAuthenticated()) {
              <a routerLink="/dashboard" class="btn btn-primary btn-sm">
                <span>Go to Dashboard</span>
                <app-icon name="arrow-right" [size]="16" />
              </a>
            } @else {
              <a routerLink="/login" class="btn btn-secondary btn-sm">Sign In</a>
              <a routerLink="/login" class="btn btn-primary btn-sm">Get Started</a>
            }
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container hero-container">
          <div class="hero-badge">
            <app-icon name="sparkles" [size]="14" />
            <span>AI-Powered • 100% DB-Free Architecture</span>
          </div>

          <h1 class="hero-title">
            Build a Portfolio From Your Resume <br />
            <span class="gradient-text">— Powered by AI</span>
          </h1>

          <p class="hero-subtitle">
            Upload your resume, let AI intelligently parse and organize your experience,
            fine-tune every section with total control, and publish a recruiter-ready portfolio in minutes.
          </p>

          <div class="hero-actions">
            <a routerLink="/login" class="btn btn-primary btn-lg">
              <app-icon name="sparkles" [size]="18" />
              <span>Build My Portfolio</span>
            </a>
            <a routerLink="/u/sudhir-raj" class="btn btn-secondary btn-lg">
              <app-icon name="eye" [size]="18" />
              <span>View Example</span>
            </a>
          </div>

          <!-- Interactive UI Preview Card -->
          <div class="hero-preview">
            <div class="preview-chrome">
              <div class="chrome-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="chrome-address">portfolioai.com/u/sudhir-raj</div>
            </div>
            <div class="preview-content">
              <div class="preview-profile">
                <div class="avatar-placeholder">SR</div>
                <div>
                  <div class="preview-name">Sudhir Raj</div>
                  <div class="preview-title">Principal Cloud Architect • Ex-Tech Innovators</div>
                </div>
                <div class="preview-badges">
                  <span class="badge badge-success">✓ Published</span>
                  <span class="badge badge-primary">Developer Theme</span>
                </div>
              </div>
              <div class="preview-grid">
                <div class="preview-card">
                  <span class="label">AI Confidence Score</span>
                  <span class="value">98.4% Match</span>
                </div>
                <div class="preview-card">
                  <span class="label">Total Extracted Records</span>
                  <span class="value">14 Skills • 3 Projects</span>
                </div>
                <div class="preview-card">
                  <span class="label">Storage Type</span>
                  <span class="value">Atomic JSON File Storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="section how-it-works">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Streamlined Workflow</span>
            <h2>From PDF to Published in 5 Steps</h2>
            <p>You stay in total command. AI provides high-fidelity suggestions, you decide what to keep.</p>
          </div>

          <div class="steps-grid">
            <div class="step-card">
              <div class="step-number">01</div>
              <div class="step-icon"><app-icon name="upload" [size]="24" /></div>
              <h3>Upload Resume</h3>
              <p>Drag and drop your PDF or DOCX resume. Securely validated on the server with zero data leakage.</p>
            </div>

            <div class="step-card">
              <div class="step-number">02</div>
              <div class="step-icon"><app-icon name="sparkles" [size]="24" /></div>
              <h3>AI Analyzes</h3>
              <p>State-of-the-art document parsing extracts roles, achievements, skills, and dates with confidence scoring.</p>
            </div>

            <div class="step-card">
              <div class="step-number">03</div>
              <div class="step-icon"><app-icon name="check-circle" [size]="24" /></div>
              <h3>Review Suggestions</h3>
              <p>Inspect extracted details. Accept all or cherry-pick items. Your existing portfolio is never blindly overwritten.</p>
            </div>

            <div class="step-card">
              <div class="step-number">04</div>
              <div class="step-icon"><app-icon name="palette" [size]="24" /></div>
              <h3>Customize & Theme</h3>
              <p>Pick from 4 curated themes (Minimal, Executive, Developer, Elegant). Customize colors and typography.</p>
            </div>

            <div class="step-card">
              <div class="step-number">05</div>
              <div class="step-icon"><app-icon name="globe" [size]="24" /></div>
              <h3>Publish Custom URL</h3>
              <p>Deploy to your unique public slug (e.g., /u/your-name). SEO-optimized with JSON-LD schema.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Core Features Section -->
      <section class="section features-section">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Enterprise SaaS Standards</span>
            <h2>Architected for Performance & Privacy</h2>
            <p>No databases, no tracking, just pure speed and full ownership of your data.</p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon"><app-icon name="shield" [size]="22" /></div>
              <h4>Prompt-Injection Protected</h4>
              <p>Resume text is treated strictly as untrusted input data, preventing document hijacking and ensuring output integrity.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon"><app-icon name="layout" [size]="22" /></div>
              <h4>Live Multi-Device Preview</h4>
              <p>Watch your edits reflect instantaneously across simulated desktop, tablet, and mobile viewport frames.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon"><app-icon name="refresh" [size]="22" /></div>
              <h4>Real-Time Autosave</h4>
              <p>Debounced background synchronization ensures you never lose a keystroke, with clear saving and saved status cues.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon"><app-icon name="code" [size]="22" /></div>
              <h4>Extensible AI Architecture</h4>
              <p>Built with IResumeAIService backend abstraction. Plug in Gemini, OpenAI, or run completely offline with fallback engine.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon"><app-icon name="user" [size]="22" /></div>
              <h4>Isolated User Storage</h4>
              <p>Strict folder isolation bound to authenticated Google ID claims prevents User A from ever reading User B's files.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon"><app-icon name="external" [size]="22" /></div>
              <h4>SEO & Social Ready</h4>
              <p>Public portfolios generate OpenGraph previews and structured JSON-LD Person schemas for recruiters and Google Search.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Footer -->
      <footer class="landing-footer">
        <div class="container footer-container">
          <div class="footer-cta card">
            <h2>Ready to showcase your career?</h2>
            <p>Join developers, architects, and engineering leaders building standout portfolios.</p>
            <a routerLink="/login" class="btn btn-primary btn-lg">
              <span>Start Building for Free</span>
              <app-icon name="arrow-right" [size]="18" />
            </a>
          </div>

          <div class="footer-bottom">
            <div class="footer-brand">PortfolioAI © 2026. Built with Angular 20 & .NET 9.</div>
            <div class="footer-links">
              <span>Privacy First</span>
              <span>•</span>
              <span>No Database Persistence</span>
              <span>•</span>
              <a routerLink="/u/sudhir-raj">Public Demo</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .landing-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-glass);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 0;
    }

    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .brand-badge {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        background: var(--accent-gradient);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        box-shadow: 0 4px 12px var(--accent-glow);
      }

      .brand-name {
        font-family: var(--font-heading);
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.02em;

        strong {
          color: var(--accent-primary);
        }
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .theme-toggle {
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
    }

    .hero-section {
      padding: 5rem 0 3rem;
      text-align: center;
      background: radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.15) 0%, transparent 60%);
    }

    .hero-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 1rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: var(--radius-full);
      color: #818cf8;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1.75rem;
    }

    .hero-title {
      font-size: clamp(2.25rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 1.5rem;
      letter-spacing: -0.035em;
    }

    .gradient-text {
      background: var(--accent-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      max-width: 680px;
      line-height: 1.6;
      margin-bottom: 2.25rem;
      color: var(--text-secondary);
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 3.5rem;

      @media (max-width: 640px) {
        flex-direction: column;
        width: 100%;
        max-width: 320px;
        .btn { width: 100%; }
      }
    }

    .hero-preview {
      width: 100%;
      max-width: 960px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), var(--shadow-glow);
      overflow: hidden;
      text-align: left;
    }

    .preview-chrome {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.25rem;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid var(--border-color);

      .chrome-dots {
        display: flex;
        gap: 0.375rem;
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          &.red { background: #ef4444; }
          &.yellow { background: #f59e0b; }
          &.green { background: #10b981; }
        }
      }

      .chrome-address {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--text-muted);
        background: var(--bg-primary);
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
      }
    }

    .preview-content {
      padding: 1.75rem;
    }

    .preview-profile {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;

      .avatar-placeholder {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-md);
        background: var(--accent-gradient);
        color: #ffffff;
        font-weight: 700;
        font-size: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preview-name {
        font-size: 1.25rem;
        font-weight: 700;
      }

      .preview-title {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .preview-badges {
        margin-left: auto;
        display: flex;
        gap: 0.5rem;
      }
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;

      .preview-card {
        background: var(--bg-elevated);
        border: 1px solid var(--border-color);
        padding: 1rem;
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .value {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }

    .section {
      padding: 5rem 0;
    }

    .section-header {
      text-align: center;
      max-width: 640px;
      margin: 0 auto 3.5rem;

      .section-tag {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--accent-primary);
        display: block;
        margin-bottom: 0.5rem;
      }

      h2 {
        font-size: 2.25rem;
        margin-bottom: 0.75rem;
      }
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .step-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      position: relative;
      transition: transform var(--transition-normal);

      &:hover {
        transform: translateY(-4px);
        border-color: rgba(99, 102, 241, 0.3);
      }

      .step-number {
        font-family: var(--font-mono);
        font-size: 1.5rem;
        font-weight: 800;
        color: rgba(99, 102, 241, 0.4);
        margin-bottom: 0.75rem;
      }

      .step-icon {
        color: var(--accent-primary);
        margin-bottom: 1rem;
      }

      h3 {
        font-size: 1.125rem;
        margin-bottom: 0.5rem;
      }

      p {
        font-size: 0.875rem;
        line-height: 1.5;
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.75rem;

      .feature-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        background: rgba(99, 102, 241, 0.1);
        color: var(--accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      h4 {
        font-size: 1.125rem;
        margin-bottom: 0.5rem;
      }

      p {
        font-size: 0.875rem;
        line-height: 1.5;
      }
    }

    .landing-footer {
      margin-top: auto;
      padding: 3rem 0;
      border-top: 1px solid var(--border-color);
    }

    .footer-cta {
      text-align: center;
      padding: 3rem 1.5rem;
      margin-bottom: 3rem;
      background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, var(--bg-card) 70%);

      h2 {
        font-size: 2rem;
        margin-bottom: 0.75rem;
      }

      p {
        margin-bottom: 1.75rem;
      }
    }

    .footer-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--text-muted);
      flex-wrap: wrap;
      gap: 1rem;

      .footer-links {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
    }
  `]
})
export class LandingPageComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
}
