import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.model';
import { Portfolio, Profile, Summary, ThemeConfig, SectionsConfig, PublicationConfig, PublicPortfolio } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api';

  getPortfolio(): Observable<ApiResponse<Portfolio>> {
    return this.http.get<ApiResponse<Portfolio>>(`${this.baseUrl}/portfolio`);
  }

  savePortfolio(portfolio: Portfolio): Observable<ApiResponse<Portfolio>> {
    return this.http.put<ApiResponse<Portfolio>>(`${this.baseUrl}/portfolio`, portfolio);
  }

  updateProfile(profile: Profile): Observable<ApiResponse<Profile>> {
    return this.http.put<ApiResponse<Profile>>(`${this.baseUrl}/portfolio/profile`, profile);
  }

  updateSummary(summary: Summary): Observable<ApiResponse<Summary>> {
    return this.http.put<ApiResponse<Summary>>(`${this.baseUrl}/portfolio/summary`, summary);
  }

  updateTheme(theme: ThemeConfig): Observable<ApiResponse<ThemeConfig>> {
    return this.http.put<ApiResponse<ThemeConfig>>(`${this.baseUrl}/portfolio/theme`, theme);
  }

  updateSections(sections: SectionsConfig): Observable<ApiResponse<SectionsConfig>> {
    return this.http.put<ApiResponse<SectionsConfig>>(`${this.baseUrl}/portfolio/sections`, sections);
  }

  publish(slug: string): Observable<ApiResponse<PublicationConfig>> {
    return this.http.post<ApiResponse<PublicationConfig>>(`${this.baseUrl}/portfolio/publish`, { slug });
  }

  unpublish(): Observable<ApiResponse<PublicationConfig>> {
    return this.http.post<ApiResponse<PublicationConfig>>(`${this.baseUrl}/portfolio/unpublish`, {});
  }

  getPublicPortfolio(slug: string): Observable<ApiResponse<PublicPortfolio>> {
    return this.http.get<ApiResponse<PublicPortfolio>>(`${this.baseUrl}/public/${slug}`);
  }

  checkSlugAvailability(slug: string, currentUserId?: string): Observable<ApiResponse<{ slug: string; available: boolean }>> {
    const params = currentUserId ? `?currentUserId=${encodeURIComponent(currentUserId)}` : '';
    return this.http.get<ApiResponse<{ slug: string; available: boolean }>>(`${this.baseUrl}/public/check-slug/${slug}${params}`);
  }
}
