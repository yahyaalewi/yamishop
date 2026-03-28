import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],

  styles: [':host { display: block; }'],
  template: `
    <footer class="bg-primary-dark text-white pt-6 pb-2 border-t border-white/5">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          <!-- Brand -->
          <div class="md:col-span-1">
            <a routerLink="/home" class="flex items-center gap-3 no-underline group animate-logo-always">
              <svg width="180" height="45" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-12 w-auto" style="direction: ltr !important;">
                <!-- Stylized Y Icon -->
                <rect x="0" y="0" width="40" height="40" rx="12" fill="#E2725B" class="logo-box" />
                <path d="M12 12L20 21L28 12M20 21V30" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="logo-path" />
                
                <!-- YamiShop Text -->
                <text x="50" y="28" fill="white" font-family="'Inter', sans-serif" font-weight="900" font-size="22" letter-spacing="-1" style="direction: ltr !important; unicode-bidi: bidi-override;">
                  Yami<tspan fill="#E2725B" style="direction: ltr !important;">Shop</tspan>
                </text>
                
                <!-- Shine Layer -->
                <rect x="0" y="0" width="160" height="40" fill="url(#logo-shine-footer)" class="shine-rect" />
                
                <defs>
                  <linearGradient id="logo-shine-footer" x1="0" y1="0" x2="100%" y2="0">
                    <stop offset="0%" stop-color="white" stop-opacity="0" />
                    <stop offset="50%" stop-color="white" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="white" stop-opacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </a>
          </div>



          <!-- Info (Contact expanded for balance) -->
          <div class="md:col-span-2 bg-white/10 rounded-3xl p-5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner">
            <a href="tel:+22234165525" class="animate-phone-always no-underline transition-all duration-300">
              <span class="text-xs font-black uppercase tracking-widest opacity-50" [class.mr-4]="!lang.isRTL()" [class.ml-4]="lang.isRTL()">{{ lang.translate('common.contact') }}</span>

              <span class="text-xl font-black tracking-[0.2em]">+222 34165525</span>
            </a>
          </div>
        </div>

        <div class="border-t border-white/10 pt-10 pb-4 flex flex-col items-center gap-4 text-center">
          <div class="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
             <a routerLink="/privacy" class="hover:text-terracotta transition-colors cursor-pointer no-underline">{{ lang.translate('footer.privacy_policy') }}</a>
             <a routerLink="/return-policy" class="hover:text-terracotta transition-colors cursor-pointer no-underline">{{ lang.translate('footer.return_policy') }}</a>
             <span class="hidden md:inline">|</span>
             <span class="hover:text-terracotta transition-colors cursor-default">SPA MODE</span>
             <span class="hover:text-terracotta transition-colors cursor-default">V-20.0</span>
          </div>

          <div class="space-y-2 mt-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">&copy; 2026 YamiShop — {{ lang.translate('footer.made_in') }} 🇲🇷</p>
            <p class="text-[11px] font-medium tracking-[0.1em] text-white/60 lowercase">
              {{ lang.translate('footer.developed_by') }} <a href="https://linkedin.com/in/al-mami-yahya-7a39342b9" target="_blank" rel="noopener noreferrer" class="text-terracotta hover:text-white transition-colors cursor-pointer font-black no-underline">yahya elmami</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  lang = inject(LanguageService);
}
