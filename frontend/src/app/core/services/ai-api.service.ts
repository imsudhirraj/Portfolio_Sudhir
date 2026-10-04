import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.model';
import { AiAnalysisResult, ApplySuggestionsRequest } from '../models/ai.model';
import { Portfolio } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class AiApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api/ai';

  getLatestAnalysis(): Observable<ApiResponse<AiAnalysisResult>> {
    return this.http.get<ApiResponse<AiAnalysisResult>>(`${this.baseUrl}/latest-analysis`);
  }

  applySuggestions(request: ApplySuggestionsRequest): Observable<ApiResponse<Portfolio>> {
    return this.http.post<ApiResponse<Portfolio>>(`${this.baseUrl}/apply-suggestions`, request);
  }

  improveSummary(currentSummary: string, tone = 'professional'): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/improve-summary`, { currentSummary, tone });
  }

  improveProject(description: string, role: string, technologies: string[]): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/improve-project`, { description, role, technologies });
  }

  generateHeadline(fullName: string, role: string, topSkills: string[]): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/generate-headline`, { fullName, role, topSkills });
  }

  deleteAnalysis(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/analysis`);
  }
}
