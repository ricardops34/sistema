import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authenticated = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private router: Router) {}

  private hasToken(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true' || localStorage.getItem('isLoggedIn') === 'true';
  }

  get isAuthenticated() {
    return this.authenticated.asObservable();
  }

  get isLoggedIn(): boolean {
    return this.authenticated.value;
  }

  login(user: string, pass: string): boolean {
    if (user === 'admin' && pass === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userPermissions', JSON.stringify(['all']));
      this.authenticated.next(true);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userPermissions');
    this.authenticated.next(false);
    this.router.navigate(['/login']);
  }
}
