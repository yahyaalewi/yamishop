import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../components/ui/button.component';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent],
  styles: [':host { display: block; }'],
  template: `
    <div class="h-full flex flex-col items-center justify-center px-4 py-12">
      <div class="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md p-8 relative z-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-extrabold text-gray-900">{{ lang.translate('auth.register_title') }}</h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ lang.translate('auth.have_account') }}
            <a routerLink="/login" class="text-primary font-semibold hover:underline no-underline">{{ lang.translate('nav.login') }}</a>
          </p>
        </div>

        <form (ngSubmit)="onSubmit()" #f="ngForm" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ lang.translate('checkout.name') }} *</label>
            <input type="text" name="name" [(ngModel)]="name" placeholder="Mohamed Ould..."
              class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              [class.border-red-400]="nameError()">
            <p *ngIf="nameError()" class="text-xs text-red-500 mt-1">{{ nameError() }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ lang.translate('checkout.phone') }} *</label>
            <input type="tel" name="phone" [(ngModel)]="phone" placeholder="+222 4X XX XX XX"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              [class.border-red-400]="phoneError()">
            <p *ngIf="phoneError()" class="text-xs text-red-500 mt-1">{{ phoneError() }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ lang.isRTL() ? 'كلمة المرور' : 'Mot de passe' }} *</label>
            <input type="password" name="password" [(ngModel)]="password" [placeholder]="lang.translate('auth.error_pwd_len')"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              [class.border-red-400]="passwordError()">
            <p *ngIf="passwordError()" class="text-xs text-red-500 mt-1">{{ passwordError() }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ lang.isRTL() ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe' }} *</label>
            <input type="password" name="confirmPassword" [(ngModel)]="confirmPassword" placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              [class.border-red-400]="confirmError()">
            <p *ngIf="confirmError()" class="text-xs text-red-500 mt-1">{{ confirmError() }}</p>
          </div>

          <!-- Submit -->
          <app-button type="submit" variant="primary" size="lg" [disabled]="loading()" [fullWidth]="true" class="mt-2">
            <svg *ngIf="loading()" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg *ngIf="!loading()" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {{ loading() ? lang.translate('common.loading') : lang.translate('auth.register_title') }}
          </app-button>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  phone = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  nameError = signal('');
  phoneError = signal('');
  passwordError = signal('');
  confirmError = signal('');

  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  lang = inject(LanguageService);
  router = inject(Router);

  constructor() {}

  onSubmit() {
    this.nameError.set('');
    this.phoneError.set('');
    this.passwordError.set('');
    this.confirmError.set('');

    const trimmedPhone = this.phone.trim();
    let valid = true;
    if (!this.name) { this.nameError.set(this.lang.translate('auth.error_required')); valid = false; }
    
    const phoneRegex = /^(?:\+222)?(2|3|4)\d{7}$/;
    if (!trimmedPhone) { 
      this.phoneError.set(this.lang.translate('auth.error_required')); 
      valid = false; 
    } else if (!phoneRegex.test(trimmedPhone)) {
      this.phoneError.set(this.lang.translate('auth.error_phone'));
      valid = false;
    }

    if (this.password.length < 6) { this.passwordError.set(this.lang.translate('auth.error_pwd_len')); valid = false; }
    if (this.password !== this.confirmPassword) { this.confirmError.set(this.lang.translate('auth.error_pwd_match')); valid = false; }
    if (!valid) return;

    this.loading.set(true);
    this.authService.register(this.name, trimmedPhone, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.show(this.lang.translate('msg.register_success'));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        let errorMsg = err.error?.message || this.lang.translate('msg.error_occurred');
        if (errorMsg === 'User with this phone number already exists') {
          errorMsg = this.lang.isRTL() 
            ? 'مستخدم بهذا رقم الهاتف موجود بالفعل' 
            : 'Un utilisateur avec ce numéro de téléphone existe déjà';
        }
        this.notificationService.show(errorMsg, 'error');
        this.phoneError.set(errorMsg);
      }
    });
  }
}
