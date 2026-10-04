import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PortfolioApiService } from '../core/services/portfolio-api.service';
import { PublicPortfolio } from '../core/models/portfolio.model';
import { PortfolioRendererComponent } from '../shared/components/portfolio-renderer.component';
import { IconComponent } from '../shared/components/icon.component';

@Component({
  selector: 'app-public-portfolio',
  standalone: true,
  imports: [RouterLink, PortfolioRendererComponent, IconComponent],
  template: `
    @if (isLoading()) {
      <div class="public-loading">
        <app-icon name="sparkles" [size]="36" customClass="spinning" />
        <p>Loading portfolio...</p>
      </div>
    } @else if (error()) {
      <div class="public-error-card">
        <app-icon name="shield" [size]="48" />
        <h2>Portfolio Not Found</h2>
        <p>{{ error() }}</p>
        <a routerLink="/" class="btn btn-primary btn-sm">
          <span>Go to PortfolioAI Home</span>
        </a>
      </div>
    } @else if (portfolio()) {
      <div class="public-page-wrapper">
        <app-portfolio-renderer [data]="portfolio()" />
      </div>
    }
  `,
  styles: [`
    .public-page-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .public-loading, .public-error-card {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 1.25rem;
      padding: 2rem;
      color: var(--text-muted);

      h2 {
        font-size: 1.75rem;
        color: var(--text-primary);
      }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class PublicPortfolioComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  api = inject(PortfolioApiService);

  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  portfolio = signal<PublicPortfolio | null>(null);

  private originalTitle = '';

  ngOnInit(): void {
    this.originalTitle = document.title;
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.isLoading.set(false);
      this.error.set('No portfolio slug provided.');
      return;
    }

    this.api.getPublicPortfolio(slug).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.portfolio.set(res.data);
          this.applySeo(res.data);
        } else {
          this.error.set(res.message || 'Portfolio not found.');
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Portfolio is private or does not exist.');
      }
    });
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.title = this.originalTitle;
      const script = document.getElementById('json-ld-schema');
      if (script) script.remove();
    }
  }

  private applySeo(p: PublicPortfolio): void {
    if (typeof document === 'undefined') return;

    const fullName = p.profile?.fullName || 'Portfolio';
    const title = p.profile?.professionalTitle || 'Software Engineer';
    document.title = `${fullName} | ${title}`;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', p.summary?.content || `${fullName}'s professional engineering portfolio.`);

    // JSON-LD Person Schema
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': fullName,
      'jobTitle': title,
      'email': p.profile?.email,
      'telephone': p.profile?.phone,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': p.profile?.location
      },
      'url': window.location.href,
      'sameAs': [p.profile?.linkedin, p.profile?.github, p.profile?.website].filter(Boolean)
    };

    let scriptTag = document.getElementById('json-ld-schema') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schema);
  }
}
