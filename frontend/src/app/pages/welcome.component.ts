import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styles: [`
    :host { display: block; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeInUp .6s ease-out both; }
    .fade-in-2 { animation: fadeInUp .6s .15s ease-out both; }
    .fade-in-3 { animation: fadeInUp .6s .3s ease-out both; }
  `],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-beige via-white to-beige px-6 py-12 relative overflow-hidden" [attr.dir]="lang.isRTL() ? 'rtl' : 'ltr'">
      
      <!-- Top corners decor -->
      <div class="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl"></div>

      <!-- Language Selector -->
      <div class="absolute top-6 right-6 z-50 fade-in flex gap-2">
        <button (click)="lang.setLocale('fr')" 
                [class]="lang.currentLocale() === 'fr' ? 'bg-primary text-white' : 'bg-white/80 text-gray-500 hover:bg-white'"
                class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-none cursor-pointer shadow-sm active:scale-95">
          FR
        </button>
        <button (click)="lang.setLocale('ar')" 
                [class]="lang.currentLocale() === 'ar' ? 'bg-primary text-white text-sm' : 'bg-white/80 text-gray-500 hover:bg-white text-sm'"
                class="px-4 py-2 rounded-xl font-bold transition-all border-none cursor-pointer shadow-sm active:scale-95">
          العربية
        </button>
      </div>

      <div class="text-center max-w-sm w-full relative z-10">

        <!-- Logo -->
        <div class="fade-in mx-auto mb-12 transform hover:scale-105 transition-transform duration-500">
          <svg width="220" height="60" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto drop-shadow-2xl" [style.direction]="'ltr'">
            <!-- Stylized Y Icon -->
            <rect x="0" y="0" width="40" height="40" rx="12" fill="#E2725B" class="logo-box" />
            <path d="M12 12L20 21L28 12M20 21V30" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="logo-path" />
            
            <!-- YamiShop Text -->
            <text x="50" y="28" fill="#1e293b" font-family="'Inter', sans-serif" font-weight="900" font-size="22" letter-spacing="-1">
              Yami<tspan fill="#E2725B">Shop</tspan>
            </text>
            
            <defs>
              <linearGradient id="logo-shine-welcome" x1="0" y1="0" x2="100%" y2="0">
                <stop offset="0%" stop-color="white" stop-opacity="0" />
                <stop offset="50%" stop-color="white" stop-opacity="0.4" />
                <stop offset="100%" stop-color="white" stop-opacity="0" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="160" height="40" fill="url(#logo-shine-welcome)" class="shine-rect" />
          </svg>
        </div>

        <!-- Title -->
        <h1 class="fade-in-2 text-4xl font-extrabold text-gray-900 mb-3 font-inter leading-tight">
          {{ lang.translate('welcome.title') }}<br><span class="text-primary">YamiShop</span>
        </h1>
        <p class="fade-in-2 text-gray-500 text-base mb-10 leading-relaxed font-medium">
          {{ lang.translate('welcome.subtitle') }}
        </p>

        <!-- Actions -->
        <div class="fade-in-3 flex flex-col gap-4 w-full">
          <!-- Shop Button -->
          <a routerLink="/home" 
             class="inline-flex items-center justify-center bg-terracotta text-white px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-terracotta-dark transition-all duration-300 no-underline cursor-pointer border-2 border-white/20 active:scale-95 premium-button-shine animate-button-hover">
            <span>{{ lang.translate('welcome.start') }}</span>
          </a>
          
          <!-- Login Button -->
          <a routerLink="/login" 
             class="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all duration-300 no-underline cursor-pointer border-2 border-white/10 active:scale-95 premium-button-shine animate-button-hover">
            <span>{{ lang.translate('welcome.login') }}</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class WelcomeComponent {
  lang = inject(LanguageService);
}

