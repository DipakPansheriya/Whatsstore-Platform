import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartSubject = new BehaviorSubject<any>({ items: [], totalAmount: 0 });
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Retrieve or create a persistent anonymous session ID for guest checkouts */
  getSessionId(): string {
    let id = localStorage.getItem('ws_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('ws_session_id', id);
    }
    return id;
  }

  /** Retrieve the cart items from database */
  loadCart(slug: string): void {
    const sess = this.getSessionId();
    this.http.get<any>(`${environment.apiUrl}/cart/${slug}/${sess}`).subscribe({
      next: (res) => {
        if (res.success && res.cart) {
          this.cartSubject.next(res.cart);
        }
      },
      error: (err) => console.error('Failed to load cart', err)
    });
  }

  /** Add item to database cart and update client-side state */
  addToCart(slug: string, productId: string, quantity: number): Observable<any> {
    const sess = this.getSessionId();
    return this.http.post<any>(`${environment.apiUrl}/cart/${slug}/${sess}/items`, { productId, quantity }).pipe(
      tap((res) => {
        if (res.success && res.cart) {
          this.cartSubject.next(res.cart);
        }
      })
    );
  }

  /** Update quantity of an item in database cart and update client-side state */
  updateQuantity(slug: string, productId: string, quantity: number): Observable<any> {
    const sess = this.getSessionId();
    return this.http.put<any>(`${environment.apiUrl}/cart/${slug}/${sess}/items/${productId}`, { quantity }).pipe(
      tap((res) => {
        if (res.success && res.cart) {
          this.cartSubject.next(res.cart);
        }
      })
    );
  }

  /** Delete item from database cart and update client-side state */
  removeFromCart(slug: string, productId: string): Observable<any> {
    const sess = this.getSessionId();
    return this.http.delete<any>(`${environment.apiUrl}/cart/${slug}/${sess}/items/${productId}`).pipe(
      tap((res) => {
        if (res.success && res.cart) {
          this.cartSubject.next(res.cart);
        }
      })
    );
  }

  /** Clear the database cart and client state */
  clearCart(slug: string): Observable<any> {
    const sess = this.getSessionId();
    return this.http.delete<any>(`${environment.apiUrl}/cart/${slug}/${sess}`).pipe(
      tap((res) => {
        if (res.success) {
          this.cartSubject.next({ items: [], totalAmount: 0 });
        }
      })
    );
  }

  get currentCart(): any {
    return this.cartSubject.value;
  }
}
