import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiResponse, AuthResponse, UserInfo } from '../models/api.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly tokenKey = 'portfolio_ai_token';
  private readonly userKey = 'portfolio_ai_user';
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  token = signal<string | null>(this.getStoredToken());
  currentUser = signal<UserInfo | null>(this.getStoredUser());
  isAuthenticated = computed(() => !!this.token());

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private getStoredUser(): UserInfo | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(this.userKey);
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  loginWithGoogle(idToken: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/google`, { idToken }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  loginWithDevAccount(userId?: string, email?: string, name?: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/dev-login`, { userId, email, name }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  private setSession(authData: AuthResponse): void {
    const user: UserInfo = {
      userId: authData.userId,
      email: authData.email,
      name: authData.name,
      picture: authData.picture
    };

    localStorage.setItem(this.tokenKey, authData.token);
    localStorage.setItem(this.userKey, JSON.stringify(user));

    this.token.set(authData.token);
    this.currentUser.set(user);
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }
}
