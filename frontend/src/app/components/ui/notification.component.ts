import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-24 right-4 z-[9999] flex flex-col gap-3 min-w-[300px] max-w-md pointer-events-none">
      <div *ngFor="let n of service.notifications()" 
           [class]="getClasses(n.type)"
           class="p-4 rounded-2xl shadow-xl flex items-center justify-between pointer-events-auto animate-in slide-in-from-right duration-300">
        <div class="flex items-center gap-3">
          <span [class]="getIconClasses(n.type)">
            <svg *ngIf="n.type === 'success'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <svg *ngIf="n.type === 'error'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            <svg *ngIf="n.type === 'info'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </span>
          <p class="text-sm font-semibold">{{ n.message }}</p>
        </div>
        <button (click)="service.remove(n.id)" class="text-current opacity-50 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer p-1">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-in {
      animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  `]
})
export class NotificationComponent {
  service = inject(NotificationService);

  getClasses(type: string) {
    const base = 'border border-opacity-10 ';
    switch(type) {
      case 'success': return base + 'bg-green-50 text-green-800 border-green-200';
      case 'error': return base + 'bg-red-50 text-red-800 border-red-200';
      default: return base + 'bg-blue-50 text-blue-800 border-blue-200';
    }
  }

  getIconClasses(type: string) {
    switch(type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  }
}
