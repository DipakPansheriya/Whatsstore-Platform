import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BlogPost {
  id: number;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  imageUrl: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="blog-page animate-fade-in-up">
      <div class="container">
        
        <!-- Header -->
        <header class="blog-header text-center">
          <span class="badge">SaaS & Growth Tips</span>
          <h1>SiteFlow Insights</h1>
          <p class="subtitle">Actionable advice on e-commerce design, catalog management, and WhatsApp conversions.</p>
        </header>

        <!-- Grid of articles -->
        <div class="blog-grid">
          @for (post of posts; track post.id) {
            <article class="glass-card blog-card">
              <div class="card-img-wrapper">
                <img [src]="post.imageUrl" [alt]="post.title">
                <span class="category-pill">{{ post.category }}</span>
              </div>
              
              <div class="card-content">
                <div class="meta-row">
                  <span class="date">{{ post.date }}</span>
                  <span class="separator">•</span>
                  <span class="read-time">{{ post.readTime }}</span>
                </div>
                <h3>{{ post.title }}</h3>
                <p>{{ post.summary }}</p>
                
                <a href="#" class="read-more-btn">
                  Read Article <span>➡️</span>
                </a>
              </div>
            </article>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .blog-page {
      padding: var(--space-3xl) 0;
    }
    .blog-header {
      max-width: 700px;
      margin: 0 auto var(--space-2xl);
      h1 {
        margin: var(--space-sm) 0 var(--space-xs);
        font-size: 3rem;
        font-weight: 800;
        color: #fff;
        line-height: 1.15;
      }
      .subtitle {
        font-size: 1.15rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
      }
    }
    .text-center {
      text-align: center;
    }

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-xl);
      @media (max-width: 960px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .blog-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: all var(--transition-normal);
      
      &:hover {
        border-color: var(--color-accent);
        box-shadow: 0 0 25px var(--color-accent-glow);
        transform: translateY(-4px);
        
        .card-img-wrapper img {
          transform: scale(1.05);
        }
      }
    }

    .card-img-wrapper {
      height: 200px;
      position: relative;
      overflow: hidden;
      background: #111;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-slow);
      }
      
      .category-pill {
        position: absolute;
        bottom: var(--space-md);
        left: var(--space-md);
        background: var(--color-bg);
        color: var(--color-accent);
        border: 1px solid var(--color-accent-glow);
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
    }

    .card-content {
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      flex: 1;
      
      .meta-row {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        font-size: 0.8rem;
        color: var(--color-text-muted);
        font-weight: 600;
      }
      
      h3 {
        font-size: 1.25rem;
        color: #fff;
        line-height: 1.35;
        font-weight: 700;
      }
      
      p {
        font-size: 0.9rem;
        line-height: 1.6;
        color: var(--color-text-secondary);
      }
    }

    .read-more-btn {
      margin-top: auto;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--color-accent);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all var(--transition-fast);
      span {
        transition: transform var(--transition-fast);
      }
      &:hover {
        opacity: 0.9;
        span {
          transform: translateX(4px);
        }
      }
    }
  `]
})
export class BlogComponent {
  posts: BlogPost[] = [
    {
      id: 1,
      title: 'How to 10x Your Shop Sales with WhatsApp Checkout',
      category: 'E-commerce',
      date: 'June 8, 2026',
      readTime: '5 min read',
      summary: 'Discover why routing orders into WhatsApp creates conversational trust, removes purchase friction, and leads to massive upsells and customizations.',
      imageUrl: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'Design Patterns to Maximize Storefront Conversions',
      category: 'UI/UX Design',
      date: 'June 3, 2026',
      readTime: '4 min read',
      summary: 'Learn how to configure layout colors, Category Filter Chips, and ratingscore distribution blocks that visually motivate users to buy immediately.',
      imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'Mobile Optimization: Creating Fast Catalog Workspaces',
      category: 'Performance',
      date: 'May 28, 2026',
      readTime: '6 min read',
      summary: 'An depth review of image lazy-loading, caching store metadata, and designing sticky checkout buttons that load instantly on low-bandwidth networks.',
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=400&auto=format&fit=crop'
    }
  ];
}
