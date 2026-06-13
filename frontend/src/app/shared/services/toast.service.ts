import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string, duration: number = 4000) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message, title, duration };
    
    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, title?: string, duration?: number) {
    this.show('success', message, title, duration);
  }

  error(message: string, title?: string, duration?: number) {
    this.show('error', message, title, duration);
  }

  info(message: string, title?: string, duration?: number) {
    this.show('info', message, title, duration);
  }

  warning(message: string, title?: string, duration?: number) {
    this.show('warning', message, title, duration);
  }

  remove(id: string) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }

  clear() {
    this.toastsSubject.next([]);
  }
}
