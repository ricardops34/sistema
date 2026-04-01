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
    const users: any = {
      admin: { pass: 'admin', profile: 'admin', permissions: ['all'] },
      consultor: { pass: 'consultor', profile: 'user', permissions: ['read:all'] },
      gestor: { pass: 'gestor', profile: 'admin', permissions: ['read:all', 'write:all'] }
    };

    if (users[user] && users[user].pass === pass) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userProfile', users[user].profile);
      localStorage.setItem('userPermissions', JSON.stringify(users[user].permissions));
      this.authenticated.next(true);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userPermissions');
    this.authenticated.next(false);
    this.router.navigate(['/login']);
  }
}
