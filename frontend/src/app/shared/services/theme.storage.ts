import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeStorage {
  private readonly THEME_KEY = 'ws_theme';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getTheme(): 'light' | 'dark' | 'system' {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem(this.THEME_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          return stored;
        }
      } catch (e) {
        console.error('Error reading theme from localStorage', e);
      }
    }
    return 'dark';
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.THEME_KEY, theme);
      } catch (e) {
        console.error('Error writing theme to localStorage', e);
      }
    }
  }

  clearTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(this.THEME_KEY);
      } catch (e) {
        console.error('Error clearing theme from localStorage', e);
      }
    }
  }
}
