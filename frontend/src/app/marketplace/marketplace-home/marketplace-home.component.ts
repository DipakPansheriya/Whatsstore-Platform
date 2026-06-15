import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MarketplaceService } from '../../shared/services/marketplace.service';
import { ToastService } from '../../shared/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-marketplace-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SkeletonComponent, DatePipe],
  template: `
    <!-- MAIN WRAPPER: Responsive + Dark Mode support -->
    <div class="transition-colors duration-300">
      <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans pb-16">
        
        <!-- TOP ANNOUNCEMENT BAR -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold py-2 overflow-hidden flex whitespace-nowrap">
          <div class="animate-marquee flex gap-12 px-4">
            <span>🔥 {{ totalStores }}+ Active Stores</span>
            <span>🎉 New Coupons Available</span>
            <span>🚀 Shop Directly via WhatsApp</span>
            <span>✨ Flash Sale on Electronics!</span>
            <span>🔥 {{ totalStores }}+ Active Stores</span>
            <span>🎉 New Coupons Available</span>
            <span>🚀 Shop Directly via WhatsApp</span>
          </div>
        </div>

        <!-- STICKY NAVBAR -->
        <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
          <div class="container mx-auto px-4 h-16 flex items-center justify-between">
            <a routerLink="/marketplace" class="text-2xl font-black tracking-tight flex items-center gap-2">
              <span class="text-3xl drop-shadow-sm">⚡</span> 
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">WhatsStore</span>
            </a>
            
            <div class="flex items-center gap-4">
              <a routerLink="/marketplace/wishlist" class="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                ❤️ <span class="hidden sm:inline ml-1">Wishlist</span>
                <span *ngIf="wishlistCount > 0" class="absolute top-0 right-0 sm:right-auto sm:left-6 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
                  {{ wishlistCount }}
                </span>
              </a>
              
              <a routerLink="/marketplace/cart" class="relative px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-all font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/50">
                🛒 <span class="hidden sm:inline">Cart</span>
                <span *ngIf="cartCount > 0" class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white shadow-sm" [class.animate-bounce]="isCartBouncing">
                  {{ cartCount }}
                </span>
              </a>
            </div>
          </div>
        </header>

        <!-- MAIN LAYOUT -->
        <div class="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 relative items-start">
          
          <!-- LEFT SIDEBAR -->
          <aside class="hidden lg:block w-64 shrink-0 sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
            <h3 class="text-lg font-extrabold mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Filter Products</h3>
            
            <div class="mb-6">
              <h4 class="font-bold mb-3 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Categories</h4>
              <ul class="space-y-2">
                <li><label class="flex items-center gap-2 cursor-pointer hover:text-emerald-500 transition-colors font-medium"><input type="radio" name="cat" [checked]="searchCategory === 'all'" (change)="searchCategory = 'all'; triggerSearch()" class="rounded text-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 border-gray-300 dark:border-gray-700"> All Categories</label></li>
                <li *ngFor="let cat of categories"><label class="flex items-center gap-2 cursor-pointer hover:text-emerald-500 transition-colors"><input type="radio" name="cat" [checked]="searchCategory === cat.name" (change)="searchCategory = cat.name; triggerSearch()" class="rounded text-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 border-gray-300 dark:border-gray-700"> {{cat.name}}</label></li>
              </ul>
            </div>

            <!-- Recently Visited Stores (Local Storage Feature) -->
            <div class="mb-6" *ngIf="recentStores.length > 0">
              <h4 class="font-bold mb-3 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Recent Stores</h4>
              <ul class="space-y-3">
                <li *ngFor="let store of recentStores" class="flex items-center gap-3 p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer hover:border-emerald-500 transition-colors" [routerLink]="['/store', store.websiteSlug]">
                  <img [src]="store.logoUrl || 'https://ui-avatars.com/api/?name=' + store.name + '&background=random'" (error)="onImageError($event, 'https://ui-avatars.com/api/?name=' + store.name + '&background=random')" class="w-8 h-8 rounded-full border border-gray-200">
                  <span class="text-xs font-bold truncate">{{store.name}}</span>
                </li>
              </ul>
            </div>
          </aside>

          <!-- RIGHT CONTENT -->
          <main class="flex-1 min-w-0">
            
            <!-- HERO SECTION -->
            <section class="h-auto lg:h-[450px] w-full rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 flex flex-col lg:flex-row overflow-hidden relative shadow-sm border border-emerald-100 dark:border-emerald-900/30 mb-12">
              <div class="w-full lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center relative z-10">
                 <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest rounded-full mb-6 w-max border border-emerald-200 dark:border-emerald-800/60">
                   🚀 The Future of Local Commerce
                 </div>
                 <h1 class="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-[1.1]">
                   Everything You Need From <br class="hidden lg:block">
                   <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 drop-shadow-sm">Local Stores</span>
                 </h1>
                 
                 <!-- Popular Searches (Mocked Public Data) -->
                 <div class="flex flex-wrap gap-2 mb-4">
                   <span class="text-xs font-bold text-gray-500 dark:text-gray-400">Popular:</span>
                   <button *ngFor="let term of popularSearches" (click)="searchQuery = term; triggerSearch()" class="text-[10px] px-2 py-0.5 bg-white dark:bg-gray-800 rounded shadow-sm hover:text-emerald-500 border border-gray-200 dark:border-gray-700">
                     {{ term }}
                   </button>
                 </div>

                 <div class="relative w-full max-w-xl group">
                   <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <span class="text-xl opacity-60 group-focus-within:text-emerald-500 group-focus-within:opacity-100 transition-colors">🔍</span>
                   </div>
                   <input 
                     type="text" 
                     class="w-full pl-12 pr-32 py-4 md:py-5 bg-white dark:bg-gray-900 border-2 border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl text-lg font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all dark:text-white" 
                     placeholder="Search products, stores..."
                     [(ngModel)]="searchQuery"
                     (keyup.enter)="triggerSearch()"
                   >
                   <button (click)="triggerSearch()" class="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                     Search
                   </button>
                 </div>
              </div>

              <!-- Hero Illustration -->
              <div class="hidden lg:flex w-2/5 relative items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-opacity-20">
                <div class="absolute inset-0 bg-gradient-to-l from-transparent to-teal-50 dark:to-gray-950"></div>
                <div class="relative w-full h-full flex items-center justify-center animate-float">
                  <div class="w-64 h-64 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 transform rotate-6 z-20">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300" class="w-full h-32 object-cover rounded-xl mb-4" alt="Product">
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div class="h-10 bg-emerald-500 rounded-lg w-full mt-6"></div>
                  </div>
                  <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                </div>
              </div>
            </section>

            <!-- SKELETON LOADER -->
            <div *ngIf="loading" class="space-y-12">
              <div class="flex gap-4 overflow-hidden"><div *ngFor="let i of [1,2,3,4,5,6]" class="w-24 h-32 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0"></div></div>
              <div class="grid grid-cols-2 lg:grid-cols-5 gap-6"><div *ngFor="let i of [1,2,3,4,5]" class="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div></div>
            </div>

            <!-- SEARCH RESULTS VIEW -->
            <ng-container *ngIf="isSearching && !loading">
              <div class="mb-8 flex justify-between items-center">
                <h2 class="text-2xl font-extrabold tracking-tight">Results for "{{searchQuery}}" <span class="text-gray-400 text-lg">({{totalSearchResults}})</span></h2>
                <button (click)="clearSearch()" class="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg hover:bg-red-100">✕ Clear Search</button>
              </div>

              <div *ngIf="searchResults.length === 0" class="py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                 <div class="text-6xl mb-4">🔍</div>
                 <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No items found</h3>
                 <p class="text-gray-500">Try checking your spelling or using more general terms.</p>
              </div>

              <!-- Reusing the 5-col grid template for search results -->
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                <ng-container *ngTemplateOutlet="productGrid; context: { products: searchResults }"></ng-container>
              </div>
            </ng-container>

            <!-- ONLY SHOW HOME SECTIONS IF NOT SEARCHING -->
            <ng-container *ngIf="!loading && !isSearching">
              
              <!-- CATEGORY SECTION -->
              <section class="mb-14" *ngIf="categories.length > 0">
                <h2 class="text-2xl font-extrabold tracking-tight mb-6">Explore Categories</h2>
                <div class="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory hide-scrollbar">
                  <div *ngFor="let cat of categories" (click)="searchCategory = cat.name; triggerSearch()" class="snap-start shrink-0 group cursor-pointer">
                    <div class="w-28 flex flex-col items-center gap-3">
                      <div class="w-24 h-24 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-emerald-500">
                        <img *ngIf="cat.iconUrl && cat.iconUrl.includes('http')" [src]="cat.iconUrl" (error)="onImageError($event, 'https://ui-avatars.com/api/?name=' + cat.name + '&background=random')" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        <span *ngIf="!cat.iconUrl?.includes('http')" class="text-4xl">{{ cat.iconUrl || '📦' }}</span>
                      </div>
                      <span class="font-bold text-sm text-center group-hover:text-emerald-500 transition-colors">{{ cat.name }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- HOT DEALS SECTION (API Banners) -->
              <section class="mb-14" *ngIf="banners.length > 0">
                <div class="w-full h-[200px] sm:h-[300px] rounded-3xl overflow-hidden relative group shadow-lg border border-gray-200 dark:border-gray-800">
                  <div class="absolute inset-0 flex transition-transform duration-700 ease-in-out" [style.transform]="'translateX(-' + currentDealIndex * 100 + '%)'">
                    
                    <div *ngFor="let deal of banners; let i = index" class="w-full h-full shrink-0 relative bg-gradient-to-r" [ngClass]="getBannerBg(i)">
                      <div class="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                      <div class="relative z-10 h-full flex items-center justify-between px-8 sm:px-16 text-white bg-black/30">
                        <div class="max-w-md">
                          <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/30">HOT DEAL</span>
                          <h2 class="text-3xl sm:text-5xl font-black mb-4 drop-shadow-md leading-tight">{{ deal.title }}</h2>
                          <a [routerLink]="deal.linkUrl" class="inline-block bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-full shadow-xl hover:-translate-y-1 transition-all">Shop Now</a>
                        </div>
                        <div class="hidden md:block w-1/3 h-full relative">
                           <img [src]="deal.imageUrl" class="absolute bottom-0 right-0 max-h-[120%] object-contain object-bottom drop-shadow-2xl scale-110 origin-bottom">
                        </div>
                      </div>
                    </div>

                  </div>
                  <!-- Navigation Dots -->
                  <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20" *ngIf="banners.length > 1">
                    <button *ngFor="let deal of banners; let i = index" (click)="currentDealIndex = i" 
                      class="w-3 h-3 rounded-full transition-all"
                      [class.bg-white]="currentDealIndex === i" [class.bg-white.opacity-50]="currentDealIndex !== i" [class.w-8]="currentDealIndex === i">
                    </button>
                  </div>
                </div>
              </section>

              <!-- RECENTLY VIEWED PRODUCTS (Local Storage Feature) -->
              <section class="mb-14" *ngIf="recentProducts.length > 0">
                <div class="flex items-end justify-between mb-6">
                  <div>
                    <h2 class="text-2xl font-extrabold tracking-tight mb-1">Jump Back In</h2>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Recently viewed products</p>
                  </div>
                </div>
                <div class="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                  <div *ngFor="let prod of recentProducts" class="snap-start shrink-0 w-[180px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-3 shadow-sm cursor-pointer hover:border-emerald-500 transition-colors" (click)="openQuickView(prod)">
                    <img [src]="prod.images?.[0] || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image'" (error)="onImageError($event, 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image')" class="w-full h-24 object-cover rounded-xl mb-2">
                    <h4 class="font-bold text-sm truncate mb-1">{{prod.title}}</h4>
                    <div class="font-black text-emerald-500">₹{{prod.price}}</div>
                  </div>
                </div>
              </section>

              <!-- FEATURED STORES (API Data) -->
              <section class="mb-14" *ngIf="featuredStores.length > 0">
                <div class="flex items-end justify-between mb-6">
                  <div>
                    <h2 class="text-2xl font-extrabold tracking-tight mb-1">Featured Stores</h2>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Top rated local merchants on WhatsStore</p>
                  </div>
                </div>

                <div class="flex gap-6 overflow-x-auto pb-6 snap-x hide-scrollbar">
                  <div *ngFor="let store of featuredStores" class="snap-start shrink-0 w-[280px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                    <!-- Share Store Button -->
                    <button class="absolute top-4 right-4 text-gray-400 hover:text-emerald-500" (click)="shareStore(store)">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    </button>
                    
                    <div class="flex items-center gap-4 mb-5">
                      <div class="relative">
                        <img [src]="store.logoUrl || 'https://ui-avatars.com/api/?name=' + store.name + '&background=random'" (error)="onImageError($event, 'https://ui-avatars.com/api/?name=' + store.name + '&background=random')" class="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800 shadow-md group-hover:border-emerald-500 transition-colors">
                        <!-- Store Open/Closed Badge -->
                        <span class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" title="Open Now"></span>
                      </div>
                      <div>
                        <h3 class="font-bold text-lg leading-tight group-hover:text-emerald-500 transition-colors truncate max-w-[150px]">{{store.name}}</h3>
                        <div class="flex items-center gap-1 text-xs font-semibold text-yellow-500 mt-1">
                          ⭐ {{store.stats?.rating | number:'1.1-1' || '4.5'}} 
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium mb-5 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div class="text-center">
                        <div class="text-gray-900 dark:text-white font-black text-sm">{{store.stats?.sold || 0}}</div>
                        <div>Sold</div>
                      </div>
                      <div class="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                      <div class="text-center">
                        <div class="text-gray-900 dark:text-white font-black text-sm">{{store.stats?.orders || 0}}</div>
                        <div>Orders</div>
                      </div>
                    </div>
                    <button [routerLink]="['/store', store.websiteSlug]" class="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 hover:text-white text-gray-900 dark:text-gray-100 font-bold rounded-xl transition-colors">
                      Visit Store
                    </button>
                  </div>
                </div>
              </section>

              <!-- TRENDING PRODUCTS -->
              <section class="mb-14" *ngIf="trendingProducts.length > 0">
                <div class="flex items-end justify-between mb-6">
                  <div>
                    <h2 class="text-2xl font-extrabold tracking-tight mb-1">Trending Products</h2>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Newest items across active merchants</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  <ng-container *ngTemplateOutlet="productGrid; context: { products: trendingProducts }"></ng-container>
                </div>
              </section>

              <!-- COUPON MARKETPLACE -->
              <section class="mb-14" *ngIf="globalCoupons.length > 0">
                <div class="flex items-end justify-between mb-6">
                  <h2 class="text-2xl font-extrabold tracking-tight">Hot Merchant Coupons</h2>
                </div>
                <div class="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                  <div *ngFor="let coupon of globalCoupons" class="snap-start shrink-0 w-[300px] h-[120px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500 transition-all group">
                    <div class="w-1/3 bg-emerald-500 text-white flex flex-col justify-center items-center border-r border-dashed border-white/50 relative">
                      <div class="absolute -top-3 -right-3 w-6 h-6 bg-gray-50 dark:bg-gray-950 rounded-full"></div>
                      <div class="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 dark:bg-gray-950 rounded-full"></div>
                      <span class="text-2xl font-black">{{ coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue }}</span>
                      <span class="text-xs font-bold uppercase tracking-widest opacity-90">OFF</span>
                    </div>
                    <div class="w-2/3 p-4 flex flex-col justify-center bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] bg-opacity-5">
                      <div class="flex items-center gap-2 mb-2">
                        <img [src]="coupon.business?.logoUrl || 'https://ui-avatars.com/api/?name=' + (coupon.business?.name || 'Store') + '&background=random'" (error)="onImageError($event, 'https://ui-avatars.com/api/?name=' + (coupon.business?.name || 'Store') + '&background=random')" class="w-6 h-6 rounded-full border border-gray-200">
                        <span class="text-xs font-bold text-gray-500 truncate">{{coupon.business?.name}}</span>
                      </div>
                      <div class="flex items-center justify-between relative">
                        <code class="font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 tracking-wider text-xs">
                          {{coupon.code}}
                        </code>
                        <!-- Copy Animation State -->
                        <button (click)="copyCoupon(coupon.code)" class="text-emerald-500 hover:text-emerald-600 transition-colors" title="Copy Code">
                          <span *ngIf="copiedCouponCode === coupon.code" class="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded absolute -top-8 right-0 animate-fade-in-up">Copied!</span>
                          <svg *ngIf="copiedCouponCode !== coupon.code" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          <svg *ngIf="copiedCouponCode === coupon.code" class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                      </div>
                      <div class="text-[10px] text-gray-400 mt-2" *ngIf="coupon.expiryDate">Valid till {{ coupon.expiryDate | date:'mediumDate' }}</div>
                      <div class="text-[10px] text-gray-400 mt-2" *ngIf="!coupon.expiryDate">No Expiry</div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- MARKETPLACE STATS (Real Calculation) -->
              <section class="mb-14 py-12 border-y border-gray-200 dark:border-gray-800 text-center">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <div class="text-4xl font-black text-emerald-500 mb-1">{{totalStores}}+</div>
                    <div class="text-sm font-bold text-gray-500 uppercase tracking-wider">Stores</div>
                  </div>
                  <div>
                    <div class="text-4xl font-black text-emerald-500 mb-1">{{totalProducts}}+</div>
                    <div class="text-sm font-bold text-gray-500 uppercase tracking-wider">Products</div>
                  </div>
                  <div>
                    <div class="text-4xl font-black text-emerald-500 mb-1">{{totalOrders}}+</div>
                    <div class="text-sm font-bold text-gray-500 uppercase tracking-wider">Orders</div>
                  </div>
                  <div>
                    <div class="text-4xl font-black text-emerald-500 mb-1">{{globalCoupons.length}}+</div>
                    <div class="text-sm font-bold text-gray-500 uppercase tracking-wider">Coupons</div>
                  </div>
                </div>
              </section>

            </ng-container>
          </main>
        </div>

      </div>
    </div>

    <!-- PRODUCT QUICK VIEW MODAL -->
    <div *ngIf="showQuickViewModal && selectedProduct" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" (click)="closeQuickView()"></div>
      <div class="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        <button (click)="closeQuickView()" class="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors">✕</button>
        
        <!-- Image Gallery -->
        <div class="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800 p-8 flex items-center justify-center relative">
          <img [src]="selectedProduct.images?.[0] || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image'" (error)="onImageError($event, 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image')" class="max-w-full max-h-full object-contain drop-shadow-xl" alt="Product">
          <span *ngIf="!selectedProduct.isAvailable || selectedProduct.stock === 0" class="absolute top-6 left-6 bg-red-500 text-white text-xs font-black uppercase px-3 py-1 rounded shadow-lg">OUT OF STOCK</span>
          <span *ngIf="selectedProduct.isAvailable && selectedProduct.stock > 0 && selectedProduct.stock <= 5" class="absolute top-6 left-6 bg-orange-500 text-white text-xs font-black uppercase px-3 py-1 rounded shadow-lg">Only {{selectedProduct.stock}} Left</span>
        </div>
        
        <!-- Product Info -->
        <div class="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto custom-scrollbar">
          <div class="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">{{selectedProduct.business?.name}}</div>
          <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{{selectedProduct.title}}</h2>
          <div class="text-3xl font-black text-gray-900 dark:text-white mb-6">₹{{selectedProduct.price}}</div>
          
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-8 leading-relaxed">{{selectedProduct.description || 'No description available for this product. Contact the merchant for more details.'}}</p>
          
          <div class="mt-auto space-y-4">
            <div class="flex gap-4">
              <button class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2" (click)="addToCart(selectedProduct)" [disabled]="!selectedProduct.isAvailable || selectedProduct.stock === 0" [class.opacity-50]="!selectedProduct.isAvailable || selectedProduct.stock === 0">
                🛒 {{ selectedProduct.stock > 0 ? 'Add To Cart' : 'Sold Out' }}
              </button>
              <button class="w-14 h-14 bg-gray-100 dark:bg-gray-800 hover:text-red-500 rounded-xl flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-700" (click)="toggleWishlist(selectedProduct)">
                <svg class="w-6 h-6" [ngClass]="{'text-red-500 fill-current animate-pulse': isInWishlist(selectedProduct._id)}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
            </div>
            <button class="w-full py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-emerald-500 font-bold rounded-xl transition-colors flex justify-center items-center gap-2" (click)="shareProduct(selectedProduct)">
               🔗 Share Product
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- REUSABLE PRODUCT GRID TEMPLATE -->
    <ng-template #productGrid let-products="products">
      <div *ngFor="let prod of products" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-2 group flex flex-col cursor-pointer" (click)="openQuickView(prod)">
        <div class="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
          <img [src]="prod.images?.[0] || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image'" (error)="onImageError($event, 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image')" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
          
          <div class="absolute top-3 left-3 flex flex-col gap-2">
            <span *ngIf="prod.coupons?.length > 0" class="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-sm">
              COUPON
            </span>
            <span *ngIf="!prod.isAvailable || prod.stock === 0" class="bg-gray-800 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-sm opacity-90">
              OUT OF STOCK
            </span>
            <span *ngIf="prod.isAvailable && prod.stock > 0 && prod.stock <= 5" class="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-sm">
              FEW LEFT
            </span>
          </div>
          
          <button class="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-md transition-colors border border-gray-100 dark:border-gray-700 z-10" (click)="$event.stopPropagation(); toggleWishlist(prod)">
            <svg class="w-4 h-4" [ngClass]="{'text-red-500 fill-current': isInWishlist(prod._id)}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </button>

          <div class="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <button class="w-full py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-lg rounded-xl text-sm font-bold text-gray-900 dark:text-white hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-colors">
              Quick View
            </button>
          </div>
        </div>

        <div class="p-4 flex flex-col flex-1">
          <div class="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1">{{prod.business?.name}}</div>
          <h3 class="font-bold text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2 group-hover:text-emerald-500 transition-colors">{{prod.title}}</h3>
          
          <div class="flex items-center gap-1 mt-auto pt-2 pb-3">
            <div class="flex text-yellow-400 text-[10px]">★★★★★</div>
            <span class="text-xs text-gray-400">({{prod.salesCount || 10}})</span>
          </div>

          <div class="flex items-end justify-between border-t border-gray-100 dark:border-gray-800 pt-3 mt-auto">
            <div>
              <div class="text-lg font-black text-gray-900 dark:text-white leading-none">₹{{prod.price}}</div>
            </div>
            <button class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-500 text-gray-600 dark:text-gray-300 hover:text-white flex items-center justify-center transition-colors shadow-sm" title="Add to Cart" (click)="$event.stopPropagation(); addToCart(prod)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </ng-template>

    <style>
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      
      @keyframes marquee {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-50%); } 
      }
      .animate-marquee {
        animation: marquee 25s linear infinite;
      }
      .animate-marquee:hover {
        animation-play-state: paused;
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
      .animate-fade-in { animation: fadeInUp 0.2s ease-out forwards; }
    </style>
  `,
  styles: []
})
export class MarketplaceHomeComponent implements OnInit, OnDestroy {
  // UI State
  searchQuery = '';
  searchCategory = 'all';
  isSearching = false;
  loading = true;
  wishlistCount = 0;
  cartCount = 0;
  isCartBouncing = false;

  // Data
  categories: any[] = [];
  banners: any[] = [];
  featuredStores: any[] = [];
  trendingProducts: any[] = [];
  globalCoupons: any[] = [];
  searchResults: any[] = [];
  totalSearchResults = 0;

  // Features State
  currentDealIndex = 0;
  dealInterval: any;
  copiedCouponCode: string | null = null;
  
  // Quick View
  showQuickViewModal = false;
  selectedProduct: any = null;

  // Local Storage Data
  recentProducts: any[] = [];
  recentStores: any[] = [];
  
  // Popular Searches mock
  popularSearches = ['Shoes', 'Watch', 'Headphones', 'Groceries', 'T-Shirt', 'Laptop'];

  // Stats
  totalStores = 0;
  totalProducts = 0;
  totalOrders = 0;

  constructor(
    private marketplaceService: MarketplaceService,
    private toastService: ToastService
  ) {
    this.loadRecentData();
  }

  ngOnInit() {
    this.fetchData();

    this.marketplaceService.cart$.subscribe(items => {
      const newCount = items.reduce((sum, item) => sum + item.quantity, 0);
      if (newCount > this.cartCount) {
        this.isCartBouncing = true;
        setTimeout(() => this.isCartBouncing = false, 300);
      }
      this.cartCount = newCount;
    });

    this.marketplaceService.wishlist$.subscribe(items => {
      this.wishlistCount = items.length;
    });
  }

  fetchData() {
    this.loading = true;
    this.marketplaceService.getHomeData().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.categories || [];
          this.banners = res.banners || [];
          this.featuredStores = res.featuredStores || [];
          this.trendingProducts = res.trendingProducts || [];
          this.globalCoupons = res.globalCoupons || [];
          
          // Calculate stats
          this.totalStores = this.featuredStores.length > 0 ? this.featuredStores.length * 10 : 50;
          this.totalOrders = this.featuredStores.reduce((acc, s) => acc + (s.stats?.orders || 0), 0);
          this.totalProducts = this.trendingProducts.length * 50; 
          
          this.startDealRotation();
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load marketplace data');
        this.loading = false;
      }
    });
  }

  triggerSearch() {
    if (!this.searchQuery && this.searchCategory === 'all') {
      this.clearSearch();
      return;
    }
    this.isSearching = true;
    this.loading = true;
    this.marketplaceService.search(this.searchQuery, this.searchCategory).subscribe({
      next: (res) => {
        if (res.success) {
          this.searchResults = res.products;
          this.totalSearchResults = res.total;
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Search failed');
        this.loading = false;
      }
    });
  }

  clearSearch() {
    this.isSearching = false;
    this.searchQuery = '';
    this.searchResults = [];
  }

  // UI Helpers
  getBannerBg(index: number) {
    const bgs = [
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-indigo-600',
      'from-orange-500 to-red-600'
    ];
    return bgs[index % bgs.length];
  }


  startDealRotation() {
    if (this.dealInterval) clearInterval(this.dealInterval);
    if (this.banners.length > 1) {
      this.dealInterval = setInterval(() => {
        this.currentDealIndex = (this.currentDealIndex + 1) % this.banners.length;
      }, 5000);
    }
  }

  // Cart & Wishlist Actions
  addToCart(prod: any) {
    if (!prod.isAvailable || prod.stock === 0) return;
    this.marketplaceService.addToCart(prod, 1);
    this.toastService.success('Added to cart');
  }

  toggleWishlist(prod: any) {
    if (this.marketplaceService.isInWishlist(prod._id)) {
      this.marketplaceService.removeFromWishlist(prod._id);
    } else {
      this.marketplaceService.addToWishlist(prod);
      this.toastService.success('Added to wishlist');
    }
  }

  isInWishlist(id: string) {
    return this.marketplaceService.isInWishlist(id);
  }

  copyCoupon(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCouponCode = code;
      setTimeout(() => this.copiedCouponCode = null, 2000);
    });
  }

  // Quick View
  openQuickView(prod: any) {
    this.selectedProduct = prod;
    this.showQuickViewModal = true;
    document.body.style.overflow = 'hidden';
    this.trackRecentProduct(prod);
    if (prod.business) {
      this.trackRecentStore(prod.business);
    }
  }

  closeQuickView() {
    this.showQuickViewModal = false;
    document.body.style.overflow = 'auto';
    setTimeout(() => this.selectedProduct = null, 300);
  }

  // Share Actions
  shareProduct(prod: any) {
    const url = window.location.origin + '/marketplace/product/' + prod._id;
    if (navigator.share) {
      navigator.share({ title: prod.title, url });
    } else {
      navigator.clipboard.writeText(url);
      this.toastService.success('Product link copied!');
    }
  }

  shareStore(store: any) {
    const url = window.location.origin + '/store/' + store.websiteSlug;
    if (navigator.share) {
      navigator.share({ title: store.name, url });
    } else {
      navigator.clipboard.writeText(url);
      this.toastService.success('Store link copied!');
    }
  }

  // Local Storage Tracking
  loadRecentData() {
    try {
      this.recentProducts = JSON.parse(localStorage.getItem('ws_recent_prods') || '[]');
      this.recentStores = JSON.parse(localStorage.getItem('ws_recent_stores') || '[]');
    } catch(e) {}
  }

  trackRecentProduct(prod: any) {
    let prods = this.recentProducts.filter(p => p._id !== prod._id);
    prods.unshift(prod);
    if (prods.length > 6) prods = prods.slice(0, 6);
    this.recentProducts = prods;
    localStorage.setItem('ws_recent_prods', JSON.stringify(prods));
  }

  trackRecentStore(store: any) {
    if (!store._id) return;
    let stores = this.recentStores.filter(s => s._id !== store._id);
    stores.unshift(store);
    if (stores.length > 5) stores = stores.slice(0, 5);
    this.recentStores = stores;
    localStorage.setItem('ws_recent_stores', JSON.stringify(stores));
  }

  onImageError(event: any, fallbackUrl: string) {
    const target = event.target || event.srcElement;
    if (!target || target.dataset.errorHandled) return;
    target.dataset.errorHandled = true;
    target.src = fallbackUrl;
  }

  ngOnDestroy() {
    if (this.dealInterval) clearInterval(this.dealInterval);
  }
}
