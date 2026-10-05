import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.model';
import { AiAnalysisResult } from '../models/ai.model';
import { environment } from '../../../environments/environment';

export interface StoredResumeInfo {
  exists: boolean;
  fileName?: string;
  fileSizeBytes?: number;
  uploadedAtUtc?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResumeApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/resume`;

  upload(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/upload`, formData);
  }

  analyze(autoBuild: boolean = false): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/analyze?autoBuild=${autoBuild}`, {});
  }

  analyzeAndBuild(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/analyze-and-build`, {});
  }

  analyzeText(text: string, autoBuild: boolean = false): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/analyze-text`, { text, autoBuild });
  }

  getInfo(): Observable<ApiResponse<StoredResumeInfo>> {
    return this.http.get<ApiResponse<StoredResumeInfo>>(`${this.baseUrl}/info`);
  }

  downloadUrl(): string {
    return `${this.baseUrl}/download`;
  }

  downloadBlob(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download`, { responseType: 'blob' });
  }

  delete(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(this.baseUrl);
  }
}
