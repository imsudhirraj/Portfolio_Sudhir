import { Injectable, signal, computed, inject } from '@angular/core';
import { Portfolio, Profile, Summary, ThemeConfig, SectionsConfig, SkillItem, ExperienceItem, ProjectItem, EducationItem, CertificationItem } from '../models/portfolio.model';
import { PortfolioApiService } from './portfolio-api.service';
import { NotificationService } from './notification.service';
import { Subject, debounceTime, switchMap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioStateService {
  private api = inject(PortfolioApiService);
  private notify = inject(NotificationService);

  portfolio = signal<Portfolio | null>(null);
  savingStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  lastSavedAt = signal<Date | null>(null);
  isLoading = signal<boolean>(false);
  previewDevice = signal<'desktop' | 'tablet' | 'mobile'>('desktop');

  private saveSubject = new Subject<Portfolio>();

  completionPercentage = computed(() => {
    const p = this.portfolio();
    if (!p) return 0;

    let score = 0;
    const weights = {
      profile: 20,
      summary: 15,
      skills: 15,
      experience: 20,
      projects: 15,
      education: 10,
      theme: 5
    };

    if (p.profile.fullName && p.profile.professionalTitle && p.profile.email) score += weights.profile;
    if (p.summary.content && p.summary.content.length > 30) score += weights.summary;
    if (p.skills.length >= 3) score += weights.skills;
    if (p.experience.length >= 1) score += weights.experience;
    if (p.projects.length >= 1) score += weights.projects;
    if (p.education.length >= 1) score += weights.education;
    if (p.theme.name) score += weights.theme;

    return Math.min(score, 100);
  });

  constructor() {
    this.setupAutosavePipeline();
  }

  private setupAutosavePipeline(): void {
    this.saveSubject.pipe(
      debounceTime(800),
      switchMap(data => {
        this.savingStatus.set('saving');
        return this.api.savePortfolio(data).pipe(
          catchError(err => {
            this.savingStatus.set('error');
            this.notify.error('Autosave failed. Check connection.');
            return of(null);
          })
        );
      })
    ).subscribe(res => {
      if (res && res.success && res.data) {
        this.savingStatus.set('saved');
        this.lastSavedAt.set(new Date());
        setTimeout(() => {
          if (this.savingStatus() === 'saved') {
            this.savingStatus.set('idle');
          }
        }, 3000);
      }
    });
  }

  loadPortfolio(): void {
    this.isLoading.set(true);
    this.api.getPortfolio().subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.portfolio.set(res.data);
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.notify.error('Failed to load portfolio.');
      }
    });
  }

  updatePortfolio(mutator: (current: Portfolio) => Portfolio, autoSave = true): void {
    const current = this.portfolio();
    if (!current) return;

    // Deep clone to ensure reactivity
    const updated = mutator(JSON.parse(JSON.stringify(current)));
    this.portfolio.set(updated);

    if (autoSave) {
      this.savingStatus.set('saving');
      this.saveSubject.next(updated);
    }
  }

  manualSave(): void {
    const current = this.portfolio();
    if (!current) return;

    this.savingStatus.set('saving');
    this.api.savePortfolio(current).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.portfolio.set(res.data);
          this.savingStatus.set('saved');
          this.lastSavedAt.set(new Date());
          this.notify.success('Portfolio changes saved.');
        }
      },
      error: () => {
        this.savingStatus.set('error');
        this.notify.error('Unable to save changes. Click Retry to attempt again.');
      }
    });
  }

  retrySave(): void {
    this.manualSave();
  }

  updateProfile(profile: Profile): void {
    this.updatePortfolio(p => {
      p.profile = profile;
      return p;
    });
  }

  updateSummary(summary: Summary): void {
    this.updatePortfolio(p => {
      p.summary = summary;
      return p;
    });
  }

  updateTheme(theme: ThemeConfig): void {
    this.updatePortfolio(p => {
      p.theme = theme;
      return p;
    });
  }

  updateSections(sections: SectionsConfig): void {
    this.updatePortfolio(p => {
      p.sections = sections;
      return p;
    });
  }

  addSkill(skill: SkillItem): void {
    this.updatePortfolio(p => {
      p.skills.push(skill);
      return p;
    });
  }

  removeSkill(id: string): void {
    this.updatePortfolio(p => {
      p.skills = p.skills.filter(s => s.id !== id);
      return p;
    });
  }

  addExperience(item: ExperienceItem): void {
    this.updatePortfolio(p => {
      p.experience.unshift(item);
      return p;
    });
  }

  updateExperience(item: ExperienceItem): void {
    this.updatePortfolio(p => {
      const idx = p.experience.findIndex(e => e.id === item.id);
      if (idx >= 0) p.experience[idx] = item;
      return p;
    });
  }

  removeExperience(id: string): void {
    this.updatePortfolio(p => {
      p.experience = p.experience.filter(e => e.id !== id);
      return p;
    });
  }

  addProject(item: ProjectItem): void {
    this.updatePortfolio(p => {
      p.projects.unshift(item);
      return p;
    });
  }

  updateProject(item: ProjectItem): void {
    this.updatePortfolio(p => {
      const idx = p.projects.findIndex(pr => pr.id === item.id);
      if (idx >= 0) p.projects[idx] = item;
      return p;
    });
  }

  removeProject(id: string): void {
    this.updatePortfolio(p => {
      p.projects = p.projects.filter(pr => pr.id !== id);
      return p;
    });
  }

  addEducation(item: EducationItem): void {
    this.updatePortfolio(p => {
      p.education.unshift(item);
      return p;
    });
  }

  updateEducation(item: EducationItem): void {
    this.updatePortfolio(p => {
      const idx = p.education.findIndex(e => e.id === item.id);
      if (idx >= 0) p.education[idx] = item;
      return p;
    });
  }

  removeEducation(id: string): void {
    this.updatePortfolio(p => {
      p.education = p.education.filter(e => e.id !== id);
      return p;
    });
  }

  addCertification(item: CertificationItem): void {
    this.updatePortfolio(p => {
      p.certifications.unshift(item);
      return p;
    });
  }

  updateCertification(item: CertificationItem): void {
    this.updatePortfolio(p => {
      const idx = p.certifications.findIndex(c => c.id === item.id);
      if (idx >= 0) p.certifications[idx] = item;
      return p;
    });
  }

  removeCertification(id: string): void {
    this.updatePortfolio(p => {
      p.certifications = p.certifications.filter(c => c.id !== id);
      return p;
    });
  }

  setPreviewDevice(device: 'desktop' | 'tablet' | 'mobile'): void {
    this.previewDevice.set(device);
  }
}
