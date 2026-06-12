import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ThemeService } from '../services/theme.service';

export const themeGuard: CanActivateFn = () => {
  const themeService = inject(ThemeService);
  themeService.initTheme();
  return true;
};
