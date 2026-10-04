import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioStateService } from '../../../core/services/portfolio-state.service';
import { CertificationItem } from '../../../core/models/portfolio.model';
import { IconComponent } from '../../../shared/components/icon.component';

@Component({
  selector: 'app-certifications-editor',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="editor-section">
      <div class="section-title-row">
        <div>
          <h3>Professional Certifications</h3>
          <p>Licenses, vendor credentials (AWS, Azure, Google Cloud, Cisco, etc.).</p>
        </div>

        <button class="btn btn-primary btn-sm" (click)="addNewCertification()">
          <app-icon name="plus" [size]="16" />
          <span>Add Certification</span>
        </button>
      </div>

      <div class="certifications-list">
        @for (item of state.portfolio()?.certifications; track item.id; let idx = $index) {
          <div class="item-card card">
            <div class="card-top-bar">
              <div class="item-summary">
                <span class="cert-name">{{ item.name || 'Certification' }}</span>
                <span class="issuer-name">• {{ item.issuer || 'Issuing Organization' }}</span>
                <span class="dates-pill">{{ item.issueDate }} {{ item.expiryDate ? '— ' + item.expiryDate : '' }}</span>
              </div>

              <div class="item-controls">
                <button class="icon-btn-ctrl delete" (click)="removeCertification(item.id)" title="Delete">
                  <app-icon name="trash" [size]="14" />
                </button>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Certification Name *</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.name"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. AWS Certified Solutions Architect"
                />
              </div>

              <div class="form-group">
                <label>Issuing Organization *</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.issuer"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. Amazon Web Services"
                />
              </div>

              <div class="form-group">
                <label>Issue Date</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.issueDate"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. 2023-05"
                />
              </div>

              <div class="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.expiryDate"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. 2026-05"
                />
              </div>

              <div class="form-group">
                <label>Verification URL</label>
                <input
                  type="url"
                  class="input-control"
                  [(ngModel)]="item.credentialUrl"
                  (ngModelChange)="onModelChange()"
                  placeholder="https://credly.com/..."
                />
              </div>

              <div class="form-group">
                <label>Credential ID</label>
                <input
                  type="text"
                  class="input-control"
                  [(ngModel)]="item.credentialId"
                  (ngModelChange)="onModelChange()"
                  placeholder="e.g. AWS-PSA-12345"
                />
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state card">
            <app-icon name="award" [size]="32" />
            <p>No certifications added yet.</p>
            <button class="btn btn-secondary btn-sm" (click)="addNewCertification()">
              <span>+ Add Certification</span>
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

    .certifications-list {
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
    }

    .item-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;

      .cert-name { font-weight: 700; color: var(--text-primary); }
      .issuer-name { color: var(--accent-primary); }
      .dates-pill {
        font-size: 0.75rem;
        background: var(--bg-secondary);
        padding: 0.125rem 0.5rem;
        border-radius: var(--radius-full);
        color: var(--text-muted);
      }
    }

    .item-controls {
      display: flex;
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

        &.delete:hover {
          color: var(--error);
          border-color: var(--error);
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
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
export class CertificationsComponent {
  state = inject(PortfolioStateService);

  addNewCertification(): void {
    const item: CertificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialUrl: '',
      credentialId: ''
    };
    this.state.addCertification(item);
  }

  removeCertification(id: string): void {
    this.state.removeCertification(id);
  }

  onModelChange(): void {
    const current = this.state.portfolio();
    if (current) {
      this.state.updatePortfolio(p => p);
    }
  }
}
