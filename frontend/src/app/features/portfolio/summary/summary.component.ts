import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioStateService } from '../../../core/services/portfolio-state.service';
import { AiApiService } from '../../../core/services/ai-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../../../shared/components/icon.component';

@Component({
  selector: 'app-summary-editor',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="editor-section">
      <div class="section-title-row">
        <div>
          <h3>Professional Summary / About Me</h3>
          <p>Your executive elevator pitch summarizing skills, values, and career trajectory.</p>
        </div>

        <!-- AI Assistant Action Button -->
        <button
          class="btn btn-secondary btn-sm"
          (click)="toggleAiModal()"
          [disabled]="isAiImproving()"
        >
          <app-icon name="sparkles" [size]="16" />
          <span>{{ isAiImproving() ? 'Polishing with AI...' : 'Improve with AI' }}</span>
        </button>
      </div>

      <!-- AI Improvement Flyout / Modal if triggered -->
      @if (showAiModal()) {
        <div class="ai-suggestion-box animate-fade-in card">
          <div class="ai-box-header">
            <div class="badge badge-primary">
              <app-icon name="sparkles" [size]="14" />
              <span>AI Content Assistant</span>
            </div>
            <button class="icon-btn-sm" (click)="showAiModal.set(false)">
              <app-icon name="x" [size]="14" />
            </button>
          </div>

          <div class="ai-tone-selector">
            <label>Select Tone:</label>
            <div class="tone-chips">
              <button
                class="tone-chip"
                [class.active]="selectedTone === 'executive'"
                (click)="selectedTone = 'executive'"
              >
                Executive & Leadership
              </button>
              <button
                class="tone-chip"
                [class.active]="selectedTone === 'recruiter'"
                (click)="selectedTone = 'recruiter'"
              >
                Recruiter-Friendly
              </button>
              <button
                class="tone-chip"
                [class.active]="selectedTone === 'concise'"
                (click)="selectedTone = 'concise'"
              >
                Short & Punchy
              </button>
            </div>
          </div>

          <div class="ai-actions">
            <button class="btn btn-primary btn-sm" (click)="runAiImprovement()" [disabled]="isAiImproving()">
              <span>Generate AI Polish</span>
            </button>
          </div>

          @if (aiGeneratedSuggestion()) {
            <div class="ai-result">
              <div class="result-label">AI Suggestion:</div>
              <p class="suggestion-text">{{ aiGeneratedSuggestion() }}</p>
              <div class="result-buttons">
                <button class="btn btn-primary btn-sm" (click)="acceptSuggestion()">
                  <app-icon name="check" [size]="14" />
                  <span>Accept & Replace</span>
                </button>
                <button class="btn btn-ghost btn-sm" (click)="aiGeneratedSuggestion.set('')">
                  <span>Discard</span>
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (state.portfolio()?.summary; as s) {
        <div class="form-group">
          <label for="summaryTitle">Section Heading</label>
          <input
            id="summaryTitle"
            type="text"
            class="input-control"
            [(ngModel)]="s.title"
            (ngModelChange)="onModelChange()"
            placeholder="e.g. About Me / Professional Summary"
          />
        </div>

        <div class="form-group">
          <div class="flex items-center justify-between">
            <label for="summaryContent">Summary Description</label>
            <span class="helper-text">{{ s.content.length || 0 }} characters</span>
          </div>
          <textarea
            id="summaryContent"
            rows="6"
            class="input-control textarea-large"
            [(ngModel)]="s.content"
            (ngModelChange)="onModelChange()"
            placeholder="Write an impactful 3-4 sentence summary of your experience, core values, and technical expertise..."
          ></textarea>
        </div>
      }
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
      flex-wrap: wrap;
      gap: 1rem;

      h3 { font-size: 1.25rem; }
      p { font-size: 0.875rem; }
    }

    .textarea-large {
      min-height: 160px;
      line-height: 1.6;
    }

    .ai-suggestion-box {
      background: var(--bg-elevated);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .ai-box-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .ai-tone-selector {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
      }

      .tone-chips {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .tone-chip {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
        border-radius: var(--radius-full);
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);

        &.active, &:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }
      }
    }

    .ai-result {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem;

      .result-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--accent-primary);
        text-transform: uppercase;
        margin-bottom: 0.5rem;
      }

      .suggestion-text {
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .result-buttons {
        display: flex;
        gap: 0.5rem;
      }
    }

    .icon-btn-sm {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;

      &:hover {
        color: var(--text-primary);
      }
    }
  `]
})
export class SummaryComponent {
  state = inject(PortfolioStateService);
  aiApi = inject(AiApiService);
  notify = inject(NotificationService);

  showAiModal = signal<boolean>(false);
  isAiImproving = signal<boolean>(false);
  aiGeneratedSuggestion = signal<string>('');
  selectedTone = 'recruiter';

  toggleAiModal(): void {
    this.showAiModal.set(!this.showAiModal());
    this.aiGeneratedSuggestion.set('');
  }

  runAiImprovement(): void {
    const current = this.state.portfolio()?.summary?.content || '';
    if (!current) {
      this.notify.warning('Please enter a draft summary first so AI can improve it.');
      return;
    }

    this.isAiImproving.set(true);
    this.aiApi.improveSummary(current, this.selectedTone).subscribe({
      next: res => {
        this.isAiImproving.set(false);
        if (res.success && res.data) {
          this.aiGeneratedSuggestion.set(res.data);
        }
      },
      error: () => {
        this.isAiImproving.set(false);
        this.notify.error('AI improvement failed.');
      }
    });
  }

  acceptSuggestion(): void {
    const suggestion = this.aiGeneratedSuggestion();
    if (!suggestion) return;

    this.state.updatePortfolio(p => {
      p.summary.content = suggestion;
      return p;
    });

    this.showAiModal.set(false);
    this.notify.success('AI summary accepted.');
  }

  onModelChange(): void {
    const current = this.state.portfolio();
    if (current) {
      this.state.updateSummary(current.summary);
    }
  }
}
