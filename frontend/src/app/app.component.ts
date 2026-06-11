import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'WhatsStore';
  mobileMenuOpen = false;
  isDashboardOrAuthOrStore = false;

  constructor(
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url || '';
      this.isDashboardOrAuthOrStore = 
        url.startsWith('/admin') || 
        url.startsWith('/superadmin') ||
        url.startsWith('/auth') || 
        url.startsWith('/store');

      if (url.startsWith('/admin/dashboard')) {
        this.titleService.setTitle('Merchant Dashboard - WhatsStore');
      } else if (url.startsWith('/admin/settings')) {
        this.titleService.setTitle('Store Settings - WhatsStore');
      } else if (url.startsWith('/admin/products')) {
        this.titleService.setTitle('Catalog Manager - WhatsStore');
      } else if (url.startsWith('/admin/orders')) {
        this.titleService.setTitle('Orders Dashboard - WhatsStore');
      } else if (url.startsWith('/admin/builder')) {
        this.titleService.setTitle('Website Builder - WhatsStore');
      } else if (url.startsWith('/auth')) {
        this.titleService.setTitle('Account Access - WhatsStore');
      } else if (url.startsWith('/features')) {
        this.titleService.setTitle('Features - WhatsStore');
        this.metaService.updateTag({ name: 'description', content: 'Discover the advanced features of WhatsStore, from the no-code builder to WhatsApp checkout.' });
      } else if (url.startsWith('/pricing')) {
        this.titleService.setTitle('Pricing Plans - WhatsStore');
        this.metaService.updateTag({ name: 'description', content: 'Start free for 10 days. Upgrade anytime to unlock advanced WhatsStore features.' });
      } else if (url.startsWith('/how-it-works')) {
        this.titleService.setTitle('How It Works - WhatsStore');
        this.metaService.updateTag({ name: 'description', content: 'Create a live no-code website and start receiving WhatsApp orders in under 5 minutes.' });
      } else if (url.startsWith('/docs')) {
        this.titleService.setTitle('Documentation - WhatsStore');
        this.metaService.updateTag({ name: 'description', content: 'Browse user guides and settings references for the WhatsStore builder.' });
      } else if (url.startsWith('/privacy')) {
        this.titleService.setTitle('Privacy Policy - WhatsStore');
      } else if (url.startsWith('/terms')) {
        this.titleService.setTitle('Terms & Conditions - WhatsStore');
      } else if (!this.isDashboardOrAuthOrStore) {
        this.titleService.setTitle('WhatsStore - Build & Sell via WhatsApp');
        this.metaService.updateTag({
          name: 'description',
          content: 'WhatsStore helps small businesses create beautiful websites, showcase products, and receive customer orders directly on WhatsApp.'
        });
      }
    });
  }

  navLinks = [
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Docs', path: '/docs' },
  ];

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
