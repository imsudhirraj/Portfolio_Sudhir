import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AiApiService } from '../../core/services/ai-api.service';
import { PortfolioStateService } from '../../core/services/portfolio-state.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  AiAnalysisResult,
  ExtractedCertificationItem,
  ExtractedEducationItem,
  ExtractedExperienceItem,
  ExtractedProjectItem,
  ExtractedSkillItem
} from '../../core/models/ai.model';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-ai-review',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent],
  template: `
    <div class="review-view">
      <div class="view-header">
        <div class="header-text">
          <div class="badge badge-primary">
            <app-icon name="sparkles" [size]="14" />
            <span>AI Resume Extraction</span>
          </div>
          <h2>Review AI Suggestions</h2>
          <p>
            AI only assists—you are in full command. Your existing portfolio is never automatically overwritten.
            Review the extracted details below, adjust what you need, and accept items into your portfolio.
          </p>
        </div>

        @if (analysis()) {
          <div class="header-actions">
            <button class="btn btn-primary" (click)="acceptAll()">
              <app-icon name="check-circle" [size]="18" />
              <span>Accept All Suggestions</span>
            </button>
          </div>
        }
      </div>

      @if (isLoading()) {
        <div class="loading-box card">
          <app-icon name="refresh" [size]="28" customClass="spinning" />
          <p>Loading AI extraction report...</p>
        </div>
      } @else if (!analysis()) {
        <div class="no-analysis card">
          <app-icon name="sparkles" [size]="40" />
          <h3>No AI Analysis Found</h3>
          <p>Upload a resume first to extract your skills, career experience, and achievements.</p>
          <a routerLink="/dashboard/resume" class="btn btn-primary btn-sm">
            <app-icon name="upload" [size]="16" />
            <span>Go to Resume Upload</span>
          </a>
        </div>
      } @else {
        <!-- Personal Information Section -->
        @if (analysis()?.profile; as p) {
          <div class="review-card card">
            <div class="card-header">
              <div class="header-title">
                <app-icon name="user" [size]="18" />
                <h3>Personal Information</h3>
              </div>
              <div class="card-actions">
                @if (profileAccepted()) {
                  <span class="badge badge-success">✓ Accepted</span>
                } @else {
                  <button class="btn btn-sm btn-primary" (click)="acceptProfile()">Accept Profile</button>
                  <button class="btn btn-sm btn-ghost" (click)="ignoreProfile()">Ignore</button>
                }
              </div>
            </div>

            <div class="fields-list">
              <div class="field-item">
                <span class="field-label">Full Name:</span>
                <span class="field-value">{{ p.fullName.value || 'Not identified' }}</span>
                <span class="badge" [class]="getConfidenceBadge(p.fullName.confidence)">{{ p.fullName.confidence }} confidence</span>
              </div>
              <div class="field-item">
                <span class="field-label">Professional Title:</span>
                <span class="field-value">{{ p.professionalTitle.value || 'Not identified' }}</span>
                <span class="badge" [class]="getConfidenceBadge(p.professionalTitle.confidence)">{{ p.professionalTitle.confidence }} confidence</span>
              </div>
              <div class="field-item">
                <span class="field-label">Email:</span>
                <span class="field-value">{{ p.email.value || 'Not identified' }}</span>
                <span class="badge" [class]="getConfidenceBadge(p.email.confidence)">{{ p.email.confidence }} confidence</span>
              </div>
              <div class="field-item">
                <span class="field-label">Phone:</span>
                <span class="field-value">{{ p.phone.value || 'Not identified' }}</span>
                <span class="badge" [class]="getConfidenceBadge(p.phone.confidence)">{{ p.phone.confidence }} confidence</span>
              </div>
              <div class="field-item">
                <span class="field-label">LinkedIn:</span>
                <span class="field-value">{{ p.linkedin.value || 'Not identified' }}</span>
                <span class="badge" [class]="getConfidenceBadge(p.linkedin.confidence)">{{ p.linkedin.confidence }} confidence</span>
              </div>
              <div class="field-item">
                <span class="field-label">GitHub:</span>
                <span class="field-value">{{ p.github.value || 'Not identified' }}</span>
                <span class="badge" [class]="getConfidenceBadge(p.github.confidence)">{{ p.github.confidence }} confidence</span>
              </div>
            </div>
          </div>
        }

        <!-- Skills Section -->
        <div class="review-card card">
          <div class="card-header">
            <div class="header-title">
              <app-icon name="sparkles" [size]="18" />
              <h3>Extracted Skills ({{ analysis()?.skills?.length || 0 }})</h3>
            </div>
            <div class="card-actions">
              <button class="btn btn-sm btn-primary" (click)="acceptAllSkills()">Accept All Skills</button>
            </div>
          </div>

          <div class="skills-review-grid">
            @for (skill of analysis()?.skills; track skill.id) {
              <div class="skill-review-chip" [class.accepted]="acceptedSkillIds().has(skill.id)">
                <div class="chip-main">
                  <span class="name">{{ skill.name }}</span>
                  <span class="cat">{{ skill.category }}</span>
                </div>
                <div class="chip-status">
                  <span class="badge" [class]="getConfidenceBadge(skill.confidence)">{{ skill.confidence }}</span>
                  @if (acceptedSkillIds().has(skill.id)) {
                    <span class="accepted-indicator">✓</span>
                  } @else {
                    <button class="btn-chip-action accept" (click)="acceptSkill(skill)" title="Accept">Accept</button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Experience Section -->
        <div class="review-card card">
          <div class="card-header">
            <div class="header-title">
              <app-icon name="briefcase" [size]="18" />
              <h3>Work Experience ({{ analysis()?.experience?.length || 0 }})</h3>
            </div>
            <div class="card-actions">
              <button class="btn btn-sm btn-primary" (click)="acceptAllExperience()">Accept All Experience</button>
            </div>
          </div>

          <div class="items-review-list">
            @for (exp of analysis()?.experience; track exp.id) {
              <div class="item-review-row" [class.accepted]="acceptedExperienceIds().has(exp.id)">
                <div class="item-info">
                  <div class="item-heading">
                    <h4>{{ exp.jobTitle }}</h4>
                    <span class="company-tag">{{ exp.company }}</span>
                    <span class="badge" [class]="getConfidenceBadge(exp.confidence)">{{ exp.confidence }} confidence</span>
                  </div>
                  <p class="item-desc">{{ exp.description }}</p>
                  @if (exp.technologies.length) {
                    <div class="tech-tags">
                      @for (t of exp.technologies; track t) {
                        <span class="tag">{{ t }}</span>
                      }
                    </div>
                  }
                </div>

                <div class="item-btn-col">
                  @if (acceptedExperienceIds().has(exp.id)) {
                    <span class="badge badge-success">✓ Accepted</span>
                  } @else {
                    <button class="btn btn-sm btn-primary" (click)="acceptExperience(exp)">Accept</button>
                    <button class="btn btn-sm btn-ghost" (click)="ignoreExperience(exp.id)">Ignore</button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Projects Section -->
        <div class="review-card card">
          <div class="card-header">
            <div class="header-title">
              <app-icon name="code" [size]="18" />
              <h3>Projects ({{ analysis()?.projects?.length || 0 }})</h3>
            </div>
            <div class="card-actions">
              <button class="btn btn-sm btn-primary" (click)="acceptAllProjects()">Accept All Projects</button>
            </div>
          </div>

          <div class="items-review-list">
            @for (proj of analysis()?.projects; track proj.id) {
              <div class="item-review-row" [class.accepted]="acceptedProjectIds().has(proj.id)">
                <div class="item-info">
                  <div class="item-heading">
                    <h4>{{ proj.name }}</h4>
                    @if (proj.role) {
                      <span class="company-tag">{{ proj.role }}</span>
                    }
                    <span class="badge" [class]="getConfidenceBadge(proj.confidence)">{{ proj.confidence }} confidence</span>
                  </div>
                  <p class="item-desc">{{ proj.description }}</p>
                  @if (proj.technologies && proj.technologies.length > 0) {
                    <div class="tech-tags">
                      @for (t of proj.technologies; track t) {
                        <span class="tag">{{ t }}</span>
                      }
                    </div>
                  }
                </div>

                <div class="item-btn-col">
                  @if (acceptedProjectIds().has(proj.id)) {
                    <span class="badge badge-success">✓ Accepted</span>
                  } @else {
                    <button class="btn btn-sm btn-primary" (click)="acceptProject(proj)">Accept</button>
                    <button class="btn btn-sm btn-ghost" (click)="ignoreProject(proj.id)">Ignore</button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Education Section -->
        @if (analysis()?.education?.length) {
          <div class="review-card card">
            <div class="card-header">
              <div class="header-title">
                <app-icon name="graduation-cap" [size]="18" />
                <h3>Education & Credentials ({{ analysis()?.education?.length }})</h3>
              </div>
              <div class="card-actions">
                <button class="btn btn-sm btn-primary" (click)="acceptAllEducation()">Accept All Education</button>
              </div>
            </div>

            <div class="items-review-list">
              @for (edu of analysis()?.education; track edu.id) {
                <div class="item-review-row" [class.accepted]="acceptedEducationIds().has(edu.id)">
                  <div class="item-info">
                    <div class="item-heading">
                      <h4>{{ edu.degree }}</h4>
                      <span class="company-tag">{{ edu.institution }}</span>
                      <span class="badge" [class]="getConfidenceBadge(edu.confidence)">{{ edu.confidence }} confidence</span>
                    </div>
                    <div class="item-meta">
                      @if (edu.startDate || edu.endDate) {
                        <span>{{ edu.startDate }} — {{ edu.endDate }}</span>
                      }
                      @if (edu.grade) {
                        <span>• {{ edu.grade }}</span>
                      }
                      @if (edu.fieldOfStudy) {
                        <span>• {{ edu.fieldOfStudy }}</span>
                      }
                    </div>
                  </div>

                  <div class="item-btn-col">
                    @if (acceptedEducationIds().has(edu.id)) {
                      <span class="badge badge-success">✓ Accepted</span>
                    } @else {
                      <button class="btn btn-sm btn-primary" (click)="acceptEducation(edu)">Accept</button>
                      <button class="btn btn-sm btn-ghost" (click)="ignoreEducation(edu.id)">Ignore</button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Certifications Section -->
        @if (analysis()?.certifications?.length) {
          <div class="review-card card">
            <div class="card-header">
              <div class="header-title">
                <app-icon name="award" [size]="18" />
                <h3>Certifications ({{ analysis()?.certifications?.length }})</h3>
              </div>
              <div class="card-actions">
                <button class="btn btn-sm btn-primary" (click)="acceptAllCertifications()">Accept All Certifications</button>
              </div>
            </div>

            <div class="items-review-list">
              @for (cert of analysis()?.certifications; track cert.id) {
                <div class="item-review-row" [class.accepted]="acceptedCertificationIds().has(cert.id)">
                  <div class="item-info">
                    <div class="item-heading">
                      <h4>{{ cert.name }}</h4>
                      <span class="company-tag">{{ cert.issuer }}</span>
                      <span class="badge" [class]="getConfidenceBadge(cert.confidence)">{{ cert.confidence }} confidence</span>
                    </div>
                    @if (cert.issueDate) {
                      <div class="item-meta">
                        <span>Issued: {{ cert.issueDate }}</span>
                      </div>
                    }
                  </div>

                  <div class="item-btn-col">
                    @if (acceptedCertificationIds().has(cert.id)) {
                      <span class="badge badge-success">✓ Accepted</span>
                    } @else {
                      <button class="btn btn-sm btn-primary" (click)="acceptCertification(cert)">Accept</button>
                      <button class="btn btn-sm btn-ghost" (click)="ignoreCertification(cert.id)">Ignore</button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .review-view {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      max-width: 960px;
    }

    .view-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.25rem;

      .header-text {
        max-width: 640px;
        h2 { font-size: 1.625rem; margin: 0.5rem 0 0.25rem; }
        p { font-size: 0.875rem; line-height: 1.5; }
      }
    }

    .review-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 1.5rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.875rem;
      border-bottom: 1px solid var(--border-subtle);

      .header-title {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        color: var(--accent-primary);
        h3 { font-size: 1.125rem; color: var(--text-primary); }
      }

      .card-actions {
        display: flex;
        gap: 0.5rem;
      }
    }

    .fields-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .field-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
        padding: 0.375rem 0;

        .field-label {
          font-weight: 600;
          color: var(--text-muted);
          width: 140px;
          flex-shrink: 0;
        }

        .field-value {
          font-weight: 500;
          color: var(--text-primary);
          flex: 1;
        }
      }
    }

    .skills-review-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.75rem;

      .skill-review-chip {
        background: var(--bg-elevated);
        border: 1px solid var(--border-color);
        padding: 0.625rem 0.875rem;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;

        &.accepted {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.05);
        }

        .chip-main {
          display: flex;
          flex-direction: column;
          .name { font-size: 0.875rem; font-weight: 600; }
          .cat { font-size: 0.6875rem; color: var(--text-muted); }
        }

        .chip-status {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .btn-chip-action {
          background: var(--accent-primary);
          color: #ffffff;
          border: none;
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .accepted-indicator {
          color: var(--success);
          font-weight: 700;
          font-size: 0.875rem;
        }
      }
    }

    .items-review-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .item-review-row {
        background: var(--bg-elevated);
        border: 1px solid var(--border-color);
        padding: 1.25rem;
        border-radius: var(--radius-md);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1.5rem;

        &.accepted {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.05);
        }

        .item-info {
          flex: 1;

          .item-heading {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;

            h4 { font-size: 1rem; }
            .company-tag {
              color: var(--accent-primary);
              font-weight: 500;
              font-size: 0.875rem;
            }
          }

          .item-desc {
            font-size: 0.875rem;
            line-height: 1.5;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
          }

          .tech-tags {
            display: flex;
            gap: 0.375rem;
            flex-wrap: wrap;

            .tag {
              font-size: 0.6875rem;
              background: var(--bg-secondary);
              padding: 0.125rem 0.5rem;
              border-radius: var(--radius-full);
              color: var(--text-muted);
            }
          }
        }

        .item-btn-col {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
      }
    }

    .loading-box, .no-analysis {
      text-align: center;
      padding: 4rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-muted);
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AiReviewComponent implements OnInit {
  aiApi = inject(AiApiService);
  state = inject(PortfolioStateService);
  notify = inject(NotificationService);
  router = inject(Router);

  isLoading = signal<boolean>(false);
  analysis = signal<AiAnalysisResult | null>(null);

  profileAccepted = signal<boolean>(false);
  acceptedSkillIds = signal<Set<string>>(new Set());
  acceptedExperienceIds = signal<Set<string>>(new Set());
  acceptedProjectIds = signal<Set<string>>(new Set());
  acceptedEducationIds = signal<Set<string>>(new Set());
  acceptedCertificationIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.loadAnalysis();
  }

  loadAnalysis(): void {
    this.isLoading.set(true);
    this.aiApi.getLatestAnalysis().subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.analysis.set(res.data);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getConfidenceBadge(level?: string): string {
    switch (level?.toLowerCase()) {
      case 'high': return 'badge-success';
      case 'medium': return 'badge-warning';
      default: return 'badge-neutral';
    }
  }

  acceptProfile(): void {
    const p = this.analysis()?.profile;
    if (!p) return;

    this.state.updatePortfolio(port => {
      if (p.fullName.value) port.profile.fullName = p.fullName.value;
      if (p.professionalTitle.value) port.profile.professionalTitle = p.professionalTitle.value;
      if (p.email.value) port.profile.email = p.email.value;
      if (p.phone.value) port.profile.phone = p.phone.value;
      if (p.location.value) port.profile.location = p.location.value;
      if (p.linkedin.value) port.profile.linkedin = p.linkedin.value;
      if (p.github.value) port.profile.github = p.github.value;
      return port;
    });

    this.profileAccepted.set(true);
    this.notify.success('Personal profile details accepted into portfolio.');
  }

  ignoreProfile(): void {
    this.profileAccepted.set(true);
  }

  acceptSkill(skill: ExtractedSkillItem): void {
    this.state.addSkill({
      id: Math.random().toString(36).substring(2, 9),
      name: skill.name,
      category: skill.category as any,
      level: skill.level as any
    });
    this.acceptedSkillIds.update(set => new Set([...set, skill.id]));
    this.notify.success(`Skill "${skill.name}" accepted.`);
  }

  acceptAllSkills(): void {
    const skills = this.analysis()?.skills || [];
    skills.forEach(s => {
      if (!this.acceptedSkillIds().has(s.id)) {
        this.acceptSkill(s);
      }
    });
  }

  acceptExperience(exp: ExtractedExperienceItem): void {
    this.state.addExperience({
      id: Math.random().toString(36).substring(2, 9),
      company: exp.company,
      jobTitle: exp.jobTitle,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.isCurrent,
      description: exp.description,
      responsibilities: exp.responsibilities,
      achievements: exp.achievements,
      technologies: exp.technologies
    });
    this.acceptedExperienceIds.update(set => new Set([...set, exp.id]));
    this.notify.success(`Role "${exp.jobTitle}" accepted.`);
  }

  acceptAllExperience(): void {
    const list = this.analysis()?.experience || [];
    list.forEach(e => {
      if (!this.acceptedExperienceIds().has(e.id)) {
        this.acceptExperience(e);
      }
    });
  }

  ignoreExperience(id: string): void {
    this.acceptedExperienceIds.update(set => new Set([...set, id]));
  }

  acceptProject(proj: ExtractedProjectItem): void {
    this.state.addProject({
      id: Math.random().toString(36).substring(2, 9),
      name: proj.name,
      description: proj.description,
      role: proj.role,
      technologies: proj.technologies,
      responsibilities: proj.responsibilities,
      achievements: proj.achievements,
      projectUrl: proj.projectUrl,
      githubUrl: proj.githubUrl,
      isFeatured: false
    });
    this.acceptedProjectIds.update(set => new Set([...set, proj.id]));
    this.notify.success(`Project "${proj.name}" accepted.`);
  }

  acceptAllProjects(): void {
    const list = this.analysis()?.projects || [];
    list.forEach(p => {
      if (!this.acceptedProjectIds().has(p.id)) {
        this.acceptProject(p);
      }
    });
  }

  ignoreProject(id: string): void {
    this.acceptedProjectIds.update(set => new Set([...set, id]));
  }

  acceptEducation(edu: ExtractedEducationItem): void {
    this.state.addEducation({
      id: Math.random().toString(36).substring(2, 9),
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      grade: edu.grade || '',
      activities: edu.activities || ''
    });
    this.acceptedEducationIds.update(set => new Set([...set, edu.id]));
    this.notify.success(`Education "${edu.degree}" accepted.`);
  }

  acceptAllEducation(): void {
    const list = this.analysis()?.education || [];
    list.forEach(ed => {
      if (!this.acceptedEducationIds().has(ed.id)) {
        this.acceptEducation(ed);
      }
    });
  }

  ignoreEducation(id: string): void {
    this.acceptedEducationIds.update(set => new Set([...set, id]));
  }

  acceptCertification(cert: ExtractedCertificationItem): void {
    this.state.addCertification({
      id: Math.random().toString(36).substring(2, 9),
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate || '',
      expiryDate: cert.expiryDate || '',
      credentialUrl: cert.credentialUrl || '',
      credentialId: cert.credentialId || ''
    });
    this.acceptedCertificationIds.update(set => new Set([...set, cert.id]));
    this.notify.success(`Certification "${cert.name}" accepted.`);
  }

  acceptAllCertifications(): void {
    const list = this.analysis()?.certifications || [];
    list.forEach(c => {
      if (!this.acceptedCertificationIds().has(c.id)) {
        this.acceptCertification(c);
      }
    });
  }

  ignoreCertification(id: string): void {
    this.acceptedCertificationIds.update(set => new Set([...set, id]));
  }

  acceptAll(): void {
    this.acceptProfile();
    this.acceptAllSkills();
    this.acceptAllExperience();
    this.acceptAllProjects();
    this.acceptAllEducation();
    this.acceptAllCertifications();

    const summaryContent = this.analysis()?.summary?.content?.value;
    if (summaryContent) {
      this.state.updatePortfolio(port => {
        port.summary.content = summaryContent;
        return port;
      });
    }

    this.notify.success('All AI suggestions successfully merged into your portfolio!');
    this.router.navigate(['/dashboard/editor/personal-info']);
  }
}
