import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from '../services/toast.service';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div class="toast glass-card" [ngClass]="toast.type" [@toastAnimation]>
          <div class="toast-icon">
            <span *ngIf="toast.type === 'success'">✅</span>
            <span *ngIf="toast.type === 'error'">❌</span>
            <span *ngIf="toast.type === 'info'">ℹ️</span>
            <span *ngIf="toast.type === 'warning'">⚠️</span>
          </div>
          <div class="toast-content">
            <h5 *ngIf="toast.title">{{ toast.title }}</h5>
            <p>{{ toast.message }}</p>
          </div>
          <button class="toast-close" (click)="remove(toast.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      width: 320px;
      border-radius: var(--radius-lg);
      background: var(--color-bg-card-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--color-border);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border-left: 4px solid transparent;
      
      &.success { border-left-color: var(--color-accent); }
      &.error { border-left-color: #ef4444; }
      &.info { border-left-color: #3b82f6; }
      &.warning { border-left-color: #f59e0b; }
    }
    .toast-icon { font-size: 1.2rem; margin-top: 2px; }
    .toast-content { flex: 1; }
    .toast-content h5 { margin: 0 0 4px; font-size: 0.95rem; font-weight: 800; color: var(--color-text-primary); }
    .toast-content p { margin: 0; font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.4; }
    .toast-close {
      background: transparent; border: none; color: var(--color-text-muted); cursor: pointer;
      font-size: 1rem; padding: 0; &:hover { color: var(--color-text-primary); }
    }
  `],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class ToastsComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  remove(id: string) {
    this.toastService.remove(id);
  }
}
