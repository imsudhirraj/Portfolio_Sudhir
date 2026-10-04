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

  analyze(): Observable<ApiResponse<AiAnalysisResult>> {
    return this.http.post<ApiResponse<AiAnalysisResult>>(`${this.baseUrl}/analyze`, {});
  }

  getInfo(): Observable<ApiResponse<StoredResumeInfo>> {
    return this.http.get<ApiResponse<StoredResumeInfo>>(`${this.baseUrl}/info`);
  }

  downloadUrl(): string {
    return `${this.baseUrl}/download`;
  }

  delete(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(this.baseUrl);
  }
}
