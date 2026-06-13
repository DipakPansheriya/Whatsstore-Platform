import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ProductItem {
  _id?: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isAvailable: boolean;
  featured: boolean;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="products-scaffold animate-fade-in-up">
      <!-- Header -->
      <header class="page-header">
        <div>
          <span class="badge">Products Catalog</span>
          <h1>Store Products</h1>
          <p>Add, edit, or delete items in your catalog. They will sync instantly to your storefront.</p>
        </div>
        
        <div class="header-actions">
          <div class="view-toggle" *ngIf="!showForm">
            <button (click)="viewMode = 'grid'" [class.active]="viewMode === 'grid'" class="toggle-btn" title="Grid View">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button (click)="viewMode = 'list'" [class.active]="viewMode === 'list'" class="toggle-btn" title="List View">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
          </div>
          <button *ngIf="!showForm" (click)="openAddForm()" class="btn btn-primary" id="add-product-btn">
            ✨ Add Product
          </button>
          <button *ngIf="showForm" (click)="closeForm()" class="btn btn-ghost" id="back-list-btn">
            ⬅ Back to Catalog
          </button>
        </div>
      </header>

      <!-- Message notifications -->
      <div *ngIf="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
      <div *ngIf="errorMsg" class="alert alert-danger">❌ {{ errorMsg }}</div>

      <!-- Main Layout -->
      <div class="content-wrapper">
        
        <!-- Loading State -->
        <div *ngIf="loading && !showForm" class="loading-state">
          <span class="spinner">⏳</span> Fetching product catalog...
        </div>

        <!-- Catalog List View -->
        <div *ngIf="!loading && !showForm" class="catalog-view">
          
          <!-- Empty State -->
          <div *ngIf="products.length === 0" class="empty-state glass-card">
            <div class="empty-icon">📦</div>
            <h3>No products found</h3>
            <p>You haven't listed any items yet. Add your first product to go live!</p>
            <button (click)="openAddForm()" class="btn btn-primary" id="add-first-product-btn">Add First Product</button>
          </div>

          <!-- Product Grid -->
          <div *ngIf="products.length > 0" [class]="viewMode === 'grid' ? 'product-grid' : 'product-list-view'">
            @for (product of products; track product._id) {
              <div class="product-card glass-card" [class.dimmed]="!product.isAvailable">
                <div class="image-wrapper">
                  <img [src]="product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'" 
                       [alt]="product.title" loading="lazy">
                  <div class="badge-container">
                    <span class="card-badge category-badge">{{ product.category }}</span>
                    <span *ngIf="product.featured" class="card-badge featured-badge">⭐ Featured</span>
                  </div>
                </div>
                
                <div class="card-details">
                  <h3 class="card-title" [title]="product.title">{{ product.title }}</h3>
                  <p class="card-desc">{{ product.description || 'No description provided.' }}</p>
                  
                  <div class="card-meta">
                    <span class="price">₹{{ product.price }}</span>
                    <span class="stock" [class.low]="product.stock <= 3">
                      Stock: {{ product.stock > 0 ? product.stock : 'Out of Stock' }}
                    </span>
                  </div>
                  
                  <div class="card-status">
                    <span class="status-dot" [class.active]="product.isAvailable"></span>
                    <span class="status-text">{{ product.isAvailable ? 'Visible' : 'Hidden' }}</span>
                  </div>
                </div>

                <div class="card-actions">
                  <button (click)="openEditForm(product)" class="btn-action btn-edit" title="Edit">✏️ Edit</button>
                  <button (click)="onDelete(product._id)" class="btn-action btn-delete" title="Delete">🗑️ Delete</button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Add/Edit Form Panel -->
        <div *ngIf="showForm" class="form-container glass-card">
          <h2 class="form-title">{{ editingProduct ? 'Edit Product Details' : 'Create New Product' }}</h2>
          
          <form (ngSubmit)="onSubmit()" #productForm="ngForm" class="product-form">
            <div class="form-row">
              <div class="form-group">
                <label for="p-title">Product Title *</label>
                <input id="p-title" type="text" name="title" [(ngModel)]="formProduct.title" placeholder="e.g. Delicious Chocolate Donut" required>
              </div>

              <div class="form-group">
                <label for="p-cat">Category</label>
                <select id="p-cat" name="category" [(ngModel)]="formProduct.category">
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Home & Decor">Home & Decor</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Groceries & Essentials">Groceries & Essentials</option>
                  <option value="General Retail">General Retail</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="p-price">Price (INR) *</label>
                <input id="p-price" type="number" name="price" [(ngModel)]="formProduct.price" placeholder="e.g. 299" min="0" required>
              </div>

              <div class="form-group">
                <label for="p-stock">Stock Quantity *</label>
                <input id="p-stock" type="number" name="stock" [(ngModel)]="formProduct.stock" placeholder="e.g. 15" min="0" required>
              </div>
            </div>

            <div class="form-group">
              <label for="p-desc">Description</label>
              <textarea id="p-desc" name="description" [(ngModel)]="formProduct.description" rows="3" placeholder="Tell customers about features, sizing, dietary specifications, etc."></textarea>
            </div>

            <!-- Product Image Section -->
            <div class="form-group">
              <label>Product Image URLs</label>
              <div class="url-adder">
                <input type="url" name="newImageUrl" [(ngModel)]="newImageUrl" placeholder="https://example.com/item.png">
                <button type="button" (click)="addImageUrl()" class="btn btn-ghost">Add Image</button>
              </div>
              
              <!-- Previews Grid -->
              <div class="images-preview-grid" *ngIf="formProduct.images.length > 0">
                @for (img of formProduct.images; track $index) {
                  <div class="preview-item">
                    <img [src]="img" alt="Product preview" loading="lazy">
                    <button type="button" (click)="removeImageUrl($index)" class="btn-remove-img" title="Remove image">×</button>
                  </div>
                }
              </div>
            </div>

            <!-- Settings Toggles -->
            <div class="toggles-row">
              <div class="toggle-control">
                <label class="switch">
                  <input type="checkbox" name="isAvailable" [(ngModel)]="formProduct.isAvailable">
                  <span class="slider round"></span>
                </label>
                <div class="toggle-labels">
                  <span class="lbl-main">Make Available</span>
                  <span class="lbl-sub">Let customers buy this instantly.</span>
                </div>
              </div>

              <div class="toggle-control">
                <label class="switch">
                  <input type="checkbox" name="featured" [(ngModel)]="formProduct.featured">
                  <span class="slider round"></span>
                </label>
                <div class="toggle-labels">
                  <span class="lbl-main">Featured Product</span>
                  <span class="lbl-sub">Highlight this at the top of your shop.</span>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" (click)="closeForm()" class="btn btn-ghost">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Saving Item...' : 'Save Product' }}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .products-scaffold {
      max-width: 1100px;
      margin: 0 auto;
      padding: var(--space-md) 0;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
      flex-wrap: wrap;
    }
    .page-header h1 {
      margin: var(--space-xs) 0;
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--color-text-primary);
    }
    .page-header p {
      color: var(--color-text-secondary);
    }
    .alert {
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-md);
      font-size: 0.875rem;
    }
    .alert-success {
      background: rgba(37, 211, 102, 0.1);
      color: var(--color-accent);
      border: 1px solid rgba(37, 211, 102, 0.2);
    }
    .alert-danger {
      background: rgba(255, 77, 109, 0.1);
      color: var(--color-danger);
      border: 1px solid rgba(255, 77, 109, 0.2);
    }
    .loading-state {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--color-text-secondary);
    }
    .empty-state {
      text-align: center;
      padding: var(--space-3xl);
    }
    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: var(--space-md);
    }
    .empty-state h3 {
      margin-bottom: var(--space-sm);
      font-weight: 800;
      color: var(--color-text-primary);
    }
    .empty-state p {
      color: var(--color-text-secondary);
      margin-bottom: var(--space-lg);
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-lg);
    }
    .product-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
      border: 1px solid var(--color-border);
      background: var(--color-bg-card-glass);
      &:hover {
        border-color: rgba(37, 211, 102, 0.35);
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(0,0,0,0.45);
        .image-wrapper img {
          transform: scale(1.05);
        }
      }
      &.dimmed {
        opacity: 0.5;
      }
    }
    .image-wrapper {
      height: 200px;
      position: relative;
      overflow: hidden;
      background: var(--color-bg-surface);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-normal);
      }
    }
    .badge-container {
      position: absolute;
      top: var(--space-sm);
      left: var(--space-sm);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .card-badge {
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .category-badge {
      background: var(--color-bg-card-glass);
      color: var(--color-text-primary);
      backdrop-filter: blur(4px);
      border: 1px solid var(--color-border);
    }
    .featured-badge {
      background: linear-gradient(135deg, #ffc857, #ff9f1c);
      color: #000;
      box-shadow: 0 2px 10px rgba(255, 200, 87, 0.3);
    }
    .card-details {
      padding: var(--space-lg);
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .card-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-desc {
      color: var(--color-text-secondary);
      font-size: 0.85rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: 3em;
    }
    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: var(--space-xs);
    }
    .price {
      color: var(--color-accent);
      font-size: 1.3rem;
      font-weight: 800;
      font-family: var(--font-heading);
    }
    .stock {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      font-weight: 600;
      &.low {
        color: var(--color-warning);
      }
    }
    .card-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-text-muted);
      &.active {
        background: var(--color-accent);
        box-shadow: 0 0 8px var(--color-accent);
      }
    }
    .card-actions {
      display: flex;
      border-top: 1px solid var(--color-border);
      background: rgba(255, 255, 255, 0.01);
    }
    .btn-action {
      flex: 1;
      padding: 13px;
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-fast);
      outline: none;
      &:hover {
        background: var(--color-bg-surface);
        color: var(--color-text-primary);
      }
      &.btn-delete {
        color: var(--color-danger);
        border-left: 1px solid var(--color-border);
        &:hover {
          background: rgba(239, 68, 68, 0.08);
          color: var(--color-danger);
        }
      }
    }
    .form-container {
      padding: var(--space-2xl);
      background: var(--color-bg-card-glass);
      border-color: var(--color-border);
    }
    .form-title {
      font-size: 1.4rem;
      font-weight: 800;
      margin-bottom: var(--space-xl);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--space-sm);
      color: var(--color-accent);
    }
    .product-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }
    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .form-group input,
    .form-group textarea,
    .form-group select {
      padding: 12px 14px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-family: var(--font-base);
      font-size: 0.9375rem;
      outline: none;
      transition: all var(--transition-fast);
      &:focus {
        border-color: var(--color-accent);
        box-shadow: 0 0 12px rgba(37, 211, 102, 0.2);
        background: var(--color-bg-card);
      }
    }
    .url-adder {
      display: flex;
      gap: var(--space-sm);
      input {
        flex: 1;
      }
    }
    .images-preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: var(--space-sm);
      margin-top: var(--space-sm);
    }
    .preview-item {
      height: 80px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--color-border);
      position: relative;
      background: var(--color-bg-surface);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .btn-remove-img {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.85);
      border: none;
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition-fast);
      &:hover {
        background: var(--color-danger);
      }
    }
    .toggles-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-lg);
      margin: var(--space-md) 0;
    }
    @media (max-width: 600px) {
      .toggles-row {
        grid-template-columns: 1fr;
      }
    }
    .toggle-control {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    .toggle-labels {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .lbl-main {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--color-text-primary);
    }
    .lbl-sub {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
   
    .header-actions {
      display: flex;
      gap: var(--space-md);
      align-items: center;
    }
    .view-toggle {
      display: flex;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 4px;
    }
    .toggle-btn {
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover { color: var(--color-text-primary); }
      &.active {
        background: var(--color-bg-card);
        color: var(--color-accent);
      }
    }

    /* List View Specific Styles */
    .product-list-view {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .product-list-view .product-card {
      flex-direction: row;
      height: 120px;
      align-items: stretch;
    }
    .product-list-view .image-wrapper {
      width: 120px;
      height: 100%;
      flex-shrink: 0;
    }
    .product-list-view .card-details {
      flex-direction: row;
      align-items: center;
      padding: var(--space-md) var(--space-lg);
      gap: var(--space-lg);
    }
    .product-list-view .card-title {
      width: 250px;
      margin-bottom: 0;
    }
    .product-list-view .card-desc {
      display: none;
    }
    .product-list-view .card-meta {
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      padding-top: 0;
      gap: 4px;
      flex: 1;
    }
    .product-list-view .card-status {
      width: 100px;
    }
    .product-list-view .card-actions {
      border-top: none;
      border-left: 1px solid var(--color-border);
      flex-direction: column;
      width: 120px;
    }
    .product-list-view .btn-action.btn-delete {
      border-left: none;
      border-top: 1px solid var(--color-border);
    }

    @media (max-width: 768px) {
      .product-list-view .product-card {
        height: auto;
        flex-direction: column;
      }
      .product-list-view .image-wrapper {
        width: 100%;
        height: 200px;
      }
      .product-list-view .card-details {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-sm);
      }
      .product-list-view .card-title {
        width: 100%;
      }
      .product-list-view .card-meta {
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
      }
      .product-list-view .card-actions {
        width: 100%;
        flex-direction: row;
        border-left: none;
        border-top: 1px solid var(--color-border);
      }
      .product-list-view .btn-action.btn-delete {
        border-top: none;
        border-left: 1px solid var(--color-border);
      }
    }

    /* Toggle switch CSS */
    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: var(--color-border);
      transition: .4s;
      border-radius: 34px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: var(--color-accent);
      box-shadow: 0 0 10px rgba(37, 211, 102, 0.4);
    }
    input:checked + .slider:before {
      transform: translateX(20px);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-md);
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-lg);
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: ProductItem[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  loading = true;
  saving = false;
  showForm = false;
  editingProduct: ProductItem | null = null;
  
  successMsg = '';
  errorMsg = '';
  newImageUrl = '';

  formProduct: ProductItem = {
    title: '',
    description: '',
    price: 0,
    images: [],
    category: 'Food & Beverage',
    stock: 10,
    isAvailable: true,
    featured: false
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.api.get<{ success: boolean; products: ProductItem[] }>('products').subscribe({
      next: (res) => {
        if (res.success) {
          this.products = res.products;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }

  openAddForm() {
    this.showForm = true;
    this.editingProduct = null;
    this.formProduct = {
      title: '',
      description: '',
      price: 0,
      images: [],
      category: 'Food & Beverage',
      stock: 10,
      isAvailable: true,
      featured: false
    };
    this.newImageUrl = '';
  }

  openEditForm(product: ProductItem) {
    this.showForm = true;
    this.editingProduct = product;
    // Clone properties
    this.formProduct = JSON.parse(JSON.stringify(product));
    this.newImageUrl = '';
  }

  closeForm() {
    this.showForm = false;
    this.editingProduct = null;
    this.errorMsg = '';
    this.successMsg = '';
  }

  addImageUrl() {
    if (this.newImageUrl.trim()) {
      this.formProduct.images.push(this.newImageUrl.trim());
      this.newImageUrl = '';
    }
  }

  removeImageUrl(index: number) {
    this.formProduct.images.splice(index, 1);
  }

  onSubmit() {
    if (!this.formProduct.title || this.formProduct.price === null || this.formProduct.price === undefined) {
      this.errorMsg = 'Title and price are required';
      return;
    }

    this.errorMsg = '';
    this.successMsg = '';
    this.saving = true;

    if (this.editingProduct && this.editingProduct._id) {
      // Edit mode
      this.api.patch<{ success: boolean; product: ProductItem }>(`products/${this.editingProduct._id}`, this.formProduct).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMsg = 'Product updated successfully!';
            this.fetchProducts();
            setTimeout(() => this.closeForm(), 1500);
          }
          this.saving = false;
        },
        error: (err) => {
          this.errorMsg = err.message || 'Failed to update product.';
          this.saving = false;
        }
      });
    } else {
      // Add mode
      this.api.post<{ success: boolean; product: ProductItem }>('products', this.formProduct).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMsg = 'Product added successfully!';
            this.fetchProducts();
            setTimeout(() => this.closeForm(), 1500);
          }
          this.saving = false;
        },
        error: (err) => {
          this.errorMsg = err.message || 'Failed to create product.';
          this.saving = false;
        }
      });
    }
  }

  onDelete(id?: string) {
    if (!id || !confirm('Are you sure you want to delete this product? This action is permanent.')) return;

    this.errorMsg = '';
    this.successMsg = '';

    this.api.delete<{ success: boolean }>(`products/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = 'Product deleted successfully.';
          this.fetchProducts();
          setTimeout(() => this.successMsg = '', 3000);
        }
      },
      error: () => {
        this.errorMsg = 'Failed to delete product.';
      }
    });
  }
}
