import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../components/ui/button.component';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent],
  styles: [':host { display: block; }'],
  template: `
    <div class="h-full flex flex-col items-center justify-center px-4 py-12">
      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md p-8 relative z-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-extrabold text-gray-900">{{ lang.translate('nav.login') }}</h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ lang.translate('auth.no_account') }}
            <a routerLink="/register" class="text-primary font-semibold hover:underline no-underline">{{ lang.translate('auth.register_title') }}</a>
          </p>
        </div>

        <form (ngSubmit)="onSubmit()" #f="ngForm" class="space-y-5">
          <!-- Phone (Hidden if OTP required) -->
          <div *ngIf="!requiresOtp()">
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ lang.translate('checkout.phone') }}</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input type="tel" name="phone" [(ngModel)]="phone" placeholder="+222 4X XX XX XX"
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                [class.border-red-400]="phoneError()">
            </div>
            <p *ngIf="phoneError()" class="text-xs text-red-500 mt-1">{{ phoneError() }}</p>
          </div>

          <!-- Password -->
          <div *ngIf="!requiresOtp()">
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ lang.isRTL() ? 'كلمة المرور' : 'Mot de passe' }}</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input [type]="showPwd ? 'text' : 'password'" name="password" [(ngModel)]="password" placeholder="••••••••"
                class="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                [class.border-red-400]="passwordError()">
              <button type="button" (click)="showPwd = !showPwd" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary bg-transparent border-none cursor-pointer">
                <svg *ngIf="!showPwd" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg *ngIf="showPwd" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
              </button>
            </div>
            <p *ngIf="passwordError()" class="text-xs text-red-500 mt-1">{{ passwordError() }}</p>
          </div>

          <!-- OTP Input -->
          <div *ngIf="requiresOtp()">
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ lang.translate('auth.otp_verify') }}</label>
            <p class="text-xs text-gray-500 mb-2">{{ lang.translate('auth.otp_msg') }}</p>
            
            <div class="relative mb-4">
              <input type="text" name="otpCode" [(ngModel)]="otpCode" placeholder="••••••" maxlength="6"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-center tracking-[0.5em] font-black text-lg"
                [class.border-red-400]="otpError()">
            </div>
            
            <div class="flex items-center justify-between text-xs mb-4">
              <span class="text-gray-400" *ngIf="countdown() > 0">
                {{ lang.translate('auth.otp_expire') }} : <span class="text-primary font-bold">{{ countdown() }}s</span>
              </span>
              <button type="button" *ngIf="countdown() === 0" (click)="resendOtp()" 
                class="text-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">
                {{ lang.translate('auth.resend_otp') }}
              </button>
            </div>
            
            <p *ngIf="otpError()" class="text-xs text-red-500 mt-1 text-center">{{ otpError() }}</p>
          </div>

          <!-- Forgot + Remember -->
          <div *ngIf="!requiresOtp()" class="flex justify-between items-center text-sm">
            <label class="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" class="rounded border-gray-300 text-primary">
              {{ lang.translate('auth.remember_me') }}
            </label>
            <a href="#" class="text-terracotta font-medium hover:underline no-underline">{{ lang.translate('auth.forgot_pwd') }}</a>
          </div>

          <!-- Error message -->
          <div *ngIf="globalError()" class="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ globalError() }}
          </div>

          <!-- Submit -->
          <app-button type="submit" variant="primary" size="lg" [disabled]="loading()" [fullWidth]="true">
            <svg *ngIf="loading()" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg *ngIf="!loading()" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            {{ loading() ? lang.translate('common.loading') : (requiresOtp() ? lang.translate('auth.otp_verify') : lang.translate('nav.login')) }}
          </app-button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  phone = '';
  password = '';
  showPwd = false;
  loading = signal(false);
  phoneError = signal('');
  passwordError = signal('');
  otpError = signal('');
  globalError = signal('');
  
  countdown = signal(60);
  timerInterval: any;
  
  // OTP states
  requiresOtp = signal(false);
  otpCode = '';
  pendingUserId = '';

  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  lang = inject(LanguageService);
  router = inject(Router);

  constructor() {}

  onSubmit() {
    this.phoneError.set('');
    this.passwordError.set('');
    this.globalError.set('');

    if (this.requiresOtp()) {
      if (!this.otpCode || this.otpCode.length !== 6) {
        this.otpError.set('Code OTP invalide (6 chiffres)');
        return;
      }
      this.loading.set(true);
      this.authService.verifyOtp(this.pendingUserId, this.otpCode).subscribe({
        next: (user) => {
          this.loading.set(false);
          this.notificationService.show(`${this.lang.translate('msg.welcome')}, ${user.name}`);
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          this.loading.set(false);
          this.otpError.set(this.lang.translate('common.error'));
          this.globalError.set(err.error?.message || this.lang.translate('msg.error_occurred'));
        }
      });
      return;
    }

    const trimmedPhone = this.phone.trim();
    const phoneRegex = /^(?:\+222)?(2|3|4)\d{7}$/;
    if (!trimmedPhone) { 
      this.phoneError.set(this.lang.translate('auth.error_required')); 
      return; 
    } else if (!phoneRegex.test(trimmedPhone)) {
      this.phoneError.set(this.lang.translate('auth.error_phone'));
      return;
    }
    
    if (!this.password) { this.passwordError.set(this.lang.translate('auth.error_required')); return; }

    this.loading.set(true);
    this.authService.login(trimmedPhone, this.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.requiresOtp) {
          this.requiresOtp.set(true);
          this.pendingUserId = res.userId;
          this.notificationService.show(this.lang.translate('auth.otp_msg'));
          this.startTimer();
        } else {
          this.notificationService.show(`${this.lang.translate('msg.welcome')}, ${res.name}`);
          if (res.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.show(err.error?.message || this.lang.translate('msg.error_occurred'), 'error');
        this.globalError.set(err.error?.message || this.lang.translate('msg.error_occurred'));
      }
    });
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.countdown.set(60);
    this.timerInterval = setInterval(() => {
      this.countdown.update(c => {
        if (c <= 1) {
          clearInterval(this.timerInterval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  resendOtp() {
    if (this.countdown() > 0) return;
    
    this.loading.set(true);
    const trimmedPhone = this.phone.trim();
    this.authService.login(trimmedPhone, this.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notificationService.show(this.lang.translate('auth.otp_msg'));
        this.startTimer();
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.show(this.lang.translate('msg.error_occurred'), 'error');
      }
    });
  }
}
