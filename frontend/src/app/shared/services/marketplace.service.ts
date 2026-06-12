import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

export interface MarketplaceCartItem {
  product: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    category: string;
    business: {
      _id: string;
      name: string;
      logoUrl?: string;
      websiteSlug: string;
      whatsappNumber?: string;
    };
  };
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private cartKey = 'ws_marketplace_cart';
  private wishlistKey = 'ws_marketplace_wishlist';

  private cartSubject = new BehaviorSubject<MarketplaceCartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  private wishlistSubject = new BehaviorSubject<any[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(private api: ApiService, private http: HttpClient) {
    this.loadCart();
    this.loadWishlist();
  }

  // API wrappers
  getHomeData(): Observable<any> {
    return this.api.get<any>('marketplace/home');
  }

  search(q: string, category: string, page: number = 1, limit: number = 16): Observable<any> {
    return this.api.get<any>('marketplace/search', { q, category, page, limit });
  }

  getConfig(): Observable<any> {
    return this.api.get<any>('marketplace/config');
  }

  getSuperAdminAnalytics(): Observable<any> {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    return this.http.get<any>(`${environment.apiUrl}/marketplace/admin/analytics`, { headers });
  }

  updateConfig(config: any): Observable<any> {
    const headers = { Authorization: `Bearer ${localStorage.getItem('sf_token')}` };
    return this.http.put<any>(`${environment.apiUrl}/marketplace/admin/config`, config, { headers });
  }

  // Marketplace multi-store Shopping Cart Management
  private loadCart() {
    try {
      const stored = localStorage.getItem(this.cartKey);
      if (stored) {
        this.cartSubject.next(JSON.parse(stored));
      } else {
        this.cartSubject.next([]);
      }
    } catch (e) {
      this.cartSubject.next([]);
    }
  }

  private saveCart(items: MarketplaceCartItem[]) {
    localStorage.setItem(this.cartKey, JSON.stringify(items));
    this.cartSubject.next(items);
  }

  getCartItems(): MarketplaceCartItem[] {
    return this.cartSubject.getValue();
  }

  addToCart(product: any, quantity: number = 1) {
    const items = [...this.getCartItems()];
    const existingIndex = items.findIndex(item => item.product._id === product._id);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        product: {
          _id: product._id,
          title: product.title,
          price: product.price,
          images: product.images,
          category: product.category,
          business: product.business
        },
        quantity
      });
    }
    this.saveCart(items);
  }

  updateQuantity(productId: string, quantity: number) {
    let items = [...this.getCartItems()];
    const index = items.findIndex(item => item.product._id === productId);

    if (index > -1) {
      if (quantity <= 0) {
        items.splice(index, 1);
      } else {
        items[index].quantity = quantity;
      }
      this.saveCart(items);
    }
  }

  removeFromCart(productId: string) {
    const items = this.getCartItems().filter(item => item.product._id !== productId);
    this.saveCart(items);
  }

  clearCart() {
    this.saveCart([]);
  }

  // Marketplace Wishlist Management
  private loadWishlist() {
    try {
      const stored = localStorage.getItem(this.wishlistKey);
      if (stored) {
        this.wishlistSubject.next(JSON.parse(stored));
      } else {
        this.wishlistSubject.next([]);
      }
    } catch (e) {
      this.wishlistSubject.next([]);
    }
  }

  private saveWishlist(items: any[]) {
    localStorage.setItem(this.wishlistKey, JSON.stringify(items));
    this.wishlistSubject.next(items);
  }

  getWishlistItems(): any[] {
    return this.wishlistSubject.getValue();
  }

  addToWishlist(product: any) {
    const items = [...this.getWishlistItems()];
    if (!items.some(item => item._id === product._id)) {
      items.push({
        _id: product._id,
        title: product.title,
        price: product.price,
        images: product.images,
        category: product.category,
        business: product.business
      });
      this.saveWishlist(items);
    }
  }

  removeFromWishlist(productId: string) {
    const items = this.getWishlistItems().filter(item => item._id !== productId);
    this.saveWishlist(items);
  }

  isInWishlist(productId: string): boolean {
    return this.getWishlistItems().some(item => item._id === productId);
  }
}
