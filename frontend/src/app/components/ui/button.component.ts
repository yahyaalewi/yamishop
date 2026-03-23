import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (routerLink()) {
      <a [routerLink]="routerLink()" 
         [queryParams]="queryParams()"
         [class]="classes()" 
         [class.pointer-events-none]="disabled()"
         [class.opacity-50]="disabled()">
        <ng-content></ng-content>
      </a>
    } @else {
      <button [type]="type()" 
              [class]="classes()" 
              [disabled]="disabled()" 
              (click)="onClick.emit($event)">
        <ng-content></ng-content>
      </button>
    }
  `,
  styles: [`
    :host { display: inline-block; vertical-align: middle; }
  `]
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'outline' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit'>('button');
  routerLink = input<string | any[] | null | undefined>(null);
  queryParams = input<any>({});
  fullWidth = input<boolean>(false);
  
  onClick = output<MouseEvent>();

  classes = computed(() => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 no-underline cursor-pointer active:scale-95';
    
    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 hover:shadow-primary/30 focus:ring-primary',
      secondary: 'bg-beige text-primary hover:bg-beige-dark shadow-sm hover:shadow-md focus:ring-beige',
      outline: 'border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary',
      danger: 'bg-terracotta text-white hover:bg-terracotta-dark shadow-lg shadow-terracotta/20 hover:shadow-terracotta/30 focus:ring-terracotta'
    }[this.variant()];

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-7 py-3.5 text-base min-h-[52px]',
      lg: 'px-10 py-4.5 text-lg min-h-[60px]'
    }[this.size()];

    const widthClass = this.fullWidth() ? 'w-full' : '';
    const disabledClass = this.disabled() ? 'opacity-60 grayscale-[0.5] pointer-events-none' : '';

    return `${base} ${variantClasses} ${sizeClasses} ${widthClass} ${disabledClass}`;
  });
}
