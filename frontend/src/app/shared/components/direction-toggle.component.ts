import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-direction-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggleDirection()"
      class="theme-toggle-btn dir-toggle"
      [attr.aria-label]="'Switch to ' + (currentDir === 'ltr' ? 'Right-To-Left' : 'Left-To-Right') + ' mode'"
      [title]="'Current direction: ' + currentDir.toUpperCase() + '. Click to switch.'">
      <span class="icon-wrap">
        @if (currentDir === 'ltr') {
          <!-- RTL Icon (like a text direction arrow) -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12H3m0 0l6-6m-6 6l6 6"/>
          </svg>
        } @else {
          <!-- LTR Icon -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18m0 0l-6-6m6 6l-6 6"/>
          </svg>
        }
      </span>
      @if (showLabel) {
        <span class="theme-label">{{ currentDir === 'ltr' ? 'RTL' : 'LTR' }}</span>
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
    }
    .dir-toggle {
      padding: 8px 10px;
    }
    .icon-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform var(--transition-normal);
    }
    .theme-label {
      font-size: 0.85rem;
      font-weight: 700;
    }
  `]
})
export class DirectionToggleComponent {
  @Input() showLabel = false;

  constructor(private themeService: ThemeService) {}

  get currentDir() {
    return this.themeService.currentDirection;
  }

  toggleDirection() {
    this.themeService.toggleDirection();
  }
}
