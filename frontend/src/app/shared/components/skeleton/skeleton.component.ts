import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="skeleton" 
      [style.width]="width" 
      [style.height]="height" 
      [style.border-radius]="borderRadius"
      [class]="className">
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() borderRadius: string = 'var(--radius-sm)';
  @Input() className: string = '';
}
