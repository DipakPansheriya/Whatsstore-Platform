import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<string[]>([]);
  wishlist$ = this.wishlistSubject.asObservable();

  constructor() {}

  private getStorageKey(slug: string): string {
    return `ws_wishlist_${slug}`;
  }

  loadWishlist(slug: string): void {
    try {
      const raw = localStorage.getItem(this.getStorageKey(slug));
      const items = raw ? JSON.parse(raw) : [];
      this.wishlistSubject.next(items);
    } catch {
      this.wishlistSubject.next([]);
    }
  }

  addToWishlist(slug: string, productId: string): void {
    const items = this.wishlistSubject.value;
    if (!items.includes(productId)) {
      const updated = [...items, productId];
      localStorage.setItem(this.getStorageKey(slug), JSON.stringify(updated));
      this.wishlistSubject.next(updated);
    }
  }

  removeFromWishlist(slug: string, productId: string): void {
    const items = this.wishlistSubject.value;
    const updated = items.filter(id => id !== productId);
    localStorage.setItem(this.getStorageKey(slug), JSON.stringify(updated));
    this.wishlistSubject.next(updated);
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistSubject.value.includes(productId);
  }

  get currentWishlist(): string[] {
    return this.wishlistSubject.value;
  }
}
