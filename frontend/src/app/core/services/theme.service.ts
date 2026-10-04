import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserSettings } from '../models/settings.model';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api/settings';
  private readonly storageKey = 'portfolio_ai_theme_mode';

  currentMode = signal<'dark' | 'light'>('dark');

  constructor() {
    const saved = this.getInitialMode();
    this.currentMode.set(saved);

    effect(() => {
      const mode = this.currentMode();
      this.applyTheme(mode);
    });
  }

  private getInitialMode(): 'dark' | 'light' {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  }

  toggleTheme(): void {
    const next = this.currentMode() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(mode: 'dark' | 'light'): void {
    this.currentMode.set(mode);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.storageKey, mode);
    }
  }

  private applyTheme(mode: 'dark' | 'light'): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('dark-theme', 'light-theme');
      document.body.classList.add(`${mode}-theme`);
    }
  }

  loadServerSettings() {
    return this.http.get<ApiResponse<UserSettings>>(this.apiUrl);
  }

  saveServerSettings(settings: UserSettings) {
    return this.http.put<ApiResponse<UserSettings>>(this.apiUrl, settings);
  }

  deleteAccount() {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/delete-account`);
  }
}
