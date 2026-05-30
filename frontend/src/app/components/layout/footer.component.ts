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
          
          <!-- Brand & Socials -->
          <div class="md:col-span-1 flex flex-col xl:flex-row xl:items-center justify-center md:justify-start gap-4">
            <a routerLink="/home" class="flex items-center gap-3 no-underline group animate-logo-always shrink-0 mx-auto md:mx-0">
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

            <!-- Social Links -->
            <div class="flex items-center justify-center gap-3 shrink-0 xl:ml-2">
              <a href="https://www.facebook.com/profile.php?id=61577451797634" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#1877F2] hover:scale-110 transition-all border border-white/10 shadow-lg group">
                <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@yamishop222" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#ff0050] hover:scale-110 transition-all border border-white/10 shadow-lg group">
                <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91.04 1.56.09 2.93.92 3.86 2.05 1.05 1.25 1.48 2.87 1.5 4.5v.06c-1.68-.05-3.32-.47-4.78-1.28-.52-.29-1.02-.63-1.46-1.02v10.95c0 3.86-3.14 7-7 7-3.87 0-7-3.14-7-7 0-3.85 3.13-7 7-7 .42 0 .84.04 1.25.11v4c-.38-.08-.78-.13-1.2-.13-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V.02z"/></svg>
              </a>
            </div>
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
          <!-- Policies Links -->
          <div class="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
             <a routerLink="/about" class="hover:text-terracotta transition-colors cursor-pointer no-underline">{{ lang.translate('footer.about') }}</a>
             <a routerLink="/privacy" class="hover:text-terracotta transition-colors cursor-pointer no-underline">{{ lang.translate('footer.privacy_policy') }}</a>
             <a routerLink="/return-policy" class="hover:text-terracotta transition-colors cursor-pointer no-underline">{{ lang.translate('footer.return_policy') }}</a>
          </div>

          <div class="space-y-2 mt-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">&copy; 2026 YamiShop — {{ lang.translate('footer.made_in') }} 🇲🇷</p>
            <p class="text-[11px] font-medium tracking-[0.1em] text-white/60 lowercase">
              {{ lang.translate('footer.developed_by') }} <a href="https://www.linkedin.com/in/el-mamy-yahya-7a39342b9" target="_blank" rel="noopener noreferrer" class="text-terracotta hover:text-white transition-colors cursor-pointer font-black no-underline">yahya elmami</a>
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-x-4 mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/10">
             <span class="hover:text-terracotta transition-colors cursor-default">SPA MODE</span>
             <span class="hover:text-terracotta transition-colors cursor-default">V-20.0</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  lang = inject(LanguageService);
}
