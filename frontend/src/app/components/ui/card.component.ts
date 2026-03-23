import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ' + (hoverable() ? 'hover:shadow-md hover:-translate-y-1' : '')">
      <div *ngIf="header()" class="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">{{ header() }}</h3>
        <ng-content select="[card-action]"></ng-content>
      </div>
      <div class="p-6">
        <ng-content></ng-content>
      </div>
      <div *ngIf="footer()" class="px-6 py-4 bg-gray-50/50 border-t border-gray-50">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  header = input<string>('');
  footer = input<boolean>(false);
  hoverable = input<boolean>(false);
}
