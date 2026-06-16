import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TenantInfo {
  id: string;
  slug: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private _current = new BehaviorSubject<TenantInfo | null>(this.loadFromStorage());

  current$ = this._current.asObservable();

  get current(): TenantInfo | null {
    return this._current.value;
  }

  set(tenant: TenantInfo) {
    this._current.next(tenant);
    localStorage.setItem('current_tenant', JSON.stringify(tenant));
  }

  clear() {
    this._current.next(null);
    localStorage.removeItem('current_tenant');
  }

  private loadFromStorage(): TenantInfo | null {
    const raw = localStorage.getItem('current_tenant');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
}
