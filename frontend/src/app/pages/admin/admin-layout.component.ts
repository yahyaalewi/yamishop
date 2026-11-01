import { Component, signal, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  styles: [`
    :host { display: block; min-height: 100vh; }
    .nav-item-active {
      background: linear-gradient(135deg, rgba(15, 77, 92, 0.95), rgba(26, 111, 133, 0.95));
      color: #ffffff !important;
      box-shadow: 0 4px 14px rgba(15, 77, 92, 0.35);
    }
    .bottom-tab-active {
      color: #0f4d5c !important;
      font-weight: 800;
    }
    .bottom-tab-active svg {
      transform: translateY(-2px);
      filter: drop-shadow(0 2px 6px rgba(15, 77, 92, 0.3));
    }
  `],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800 antialiased" dir="ltr">

      <!-- Sidebar (Desktop only: hidden lg:flex) -->
      <aside 
        [ngClass]="{
          'lg:w-64 xl:w-72': !isDesktopCollapsed(),
          'lg:w-20': isDesktopCollapsed()
        }"
        class="hidden lg:flex bg-slate-900 text-slate-100 flex-col shadow-2xl border-r border-slate-800 transition-all duration-300 ease-in-out lg:static lg:h-screen lg:shrink-0">
        
        <!-- Sidebar Brand Header -->
        <div class="p-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <a routerLink="/admin/dashboard" class="flex items-center gap-3 no-underline group min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/30 shrink-0 group-hover:scale-105 transition-transform">
              Y
            </div>
            <div *ngIf="!isDesktopCollapsed()" class="min-w-0 flex-1">
              <p class="font-extrabold text-sm tracking-tight text-white m-0 leading-tight truncate group-hover:text-primary-light transition-colors">
                YamiShop
              </p>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse"></span>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Super Admin</span>
              </div>
            </div>
          </a>

          <!-- Collapse on desktop -->
          <div class="flex items-center gap-1">
            <button (click)="toggleDesktopSidebar()" [title]="isDesktopCollapsed() ? 'Agrandir' : 'Réduire'" class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border-none bg-transparent cursor-pointer">
              <svg class="w-4 h-4 transition-transform" [class.rotate-180]="isDesktopCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 py-4 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          
          <!-- Gestion Section -->
          <div>
            <p *ngIf="!isDesktopCollapsed()" class="px-3 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Gestion</p>
            <div class="space-y-1.5">
              
              <!-- Dashboard -->
              <a routerLink="/admin/dashboard" 
                 routerLinkActive="nav-item-active" 
                 [routerLinkActiveOptions]="{exact: true}"
                 class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all no-underline group"
                 [title]="lang.translate('admin.stats', 'fr')">
                <svg class="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span *ngIf="!isDesktopCollapsed()" class="truncate">{{ lang.translate('admin.stats', 'fr') }}</span>
              </a>

              <!-- Products -->
              <a routerLink="/admin/products" 
                 routerLinkActive="nav-item-active"
                 class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all no-underline group"
                 [title]="lang.translate('admin.catalog', 'fr')">
                <svg class="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <span *ngIf="!isDesktopCollapsed()" class="truncate">{{ lang.translate('admin.catalog', 'fr') }}</span>
              </a>

              <!-- Orders -->
              <a routerLink="/admin/orders" 
                 routerLinkActive="nav-item-active"
                 class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all no-underline group"
                 [title]="lang.translate('admin.orders', 'fr')">
                <svg class="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span *ngIf="!isDesktopCollapsed()" class="truncate">{{ lang.translate('admin.orders', 'fr') }}</span>
              </a>

              <!-- Stores -->
              <a routerLink="/admin/stores" 
                 routerLinkActive="nav-item-active"
                 class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all no-underline group"
                 [title]="'Boutiques'">
                <svg class="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span *ngIf="!isDesktopCollapsed()" class="truncate">Boutiques</span>
              </a>

              <!-- Categories -->
              <a routerLink="/admin/categories" 
                 routerLinkActive="nav-item-active"
                 class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all no-underline group"
                 [title]="lang.translate('admin.categories', 'fr')">
                <svg class="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                <span *ngIf="!isDesktopCollapsed()" class="truncate">{{ lang.translate('admin.categories', 'fr') }}</span>
              </a>

              <!-- Users -->
              <a routerLink="/admin/users" 
                 routerLinkActive="nav-item-active"
                 class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all no-underline group"
                 [title]="'Utilisateurs'">
                <svg class="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <span *ngIf="!isDesktopCollapsed()" class="truncate">Utilisateurs</span>
              </a>

            </div>
          </div>

          <!-- Public site link -->
          <div>
            <p *ngIf="!isDesktopCollapsed()" class="px-3 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Vitrine</p>
            <a routerLink="/home" 
               target="_blank"
               class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-primary-light bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all no-underline group">
              <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              <span *ngIf="!isDesktopCollapsed()" class="truncate">Voir le site en direct</span>
            </a>
          </div>

        </nav>

        <!-- Sidebar User Footer -->
        <div class="p-3 border-t border-slate-800 bg-slate-950/40">
          <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/40">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                {{ initials() }}
              </div>
              <div *ngIf="!isDesktopCollapsed()" class="min-w-0 flex-1">
                <p class="text-xs font-bold text-white truncate m-0 leading-tight">{{ firstName() }}</p>
                <p class="text-[9px] text-primary-light font-bold uppercase tracking-wider mt-0.5">Super Admin</p>
              </div>
            </div>
            <button (click)="logout()" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-none bg-transparent cursor-pointer shrink-0" title="Déconnexion">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col min-w-0 min-h-screen">

        <!-- Topbar Header -->
        <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-xs">
          
          <!-- Super Admin Brand & Identity -->
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0 lg:hidden shadow-xs">
              Y
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h1 class="text-sm sm:text-base font-extrabold text-slate-900 m-0 truncate leading-tight">
                  {{ lang.translate('admin.control_panel', 'fr') }}
                </h1>
                <span class="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider shrink-0 lg:hidden">
                  Super Admin
                </span>
              </div>
              <p class="text-[10px] text-slate-400 font-semibold m-0 hidden sm:block">Panneau d'administration global de la plateforme</p>
            </div>
          </div>

          <!-- Topbar Actions -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <!-- View live site link -->
            <a routerLink="/home" 
               target="_blank"
               class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors no-underline">
              <svg class="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              <span class="hidden xs:inline">Site Web</span>
            </a>

            <!-- Quick Add Product Action -->
            <a routerLink="/admin/products" 
               class="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-light shadow-sm shadow-primary/25 transition-all no-underline">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="hidden xs:inline">Produit</span>
            </a>

            <!-- Direct Logout on Mobile -->
            <button (click)="logout()" 
                    class="lg:hidden p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer" 
                    title="Déconnexion">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
            </button>

            <!-- User initials badge (desktop) -->
            <div class="hidden lg:flex w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light text-white font-black text-xs items-center justify-center shadow-sm">
              {{ initials() }}
            </div>
          </div>
        </header>

        <!-- Dynamic Page Content -->
        <main class="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-10 custom-scrollbar overflow-x-hidden">
          <router-outlet></router-outlet>
        </main>

        <!-- Mobile Bottom Navigation Bar: All 6 Essential Sections (Visible only on mobile devices < 1024px) -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 py-1.5 flex items-center justify-around">
          
          <!-- Tab 1: Stats -->
          <a routerLink="/admin/dashboard" 
             routerLinkActive="bottom-tab-active" 
             [routerLinkActiveOptions]="{exact: true}"
             class="flex flex-col items-center justify-center gap-0.5 py-1 px-1 text-slate-400 no-underline transition-all active:scale-95 flex-1 min-w-0">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span class="text-[9px] font-semibold tracking-tight truncate max-w-full">Stats</span>
          </a>

          <!-- Tab 2: Produits -->
          <a routerLink="/admin/products" 
             routerLinkActive="bottom-tab-active" 
             class="flex flex-col items-center justify-center gap-0.5 py-1 px-1 text-slate-400 no-underline transition-all active:scale-95 flex-1 min-w-0">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <span class="text-[9px] font-semibold tracking-tight truncate max-w-full">Produits</span>
          </a>

          <!-- Tab 3: Commandes -->
          <a routerLink="/admin/orders" 
             routerLinkActive="bottom-tab-active" 
             class="flex flex-col items-center justify-center gap-0.5 py-1 px-1 text-slate-400 no-underline transition-all active:scale-95 flex-1 min-w-0">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span class="text-[9px] font-semibold tracking-tight truncate max-w-full">Commandes</span>
          </a>

          <!-- Tab 4: Boutiques -->
          <a routerLink="/admin/stores" 
             routerLinkActive="bottom-tab-active" 
             class="flex flex-col items-center justify-center gap-0.5 py-1 px-1 text-slate-400 no-underline transition-all active:scale-95 flex-1 min-w-0">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span class="text-[9px] font-semibold tracking-tight truncate max-w-full">Boutiques</span>
          </a>

          <!-- Tab 5: Catégories -->
          <a routerLink="/admin/categories" 
             routerLinkActive="bottom-tab-active" 
             class="flex flex-col items-center justify-center gap-0.5 py-1 px-1 text-slate-400 no-underline transition-all active:scale-95 flex-1 min-w-0">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <span class="text-[9px] font-semibold tracking-tight truncate max-w-full">Catégories</span>
          </a>

          <!-- Tab 6: Utilisateurs -->
          <a routerLink="/admin/users" 
             routerLinkActive="bottom-tab-active" 
             class="flex flex-col items-center justify-center gap-0.5 py-1 px-1 text-slate-400 no-underline transition-all active:scale-95 flex-1 min-w-0">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span class="text-[9px] font-semibold tracking-tight truncate max-w-full">Usagers</span>
          </a>

        </nav>

      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  isDesktopCollapsed = signal(false);

  authService = inject(AuthService);
  lang = inject(LanguageService);
  router = inject(Router);

  initials = computed(() => {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SA';
  });

  firstName = computed(() => {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ')[0] || 'Admin';
  });

  toggleDesktopSidebar() {
    this.isDesktopCollapsed.update(val => !val);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

