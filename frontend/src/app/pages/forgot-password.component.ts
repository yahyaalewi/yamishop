import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../components/ui/button.component';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { LanguageService } from '../services/language.service';

type Step = 'phone' | 'otp' | 'newpwd' | 'done';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent],
  styles: [':host { display: block; }'],
  template: `
    <div class="h-full flex flex-col items-center justify-center px-4 py-12">
      <div class="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md p-8 relative z-10">

        <!-- ── Step indicator ── -->
        <div class="flex items-center justify-center gap-2 mb-6">
          <div *ngFor="let s of ['phone','otp','newpwd']; let i = index"
               class="flex items-center gap-2">
            <div [class]="stepCircle(s)" class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all">
              {{ i + 1 }}
            </div>
            <div *ngIf="i < 2" class="w-8 h-0.5 rounded-full"
                 [class]="stepPassed(s) ? 'bg-primary' : 'bg-gray-200'"></div>
          </div>
        </div>

        <!-- ── Header ── -->
        <div class="text-center mb-6">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
               [class]="step() === 'done' ? 'bg-green-100' : 'bg-primary/10'">
            <!-- lock icon -->
            <svg *ngIf="step() !== 'done'" class="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <!-- check icon -->
            <svg *ngIf="step() === 'done'" class="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>

          <h1 class="text-2xl font-extrabold text-gray-900">
            {{ step() === 'done' ? lang.translate('auth.reset_success').split('!')[0] + ' ✅' : lang.translate('auth.forgot_title') }}
          </h1>
          <p class="text-sm text-gray-500 mt-1" *ngIf="step() === 'phone'">
            {{ lang.translate('auth.forgot_subtitle') }}
          </p>
          <p class="text-sm text-gray-500 mt-1" *ngIf="step() === 'otp'">
            {{ lang.translate('auth.forgot_otp_sent') }} <strong class="text-primary">{{ maskedEmail() }}</strong>
          </p>
        </div>

        <!-- ══ STEP 1: Phone ══ -->
        <form *ngIf="step() === 'phone'" (ngSubmit)="sendOtp()" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              {{ lang.translate('checkout.phone') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <input type="tel" name="phone" [(ngModel)]="phone" placeholder="+222 4X XX XX XX"
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                [class.border-red-400]="phoneError()">
            </div>
            <p *ngIf="phoneError()" class="text-xs text-red-500 mt-1">{{ phoneError() }}</p>
          </div>

          <!-- No-email warning -->
          <div *ngIf="noEmailError()"
               class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex gap-2 items-start">
            <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <div>
              {{ lang.translate('auth.forgot_no_email') }}
              <a href="https://wa.me/22246789000" target="_blank"
                 class="block mt-1 text-primary font-semibold hover:underline">
                📲 WhatsApp
              </a>
            </div>
          </div>

          <div *ngIf="globalError() && !noEmailError()"
               class="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {{ globalError() }}
          </div>

          <app-button type="submit" variant="primary" size="lg" [disabled]="loading()" [fullWidth]="true">
            <svg *ngIf="loading()" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg *ngIf="!loading()" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {{ loading() ? lang.translate('common.loading') : lang.translate('auth.forgot_send_otp') }}
          </app-button>

          <p class="text-center text-sm text-gray-500 pt-1">
            <a routerLink="/login" class="text-primary font-semibold hover:underline no-underline">
              ← {{ lang.translate('auth.back_to_login') }}
            </a>
          </p>
        </form>

        <!-- ══ STEP 2: OTP ══ -->
        <form *ngIf="step() === 'otp'" (ngSubmit)="verifyOtp()" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              {{ lang.translate('auth.otp_verify') }}
            </label>
            <input type="text" name="otpCode" [(ngModel)]="otpCode"
              placeholder="••••••" maxlength="6" inputmode="numeric"
              class="w-full px-4 py-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-center tracking-[0.6em] font-black text-2xl"
              [class.border-red-400]="otpError()">
            <p *ngIf="otpError()" class="text-xs text-red-500 mt-1 text-center">{{ otpError() }}</p>
          </div>

          <!-- Countdown -->
          <div class="flex items-center justify-between text-xs text-gray-400 px-1">
            <span *ngIf="countdown() > 0">
              {{ lang.translate('auth.otp_expire') }} :
              <span class="text-primary font-bold">{{ countdown() }}s</span>
            </span>
            <button type="button" *ngIf="countdown() === 0" (click)="sendOtp()"
              class="text-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer text-sm">
              {{ lang.translate('auth.resend_otp') }}
            </button>
            <span *ngIf="countdown() > 0"></span>
          </div>

          <div *ngIf="globalError()" class="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {{ globalError() }}
          </div>

          <app-button type="submit" variant="primary" size="lg" [disabled]="loading()" [fullWidth]="true">
            <svg *ngIf="loading()" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ loading() ? lang.translate('common.loading') : lang.translate('auth.otp_verify') }}
          </app-button>

          <p class="text-center text-sm">
            <button type="button" (click)="step.set('phone')"
              class="text-gray-500 hover:text-primary bg-transparent border-none cursor-pointer text-sm">
              ← {{ lang.translate('common.back') }}
            </button>
          </p>
        </form>

        <!-- ══ STEP 3: New Password ══ -->
        <form *ngIf="step() === 'newpwd'" (ngSubmit)="doReset()" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              {{ lang.translate('auth.new_password') }}
            </label>
            <div class="relative">
              <input [type]="showPwd ? 'text' : 'password'" name="newPassword" [(ngModel)]="newPassword"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all pr-12"
                [class.border-red-400]="pwdError()">
              <button type="button" (click)="showPwd = !showPwd"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary bg-transparent border-none cursor-pointer">
                <svg *ngIf="!showPwd" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg *ngIf="showPwd" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
            <p *ngIf="pwdError()" class="text-xs text-red-500 mt-1">{{ pwdError() }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              {{ lang.translate('auth.confirm_new_pwd') }}
            </label>
            <input type="password" name="confirmPassword" [(ngModel)]="confirmPassword"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              [class.border-red-400]="confirmError()">
            <p *ngIf="confirmError()" class="text-xs text-red-500 mt-1">{{ confirmError() }}</p>
          </div>

          <div *ngIf="globalError()" class="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {{ globalError() }}
          </div>

          <app-button type="submit" variant="primary" size="lg" [disabled]="loading()" [fullWidth]="true">
            <svg *ngIf="loading()" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg *ngIf="!loading()" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            {{ loading() ? lang.translate('common.loading') : lang.translate('auth.reset_password') }}
          </app-button>
        </form>

        <!-- ══ STEP 4: Done ══ -->
        <div *ngIf="step() === 'done'" class="text-center space-y-4">
          <div class="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4 text-sm font-medium">
            {{ lang.translate('auth.reset_success') }}
          </div>
          <app-button variant="primary" size="lg" [fullWidth]="true" (click)="router.navigate(['/login'])">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            {{ lang.translate('auth.back_to_login') }}
          </app-button>
        </div>

      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  // Form fields
  phone = '';
  otpCode = '';
  newPassword = '';
  confirmPassword = '';
  showPwd = false;

  // State
  step = signal<Step>('phone');
  loading = signal(false);
  countdown = signal(0);
  timerInterval: any;

  // Signals
  maskedEmail = signal('');
  pendingUserId = signal('');
  phoneError = signal('');
  otpError = signal('');
  pwdError = signal('');
  confirmError = signal('');
  globalError = signal('');
  noEmailError = signal(false);

  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  lang = inject(LanguageService);
  router = inject(Router);

  // Helpers for step indicator styling
  stepOrder: Step[] = ['phone', 'otp', 'newpwd'];
  stepCircle(s: string): string {
    const currentIdx = this.stepOrder.indexOf(this.step() as any);
    const sIdx = this.stepOrder.indexOf(s as any);
    if (sIdx < currentIdx || this.step() === 'done') return 'bg-primary text-white';
    if (sIdx === currentIdx) return 'bg-primary/20 text-primary ring-2 ring-primary';
    return 'bg-gray-100 text-gray-400';
  }
  stepPassed(s: string): boolean {
    const currentIdx = this.stepOrder.indexOf(this.step() as any);
    const sIdx = this.stepOrder.indexOf(s as any);
    return sIdx < currentIdx || this.step() === 'done';
  }

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────────
  sendOtp() {
    this.phoneError.set('');
    this.globalError.set('');
    this.noEmailError.set(false);

    const trimmed = this.phone.trim();
    const phoneRegex = /^(?:\+222)?(2|3|4)\d{7}$/;
    if (!trimmed) { this.phoneError.set(this.lang.translate('auth.error_required')); return; }
    if (!phoneRegex.test(trimmed)) { this.phoneError.set(this.lang.translate('auth.error_phone')); return; }

    this.loading.set(true);
    this.authService.forgotPassword(trimmed).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.pendingUserId.set(res.userId);
        this.maskedEmail.set(res.maskedEmail);
        this.step.set('otp');
        this.startTimer();
        this.notificationService.show(
          `${this.lang.translate('auth.forgot_otp_sent')} ${res.maskedEmail}`
        );
      },
      error: (err) => {
        this.loading.set(false);
        if (err.error?.message === 'no_email') {
          this.noEmailError.set(true);
        } else {
          this.globalError.set(err.error?.message || this.lang.translate('msg.error_occurred'));
        }
      }
    });
  }

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────────
  verifyOtp() {
    this.otpError.set('');
    this.globalError.set('');
    if (!this.otpCode || this.otpCode.length !== 6) {
      this.otpError.set(this.lang.isRTL() ? 'الرمز يجب أن يكون 6 أرقام' : 'Code OTP invalide (6 chiffres)');
      return;
    }
    // We move to step 3 — actual OTP validation happens on the server at reset time
    this.step.set('newpwd');
  }

  // ── Step 3: Reset Password ───────────────────────────────────────────────────
  doReset() {
    this.pwdError.set('');
    this.confirmError.set('');
    this.globalError.set('');

    if (this.newPassword.length < 6) {
      this.pwdError.set(this.lang.translate('auth.error_pwd_len'));
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.confirmError.set(this.lang.translate('auth.error_pwd_match'));
      return;
    }

    this.loading.set(true);
    this.authService.resetPassword(this.pendingUserId(), this.otpCode, this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('done');
        if (this.timerInterval) clearInterval(this.timerInterval);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || this.lang.translate('msg.error_occurred');
        // If OTP is wrong go back to OTP step
        if (msg.includes('OTP') || msg.includes('expiré') || msg.includes('invalide')) {
          this.step.set('otp');
          this.otpError.set(msg);
        } else {
          this.globalError.set(msg);
        }
      }
    });
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.countdown.set(180); // 3 minutes
    this.timerInterval = setInterval(() => {
      this.countdown.update(c => {
        if (c <= 1) { clearInterval(this.timerInterval); return 0; }
        return c - 1;
      });
    }, 1000);
  }
}
