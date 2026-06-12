import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ThemeStorage } from './theme.storage';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<'light' | 'dark' | 'system'>('dark');
  theme$ = this.themeSubject.asObservable();

  constructor(
    private themeStorage: ThemeStorage,
    private authService: AuthService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.themeSubject.value === 'system') {
          this.applyTheme('system');
        }
      });

      this.authService.currentUser$.subscribe(user => {
        if (user && user.theme) {
          this.setTheme(user.theme, false);
        }
      });
    }
  }

  get currentTheme(): 'light' | 'dark' | 'system' {
    return this.themeSubject.value;
  }

  initTheme(): void {
    const stored = this.themeStorage.getTheme();
    this.setTheme(stored, false);
  }

  setTheme(theme: 'light' | 'dark' | 'system', syncWithBackend = true): void {
    this.themeSubject.next(theme);
    this.themeStorage.setTheme(theme);
    this.applyTheme(theme);

    if (syncWithBackend && this.authService.isLoggedIn()) {
      this.syncTheme(theme);
    }
  }

  private applyTheme(theme: 'light' | 'dark' | 'system'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let activeTheme: 'light' | 'dark';
    if (theme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      activeTheme = theme;
    }

    const root = document.documentElement;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  private syncTheme(theme: 'light' | 'dark' | 'system'): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.http.put<any>(
      `${environment.apiUrl}/auth/theme`,
      { theme },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: (res) => {
        const user = this.authService.currentUser;
        if (user) {
          user.theme = theme;
          localStorage.setItem('sf_user', JSON.stringify(user));
        }
      },
      error: (err) => console.error('Failed to sync theme preference with backend', err)
    });
  }
}
