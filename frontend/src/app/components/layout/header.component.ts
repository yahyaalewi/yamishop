import { Component, signal, inject, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { cartCount } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [':host { display: block; }'],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 w-full bg-primary text-white shadow-lg">
      <div class="container mx-auto px-4 h-16 flex items-center gap-4">

        <!-- Logo -->
        <a routerLink="/home" class="flex items-center gap-3 no-underline group animate-logo-always">
          <svg style="overflow: hidden;" width="160" height="40" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-10 w-auto" style="direction: ltr !important;">
            <!-- Stylized Y Icon -->
            <rect x="0" y="0" width="40" height="40" rx="12" fill="#E2725B" class="logo-box" />
            <path d="M12 12L20 21L28 12M20 21V30" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="logo-path" />
            
            <!-- YamiShop Text -->
            <text x="50" y="28" fill="white" font-family="'Inter', sans-serif" font-weight="900" font-size="22" letter-spacing="-1" style="direction: ltr !important; unicode-bidi: bidi-override;">
              Yami<tspan fill="#E2725B" style="direction: ltr !important;">Shop</tspan>
            </text>
            
            <!-- Shine Layer -->
            <rect x="0" y="0" width="160" height="40" fill="url(#logo-shine)" class="shine-rect" />
            
            <defs>
              <linearGradient id="logo-shine" x1="0" y1="0" x2="100%" y2="0">
                <stop offset="0%" stop-color="white" stop-opacity="0" />
                <stop offset="50%" stop-color="white" stop-opacity="0.4" />
                <stop offset="100%" stop-color="white" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </a>



        <!-- Search bar -->
        <div class="hidden md:flex flex-1 max-w-md mx-4">
          <div class="relative w-full">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" [placeholder]="lang.translate('nav.search')"
              class="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-inter">
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-1 md:hidden"></div>

        <!-- Actions -->
        <nav class="flex items-center gap-1">
          <!-- Products -->
          <a routerLink="/products" class="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition-colors no-underline text-white">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {{ lang.translate('nav.shop') }}
          </a>
          <!-- Cart -->
          <a routerLink="/cart" class="hidden md:flex relative group h-10 px-3 rounded-xl hover:bg-white/10 items-center gap-2 transition-all no-underline text-white border border-white/10">
            <div class="relative">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span *ngIf="cartCount() > 0"
                class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-primary animate-in fade-in zoom-in duration-300">
                {{cartCount()}}
              </span>
            </div>
            <span class="text-sm font-bold hidden sm:inline uppercase tracking-tight">{{ lang.translate('nav.cart') }}</span>
          </a>

          <!-- Profile / Register -->
          <ng-container *ngIf="authService.currentUser(); else registerLink">
            <a routerLink="/profile" class="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors no-underline text-white">

              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="text-sm font-medium hidden md:inline">{{ firstName() }}</span>

            </a>
          </ng-container>
          <ng-template #registerLink>
            <a routerLink="/register" class="hidden md:flex px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-dark text-xs font-bold transition-all no-underline text-white items-center gap-1.5 border-none shadow-lg active:scale-95">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {{ lang.translate('nav.register') }}
            </a>
          </ng-template>

          <!-- Language toggle -->
          <button (click)="toggleRTL()" class="w-14 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-xs font-black bg-transparent text-white border-none cursor-pointer">
            {{ lang.currentLocale() === 'ar' ? 'Français' : 'عربي' }}
          </button>

        </nav>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);
  lang = inject(LanguageService);
  cartCount = cartCount;
  notificationService = inject(NotificationService);
  router = inject(Router);

  firstName = computed(() => {
    const user = this.authService.currentUser();
    return user ? user.name.split(' ')[0] : '';
  });

  logout() {
    this.authService.logout();
    this.notificationService.show(this.lang.translate('msg.logged_out'));
    this.router.navigate(['/login']);
  }

  toggleRTL() {
    const next = this.lang.currentLocale() === 'ar' ? 'fr' : 'ar';
    this.lang.setLocale(next);
  }
}
