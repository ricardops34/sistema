import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/v1/auth';
  private authenticated = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private router: Router, private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  get isAuthenticated() {
    return this.authenticated.asObservable();
  }

  get isLoggedIn(): boolean {
    return this.authenticated.value;
  }

  login(login: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { login, password }).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('userProfile', res.user.profile);
        localStorage.setItem('userName', res.user.name);
        this.authenticated.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userName');
    this.authenticated.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
