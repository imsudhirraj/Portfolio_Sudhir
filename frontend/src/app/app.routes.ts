import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing-page.component').then(m => m.LandingPageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'u/:slug',
    loadComponent: () => import('./public/public-portfolio.component').then(m => m.PublicPortfolioComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'editor',
        loadComponent: () => import('./features/portfolio/editor/portfolio-editor.component').then(m => m.PortfolioEditorComponent),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'personal-info'
          },
          {
            path: 'personal-info',
            loadComponent: () => import('./features/portfolio/personal-info/personal-info.component').then(m => m.PersonalInfoComponent)
          },
          {
            path: 'summary',
            loadComponent: () => import('./features/portfolio/summary/summary.component').then(m => m.SummaryComponent)
          },
          {
            path: 'experience',
            loadComponent: () => import('./features/portfolio/experience/experience.component').then(m => m.ExperienceComponent)
          },
          {
            path: 'projects',
            loadComponent: () => import('./features/portfolio/projects/projects.component').then(m => m.ProjectsComponent)
          },
          {
            path: 'skills',
            loadComponent: () => import('./features/portfolio/skills/skills.component').then(m => m.SkillsComponent)
          },
          {
            path: 'education',
            loadComponent: () => import('./features/portfolio/education/education.component').then(m => m.EducationComponent)
          },
          {
            path: 'certifications',
            loadComponent: () => import('./features/portfolio/certifications/certifications.component').then(m => m.CertificationsComponent)
          },
          {
            path: 'sections',
            loadComponent: () => import('./features/portfolio/sections/sections.component').then(m => m.SectionsComponent)
          }
        ]
      },
      {
        path: 'resume',
        loadComponent: () => import('./features/resume/resume-upload.component').then(m => m.ResumeUploadComponent)
      },
      {
        path: 'ai-review',
        loadComponent: () => import('./features/ai/ai-review.component').then(m => m.AiReviewComponent)
      },
      {
        path: 'ai-assistant',
        loadComponent: () => import('./features/ai/ai-assistant.component').then(m => m.AiAssistantComponent)
      },
      {
        path: 'themes',
        loadComponent: () => import('./features/themes/themes.component').then(m => m.ThemesComponent)
      },
      {
        path: 'preview',
        loadComponent: () => import('./features/preview/preview.component').then(m => m.LivePreviewComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
