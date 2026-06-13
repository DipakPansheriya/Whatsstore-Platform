import { Directive, ElementRef, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;
  private hasRevealed = false;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return; // Do nothing if reduced motion is requested
    }

    // Add initial hidden state class
    this.el.nativeElement.classList.add('reveal-initial');

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasRevealed) {
          this.hasRevealed = true;
          this.el.nativeElement.classList.add('reveal-visible');
          if (this.observer) {
            this.observer.unobserve(this.el.nativeElement);
            this.observer.disconnect();
          }
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
