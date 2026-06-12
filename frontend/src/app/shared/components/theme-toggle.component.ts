import { Component, Input } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  template: `
    <button
      (click)="toggleTheme()"
      (keydown.enter)="toggleTheme()"
      (keydown.space)="$event.preventDefault(); toggleTheme()"
      class="theme-toggle-btn"
      role="switch"
      [attr.aria-checked]="currentTheme === 'light'"
      [attr.aria-label]="'Switch to ' + (currentTheme === 'light' ? 'dark' : 'light') + ' mode'"
      [title]="'Current theme: ' + currentTheme + '. Click to switch.'">
      <span class="icon-wrap" aria-hidden="true">
        @if (currentTheme === 'light') {
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        } @else {
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        }
      </span>
      @if (showLabel) {
        <span class="theme-label">{{ currentTheme | titlecase }}</span>
      }
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      padding: 8px 12px;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all var(--transition-normal);
      outline: none;

      &:hover {
        background: var(--color-bg-card);
        border-color: var(--color-border-hover);
        color: var(--color-text-primary);
        transform: translateY(-1px);
      }
      &:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 3px;
        box-shadow: 0 0 0 4px var(--color-accent-glow);
      }
      &:active {
        transform: translateY(0);
      }
    }
    .icon-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      transition: transform var(--transition-normal);
    }
    .theme-toggle-btn:hover .icon-wrap {
      transform: rotate(15deg) scale(1.15);
    }
    .theme-label {
      font-size: 0.85rem;
    }
  `]
})
export class ThemeToggleComponent {
  @Input() showLabel = false;

  constructor(private themeService: ThemeService) {}

  get currentTheme() {
    return this.themeService.currentTheme;
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.themeService.setTheme(nextTheme);
  }
}
