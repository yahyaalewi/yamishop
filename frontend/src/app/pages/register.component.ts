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
            <div class="flex items-stretch">
              <!-- Préfixe pays fixe -->
              <div class="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl shrink-0">
                <span class="text-base mr-1">🇲🇷</span>
                <span class="text-sm font-bold text-gray-500">+222</span>
              </div>
              <!-- Champ numéro (8 chiffres uniquement) -->
              <input type="tel" name="phone" [(ngModel)]="phone"
                (input)="onPhoneInput($event)"
                placeholder="XX XX XX XX"
                maxlength="11"
                class="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                [class.border-red-400]="phoneError()">
            </div>
            <!-- Indicateur de validation en temps réel -->
            <div class="mt-1 flex items-center gap-1.5" *ngIf="phone.length > 0">
              <span *ngIf="isPhoneValid()" class="text-xs text-green-600 font-semibold flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                Numéro valide
              </span>
              <span *ngIf="!isPhoneValid() && rawPhone.length >= 8" class="text-xs text-red-500 font-semibold flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                Doit commencer par 2, 3 ou 4
              </span>
            </div>
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

  /** Filtre la saisie : chiffres uniquement, max 8, formatage XX XX XX XX */
  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    const parts = val.match(/(\d{1,2})(\d{0,2})(\d{0,2})(\d{0,2})/);
    if (parts) {
      this.phone = [parts[1], parts[2], parts[3], parts[4]].filter(Boolean).join(' ');
    } else {
      this.phone = val;
    }
    input.value = this.phone;
  }

  /** Retourne les 8 chiffres bruts sans espaces */
  get rawPhone(): string {
    return this.phone.replace(/\D/g, '');
  }

  /** Validation en temps réel */
  isPhoneValid(): boolean {
    return /^[234]\d{7}$/.test(this.rawPhone);
  }

  onSubmit() {
    this.nameError.set('');
    this.phoneError.set('');
    this.passwordError.set('');
    this.confirmError.set('');

    let valid = true;
    if (!this.name) { this.nameError.set(this.lang.translate('auth.error_required')); valid = false; }
    
    const digits = this.rawPhone;
    if (!digits) { 
      this.phoneError.set(this.lang.translate('auth.error_required')); 
      valid = false; 
    } else if (!this.isPhoneValid()) {
      this.phoneError.set('Numéro invalide. Doit commencer par 2, 3 ou 4 et contenir 8 chiffres.');
      valid = false;
    }

    if (this.password.length < 6) { this.passwordError.set(this.lang.translate('auth.error_pwd_len')); valid = false; }
    if (this.password !== this.confirmPassword) { this.confirmError.set(this.lang.translate('auth.error_pwd_match')); valid = false; }
    if (!valid) return;

    this.loading.set(true);
    // Envoie le numéro normalisé (8 chiffres) au backend
    this.authService.register(this.name, digits, this.password).subscribe({
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
