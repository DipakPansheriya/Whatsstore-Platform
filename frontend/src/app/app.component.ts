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
  title = 'SiteFlow';
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
        url.startsWith('/dashboard') || 
        url.startsWith('/auth') || 
        url.startsWith('/builder') || 
        url.startsWith('/products') || 
        url.startsWith('/orders') || 
        url.startsWith('/settings') || 
        url.startsWith('/store');

      if (url.startsWith('/dashboard')) {
        this.titleService.setTitle('Merchant Dashboard - SiteFlow');
      } else if (url.startsWith('/settings')) {
        this.titleService.setTitle('Store Settings - SiteFlow');
      } else if (url.startsWith('/products')) {
        this.titleService.setTitle('Catalog Manager - SiteFlow');
      } else if (url.startsWith('/orders')) {
        this.titleService.setTitle('Orders Dashboard - SiteFlow');
      } else if (url.startsWith('/builder')) {
        this.titleService.setTitle('Website Builder - SiteFlow');
      } else if (url.startsWith('/auth')) {
        this.titleService.setTitle('Account Access - SiteFlow');
      } else if (url.startsWith('/features')) {
        this.titleService.setTitle('Features - SiteFlow');
        this.metaService.updateTag({ name: 'description', content: 'Discover the advanced features of SiteFlow, from the no-code builder to WhatsApp checkout.' });
      } else if (url.startsWith('/pricing')) {
        this.titleService.setTitle('Pricing Plans - SiteFlow');
        this.metaService.updateTag({ name: 'description', content: 'Unlock all features with our 10-day free trial of the Mandatory Upgrade Plan.' });
      } else if (url.startsWith('/how-it-works')) {
        this.titleService.setTitle('How It Works - SiteFlow');
        this.metaService.updateTag({ name: 'description', content: 'Create a live no-code website and start receiving WhatsApp orders in under 5 minutes.' });
      } else if (url.startsWith('/docs')) {
        this.titleService.setTitle('Documentation - SiteFlow');
        this.metaService.updateTag({ name: 'description', content: 'Browse user guides and settings references for the SiteFlow builder.' });
      } else if (url.startsWith('/privacy')) {
        this.titleService.setTitle('Privacy Policy - SiteFlow');
      } else if (url.startsWith('/terms')) {
        this.titleService.setTitle('Terms & Conditions - SiteFlow');
      } else if (!this.isDashboardOrAuthOrStore) {
        this.titleService.setTitle('SiteFlow - WhatsApp-First Website Builder');
        this.metaService.updateTag({
          name: 'description',
          content: 'Create stunning no-code storefront websites and collect customer orders directly via WhatsApp chats.'
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
