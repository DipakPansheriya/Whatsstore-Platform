import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private subscriptionSubject = new BehaviorSubject<any>(null);
  subscription$ = this.subscriptionSubject.asObservable();

  private statusSubject = new BehaviorSubject<string>('ACTIVE');
  status$ = this.statusSubject.asObservable();

  private pollIntervalId: any = null;

  constructor(private http: HttpClient, private router: Router) {
    // Check subscription status on every route change
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url || '';
        // Only run check if we are in the admin dashboard panel
        if (url.startsWith('/admin')) {
          this.checkSubscription();
        }
      });

    // Start 5-minute poll check if user is logged in
    this.startPolling();
  }

  /** Fetch latest subscription details from backend */
  checkSubscription(): void {
    const token = localStorage.getItem('sf_token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any>(`${environment.apiUrl}/subscriptions/me`, { headers }).subscribe({
      next: (res) => {
        if (res.success && res.subscription) {
          this.updateState(res.subscription);
        } else {
          this.updateState({ status: 'NONE' });
        }
      },
      error: () => {
        // If API fails with auth error, status might be none or block
        this.updateState({ status: 'NONE' });
      }
    });
  }

  /** Set manual status (used by error interceptor to update state instantly) */
  setExpired(): void {
    const sub = this.subscriptionSubject.value || {};
    this.updateState({ ...sub, status: 'EXPIRED' });
  }

  updateState(subscription: any): void {
    this.subscriptionSubject.next(subscription);
    this.statusSubject.next(subscription?.status || 'NONE');
  }

  get currentStatus(): string {
    return this.statusSubject.value;
  }

  get currentSubscription(): any {
    return this.subscriptionSubject.value;
  }

  startPolling(): void {
    this.stopPolling();
    this.checkSubscription(); // Run check immediately

    // Poll every 5 minutes (300,000 milliseconds)
    this.pollIntervalId = setInterval(() => {
      this.checkSubscription();
    }, 5 * 60 * 1000);
  }

  stopPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }
}
