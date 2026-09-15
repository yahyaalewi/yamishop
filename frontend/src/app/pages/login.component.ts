import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
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

          <!-- Password (Hidden if OTP required) -->
          <div *ngIf="!requiresOtp()">
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-sm font-semibold text-gray-700">{{ lang.translate('auth.new_password') }}</label>
              <a routerLink="/forgot-password" class="text-xs text-primary font-medium hover:underline no-underline">{{ lang.translate('auth.forgot_pwd') }}</a>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input [type]="showPassword() ? 'text' : 'password'" name="password" [(ngModel)]="password" placeholder="••••••••"
                class="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                [class.border-red-400]="passwordError()">
              <button type="button" (click)="showPassword.set(!showPassword())"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                <svg *ngIf="!showPassword()" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg *ngIf="showPassword()" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p *ngIf="passwordError()" class="text-xs text-red-500 mt-1">{{ passwordError() }}</p>
          </div>

          <!-- 2FA OTP Code Input Screen -->
          <div *ngIf="requiresOtp()" class="space-y-4 animate-in fade-in zoom-in duration-300">
            <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <div class="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl shadow-md">
                🔐
              </div>
              <h3 class="text-base font-bold text-gray-900 mb-1">Authentification à deux facteurs</h3>
              <p class="text-xs text-gray-600 leading-relaxed">{{ otpMessage() }}</p>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5 text-center">Entrez le code OTP reçu</label>
              <input type="text" maxlength="6" [(ngModel)]="otpCode" name="otpCode" placeholder="••••••"
                class="w-full text-center tracking-[12px] font-mono text-2xl py-3 border-2 border-emerald-400 rounded-xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-gray-900"
                [class.border-red-400]="otpError()">
              <p *ngIf="otpError()" class="text-xs text-red-500 mt-1 text-center font-bold">{{ otpError() }}</p>
            </div>

            <div class="text-center pt-2">
              <button *ngIf="countdown() > 0" type="button" disabled class="text-xs text-gray-400 bg-transparent border-none">
                Renvoyer le code dans ({{ countdown() }}s)
              </button>
              <button *ngIf="countdown() === 0" type="button" (click)="resendOtp()" class="text-xs text-primary font-bold hover:underline bg-transparent border-none cursor-pointer">
                Renvoyer le code OTP
              </button>
            </div>
          </div>

          <!-- Global Error -->
          <p *ngIf="globalError()" class="text-sm text-red-500 text-center font-medium bg-red-50 p-3 rounded-xl border border-red-100">
            {{ globalError() }}
          </p>

          <!-- Submit -->
          <button type="submit" [disabled]="loading()"
            class="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all duration-300 border-none cursor-pointer active:scale-95 disabled:opacity-50">
            <span *ngIf="!loading()">{{ requiresOtp() ? 'Valider et se connecter' : lang.translate('nav.login') }}</span>
            <span *ngIf="loading()" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              <span>{{ lang.translate('common.loading') }}</span>
            </span>
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  phone = '';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  phoneError = signal('');
  passwordError = signal('');
  otpError = signal('');
  globalError = signal('');
  countdown = signal(60);
  timerInterval: any;
  
  // OTP states
  requiresOtp = signal(false);
  otpMessage = signal<string>('');
  otpCode = '';
  pendingUserId = '';

  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  lang = inject(LanguageService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  constructor() {}

  private navigateAfterLogin(role: string) {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
      return;
    }
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'store_admin') {
      this.router.navigate(['/store-admin/orders']);
    } else {
      this.router.navigate(['/home']);
    }
  }

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
          this.navigateAfterLogin(user.role);
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
          this.otpMessage.set(res.message || 'Un code de vérification OTP a été envoyé à votre adresse email.');
          this.notificationService.show(res.message || this.lang.translate('auth.otp_msg'));
          this.startTimer();
        } else {
          this.notificationService.show(`${this.lang.translate('msg.welcome')}, ${res.name}`);
          this.navigateAfterLogin(res.role);
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
