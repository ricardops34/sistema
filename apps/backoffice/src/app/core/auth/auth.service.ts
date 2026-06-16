import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api';
  private _loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  loggedIn$ = this._loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(login: string, password: string) {
    return this.http.post<AuthTokens>(`${this.API}/auth/login`, { login, password }).pipe(
      tap((tokens) => {
        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);
        this._loggedIn.next(true);
      }),
    );
  }

  logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this._loggedIn.next(false);
    if (refreshToken) {
      this.http.post(`${this.API}/auth/logout`, { refreshToken }).subscribe();
    }
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
