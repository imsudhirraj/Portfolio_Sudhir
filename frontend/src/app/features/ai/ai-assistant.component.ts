import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioStateService } from '../../core/services/portfolio-state.service';
import { AiApiService } from '../../core/services/ai-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="assistant-view">
      <div class="view-header">
        <h2>AI Content Studio</h2>
        <p>Harness AI to polish grammar, craft recruiter-friendly bullet points, and generate high-impact headlines.</p>
      </div>

      <div class="assistant-grid">
        <!-- Tool 1: Professional Headline Generator -->
        <div class="assistant-card card">
          <div class="tool-header">
            <div class="tool-icon"><app-icon name="sparkles" [size]="20" /></div>
            <div>
              <h3>Headline Generator</h3>
              <p>Create a punchy, recruiter-targeted portfolio hero headline.</p>
            </div>
          </div>

          <div class="form-group">
            <label>Current Role / Specialty</label>
            <input
              type="text"
              class="input-control"
              [(ngModel)]="headlineRole"
              placeholder="e.g. Lead Software Architect"
            />
          </div>

          <button
            class="btn btn-primary btn-sm"
            (click)="generateHeadline()"
            [disabled]="isGeneratingHeadline()"
          >
            <span>{{ isGeneratingHeadline() ? 'Generating...' : 'Generate AI Headline' }}</span>
          </button>

          @if (generatedHeadline()) {
            <div class="result-box animate-fade-in">
              <span class="res-title">Suggested Headline:</span>
              <p class="res-text">"{{ generatedHeadline() }}"</p>
              <button class="btn btn-secondary btn-sm" (click)="applyHeadline()">
                <app-icon name="check" [size]="14" />
                <span>Apply to Title</span>
              </button>
            </div>
          }
        </div>

        <!-- Tool 2: Summary Polisher -->
        <div class="assistant-card card">
          <div class="tool-header">
            <div class="tool-icon"><app-icon name="edit" [size]="20" /></div>
            <div>
              <h3>Summary Rewriter</h3>
              <p>Enhance grammar, tone, and authority of your About Me section.</p>
            </div>
          </div>

          <div class="form-group">
            <label>Tone</label>
            <div class="tone-row">
              <button class="btn btn-sm" [class.btn-primary]="summaryTone === 'executive'" [class.btn-secondary]="summaryTone !== 'executive'" (click)="summaryTone = 'executive'">Executive</button>
              <button class="btn btn-sm" [class.btn-primary]="summaryTone === 'recruiter'" [class.btn-secondary]="summaryTone !== 'recruiter'" (click)="summaryTone = 'recruiter'">Recruiter</button>
              <button class="btn btn-sm" [class.btn-primary]="summaryTone === 'concise'" [class.btn-secondary]="summaryTone !== 'concise'" (click)="summaryTone = 'concise'">Concise</button>
            </div>
          </div>

          <div class="form-group">
            <label>Draft Summary</label>
            <textarea
              rows="3"
              class="input-control"
              [(ngModel)]="draftSummary"
              placeholder="Paste or write your draft summary..."
            ></textarea>
          </div>

          <button
            class="btn btn-primary btn-sm"
            (click)="improveSummary()"
            [disabled]="isImprovingSummary() || !draftSummary.trim()"
          >
            <span>{{ isImprovingSummary() ? 'Rewriting...' : 'Rewrite with AI' }}</span>
          </button>

          @if (polishedSummary()) {
            <div class="result-box animate-fade-in">
              <span class="res-title">Polished Summary:</span>
              <p class="res-text">{{ polishedSummary() }}</p>
              <button class="btn btn-secondary btn-sm" (click)="applySummary()">
                <app-icon name="check" [size]="14" />
                <span>Apply to Portfolio</span>
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assistant-view {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      max-width: 960px;
    }

    .view-header {
      h2 { font-size: 1.625rem; margin-bottom: 0.375rem; }
      p { font-size: 0.9375rem; }
    }

    .assistant-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 1.5rem;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .assistant-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .tool-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .tool-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        background: rgba(99, 102, 241, 0.1);
        color: var(--accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      h3 { font-size: 1.125rem; margin-bottom: 0.125rem; }
      p { font-size: 0.75rem; color: var(--text-muted); }
    }

    .tone-row {
      display: flex;
      gap: 0.5rem;
    }

    .result-box {
      background: var(--bg-elevated);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 1rem;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .res-title {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--accent-primary);
        text-transform: uppercase;
      }

      .res-text {
        font-size: 0.875rem;
        line-height: 1.5;
        color: var(--text-primary);
      }
    }
  `]
})
export class AiAssistantComponent {
  state = inject(PortfolioStateService);
  aiApi = inject(AiApiService);
  notify = inject(NotificationService);

  headlineRole = 'Senior Software Engineer';
  isGeneratingHeadline = signal<boolean>(false);
  generatedHeadline = signal<string>('');

  summaryTone = 'recruiter';
  draftSummary = '';
  isImprovingSummary = signal<boolean>(false);
  polishedSummary = signal<string>('');

  constructor() {
    const p = this.state.portfolio();
    if (p) {
      this.headlineRole = p.profile.professionalTitle || this.headlineRole;
      this.draftSummary = p.summary.content || '';
    }
  }

  generateHeadline(): void {
    const p = this.state.portfolio();
    const skills = p?.skills.map(s => s.name) || ['C#', 'Angular', 'Cloud'];

    this.isGeneratingHeadline.set(true);
    this.aiApi.generateHeadline(p?.profile.fullName || 'Candidate', this.headlineRole, skills).subscribe({
      next: res => {
        this.isGeneratingHeadline.set(false);
        if (res.success && res.data) {
          this.generatedHeadline.set(res.data);
        }
      },
      error: () => {
        this.isGeneratingHeadline.set(false);
        this.notify.error('Failed to generate headline.');
      }
    });
  }

  applyHeadline(): void {
    const headline = this.generatedHeadline();
    if (!headline) return;

    this.state.updatePortfolio(p => {
      p.profile.professionalTitle = headline;
      return p;
    });
    this.notify.success('Headline applied to profile.');
  }

  improveSummary(): void {
    if (!this.draftSummary.trim()) return;

    this.isImprovingSummary.set(true);
    this.aiApi.improveSummary(this.draftSummary, this.summaryTone).subscribe({
      next: res => {
        this.isImprovingSummary.set(false);
        if (res.success && res.data) {
          this.polishedSummary.set(res.data);
        }
      },
      error: () => {
        this.isImprovingSummary.set(false);
        this.notify.error('Failed to rewrite summary.');
      }
    });
  }

  applySummary(): void {
    const polished = this.polishedSummary();
    if (!polished) return;

    this.state.updatePortfolio(p => {
      p.summary.content = polished;
      return p;
    });
    this.notify.success('Polished summary saved to portfolio.');
  }
}
