import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="confirmRequest()" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 border border-white/20 animate-in zoom-in slide-in-from-bottom-10 duration-500 text-center">
        <!-- Icon -->
        <div class="w-20 h-20 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner animate-bounce">
          ⚠️
        </div>

        <h2 class="text-xl font-black text-gray-900 mb-3 tracking-tight">
          {{ lang.isRTL() ? 'تأكيد' : 'Confirmation' }}
        </h2>
        <p class="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
          {{ confirmRequest()?.message }}
        </p>
 
        <div class="flex flex-col gap-3">
          <button (click)="cancel()" 
            class="w-full bg-gray-50 hover:bg-gray-100 text-gray-400 font-black uppercase text-xs tracking-[0.2em] py-4 rounded-2xl transition-all border-none cursor-pointer">
            {{ lang.isRTL() ? 'إلغاء' : 'Annuler' }}
          </button>
          
          <button (click)="confirm()" 
            class="w-full bg-terracotta text-white font-black uppercase text-xs tracking-[0.2em] py-4 rounded-2xl shadow-xl hover:bg-terracotta-dark transition-all border-none cursor-pointer active:scale-95 shadow-terracotta/20">
            {{ lang.isRTL() ? 'تأكيد' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  notificationService = inject(NotificationService);
  lang = inject(LanguageService);
  confirmRequest = this.notificationService.confirmationRequest;

  confirm() {
    this.notificationService.resolveConfirmation(true);
  }

  cancel() {
    this.notificationService.resolveConfirmation(false);
  }
}
