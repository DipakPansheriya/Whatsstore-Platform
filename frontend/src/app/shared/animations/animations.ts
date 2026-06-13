import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

export const Animations = {
  // Simple Fade In
  fadeIn: trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate('200ms ease-out', style({ opacity: 0 }))
    ])
  ]),

  // Slide Up (Modals, cards, details)
  slideUp: trigger('slideUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(30px)' }),
      animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),

  // Slide Right (Drawers, Toasts, Cart)
  slideRight: trigger('slideRight', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(100%)' }),
      animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
    ]),
    transition(':leave', [
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateX(100%)' }))
    ])
  ]),

  // Scale In (Modals, Tooltips)
  scaleIn: trigger('scaleIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.95)' }),
      animate('250ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'scale(1)' }))
    ]),
    transition(':leave', [
      animate('200ms ease-out', style({ opacity: 0, transform: 'scale(0.95)' }))
    ])
  ]),

  // Stagger List (Dashboards, Reviews, Grids)
  staggerList: trigger('staggerList', [
    transition('* => *', [
      query(':enter, .animate-item', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger('100ms', [
          animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ])
};
