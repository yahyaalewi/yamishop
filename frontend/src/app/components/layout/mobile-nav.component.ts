import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { cartCount } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="mobile-nav" [attr.dir]="lang.isRTL() ? 'rtl' : 'ltr'">
      
      <!-- Home -->
      <a routerLink="/home" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" 
         class="nav-item no-underline">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <span class="nav-label">{{ lang.translate('nav.home') }}</span>
      </a>

      <!-- Shop -->
      <a routerLink="/products" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" class="nav-item no-underline">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span class="nav-label">{{ lang.translate('nav.shop') }}</span>
      </a>

      <!-- Cart -->
      <a routerLink="/cart" routerLinkActive="active-link" class="nav-item no-underline">
        <div class="relative">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span *ngIf="cartCount() > 0" 
                class="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-terracotta text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {{cartCount()}}
          </span>
        </div>
        <span class="nav-label">{{ lang.translate('nav.cart') }}</span>
      </a>

      <!-- Profile / Register -->
      <a [routerLink]="authService.currentUser() ? '/profile' : '/register'" routerLinkActive="active-link" class="nav-item no-underline">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <span class="nav-label">
          {{ authService.currentUser() ? lang.translate('profile.title') : lang.translate('nav.register') }}
        </span>
      </a>

    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }

    .mobile-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      background: white;
      border-top: 1px solid #f3f4f6;
      box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
      z-index: 9999;
      grid-template-columns: repeat(4, 1fr);
      align-items: center;
      padding: 0.5rem 1.5rem;
      padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
    }

    @media (max-width: 767px) {
      .mobile-nav {
        display: grid;
      }
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.2s;
      padding: 0.25rem 0;
    }

    .nav-item:hover {
      color: var(--color-primary);
    }

    .nav-item.active-link {
      color: var(--color-primary);
    }

    .nav-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: -0.025em;
      text-align: center;
    }
  `]
})
export class MobileNavComponent {
  cartCount = cartCount;
  authService = inject(AuthService);
  lang = inject(LanguageService);
}
