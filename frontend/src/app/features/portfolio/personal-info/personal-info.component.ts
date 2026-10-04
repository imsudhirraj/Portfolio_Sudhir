import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioStateService } from '../../../core/services/portfolio-state.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="editor-section">
      <div class="section-title-row">
        <div>
          <h3>Personal & Contact Information</h3>
          <p>This information forms your hero banner and contact section.</p>
        </div>
      </div>

      @if (state.portfolio()?.profile; as p) {
        <div class="form-grid">
          <div class="form-group">
            <label for="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              class="input-control"
              [(ngModel)]="p.fullName"
              (ngModelChange)="onModelChange()"
              placeholder="e.g. Sudhir Raj"
            />
          </div>

          <div class="form-group">
            <label for="proTitle">Professional Title *</label>
            <input
              id="proTitle"
              type="text"
              class="input-control"
              [(ngModel)]="p.professionalTitle"
              (ngModelChange)="onModelChange()"
              placeholder="e.g. Senior Software Architect"
            />
          </div>

          <div class="form-group">
            <label for="email">Email Address *</label>
            <input
              id="email"
              type="email"
              class="input-control"
              [(ngModel)]="p.email"
              (ngModelChange)="onModelChange()"
              placeholder="e.g. sudhir@example.com"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              class="input-control"
              [(ngModel)]="p.phone"
              (ngModelChange)="onModelChange()"
              placeholder="e.g. +91 98765 43210"
            />
          </div>

          <div class="form-group">
            <label for="location">Location</label>
            <input
              id="location"
              type="text"
              class="input-control"
              [(ngModel)]="p.location"
              (ngModelChange)="onModelChange()"
              placeholder="e.g. Bengaluru, India"
            />
          </div>

          <div class="form-group">
            <label for="avatar">Profile Avatar URL</label>
            <input
              id="avatar"
              type="url"
              class="input-control"
              [(ngModel)]="p.profileImage"
              (ngModelChange)="onModelChange()"
              placeholder="e.g. https://images.unsplash.com/..."
            />
          </div>

          <div class="form-group">
            <label for="linkedin">LinkedIn Profile URL</label>
            <input
              id="linkedin"
              type="url"
              class="input-control"
              [(ngModel)]="p.linkedin"
              (ngModelChange)="onModelChange()"
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div class="form-group">
            <label for="github">GitHub Profile URL</label>
            <input
              id="github"
              type="url"
              class="input-control"
              [(ngModel)]="p.github"
              (ngModelChange)="onModelChange()"
              placeholder="https://github.com/..."
            />
          </div>

          <div class="form-group full-width">
            <label for="website">Personal Website / Blog</label>
            <input
              id="website"
              type="url"
              class="input-control"
              [(ngModel)]="p.website"
              (ngModelChange)="onModelChange()"
              placeholder="https://yourdomain.com"
            />
          </div>
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

      h3 { font-size: 1.25rem; }
      p { font-size: 0.875rem; }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .full-width {
        grid-column: 1 / -1;
      }
    }
  `]
})
export class PersonalInfoComponent {
  state = inject(PortfolioStateService);

  onModelChange(): void {
    const current = this.state.portfolio();
    if (current) {
      this.state.updateProfile(current.profile);
    }
  }
}
