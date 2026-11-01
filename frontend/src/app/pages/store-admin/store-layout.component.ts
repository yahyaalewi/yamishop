import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { StoreService, Store } from '../../services/store.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-store-layout',
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
          <a routerLink="/store-admin/dashboard" class="flex items-center gap-3 no-underline group min-w-0">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/25 shrink-0 group-hover:scale-105 transition-transform">
              🏪
            </div>
            <div *ngIf="!isDesktopCollapsed()" class="min-w-0 flex-1">
              <p class="font-extrabold text-sm tracking-tight text-white m-0 leading-tight truncate group-hover:text-emerald-400 transition-colors">
                {{ storeName() }}
              </p>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Espace Boutique</span>
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
          <div>
            <p *ngIf="!isDesktopCollapsed()" class="px-3 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Gestion</p>
            <div class="space-y-1.5">
              
              <!-- Dashboard -->
              <a routerLink="/store-admin/dashboard" 
                 routerLinkActive="nav-item-active" 
                 [routerLinkActiveOptions]="{exact: true}"
                 class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all no-underline group"
                 [title]="'Tableau de bord'">
                <svg class="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span *ngIf="!isDesktopCollapsed()" class="truncate">Tableau de bord</span>
              </a>

              <!-- Products -->
              <a routerLink="/store-admin/products" 
                 routerLinkActive="nav-item-active"
                 class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all no-underline group"
                 [title]="'Produits & Stock'">
                <svg class="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <span *ngIf="!isDesktopCollapsed()" class="truncate">Produits & Stock</span>
              </a>

              <!-- Orders -->
              <a routerLink="/store-admin/orders" 
                 routerLinkActive="nav-item-active"
                 class="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all no-underline group"
                 [title]="'Commandes'">
                <svg class="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span *ngIf="!isDesktopCollapsed()" class="truncate">Commandes</span>
              </a>

            </div>
          </div>

          <!-- Store public page shortcut -->
          <div *ngIf="store()?._id">
            <p *ngIf="!isDesktopCollapsed()" class="px-3 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Visite client</p>
            <a [routerLink]="['/store', store()?._id]" 
               target="_blank"
               class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 hover:bg-emerald-900/40 transition-all no-underline group">
              <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              <span *ngIf="!isDesktopCollapsed()" class="truncate">Voir ma boutique en ligne</span>
            </a>
          </div>
        </nav>

        <!-- Sidebar User Footer -->
        <div class="p-3 border-t border-slate-800 bg-slate-950/40">
          <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/40">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                {{ initials() }}
              </div>
              <div *ngIf="!isDesktopCollapsed()" class="min-w-0 flex-1">
                <p class="text-xs font-bold text-white truncate m-0 leading-tight">{{ firstName() }}</p>
                <p class="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Admin Boutique</p>
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
          
          <!-- Store Brand & Identity -->
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-base shrink-0 lg:hidden shadow-xs">
              🏪
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h1 class="text-sm sm:text-base font-extrabold text-slate-900 m-0 truncate leading-tight">
                  {{ storeName() }}
                </h1>
                <span class="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider shrink-0 lg:hidden">
                  Admin
                </span>
              </div>
              <p class="text-[10px] text-slate-400 font-semibold m-0 hidden sm:block">Panneau d'administration de la boutique</p>
            </div>
          </div>

          <!-- Topbar Actions -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <!-- Store Live Preview Link (laptop/tablet) -->
            <a *ngIf="store()?._id" 
               [routerLink]="['/store', store()?._id]" 
               target="_blank"
               class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors no-underline">
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span class="hidden xs:inline">Voir boutique</span>
            </a>

            <!-- Quick Add Product Action -->
            <a routerLink="/store-admin/products" 
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
            <div class="hidden lg:flex w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xs items-center justify-center shadow-sm">
              {{ initials() }}
            </div>
          </div>
        </header>

        <!-- Dynamic Page Content -->
        <main class="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-10 custom-scrollbar overflow-x-hidden">
          <router-outlet></router-outlet>
        </main>

        <!-- Mobile Bottom Navigation Bar (Visible only on mobile devices < 1024px) -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around">
          
          <!-- Tab 1: Dashboard -->
          <a routerLink="/store-admin/dashboard" 
             routerLinkActive="bottom-tab-active" 
             [routerLinkActiveOptions]="{exact: true}"
             class="flex flex-col items-center justify-center gap-1 py-1 px-3 text-slate-400 no-underline transition-all active:scale-95 flex-1 min-w-0">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span class="text-[10px] tracking-tight truncate">Accueil</span>
          </a>

          <!-- Tab 2: Products -->
          <a routerLink="/store-admin/products" 
             routerLinkActive="bottom-tab-active" 
             class="flex flex-col items-center justify-center gap-1 py-1 px-3 text-slate-400 no-underline transition-all active:scale-95 flex-1 min-w-0">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <span class="text-[10px] tracking-tight truncate">Produits</span>
          </a>

          <!-- Tab 3: Orders -->
          <a routerLink="/store-admin/orders" 
             routerLinkActive="bottom-tab-active" 
             class="flex flex-col items-center justify-center gap-1 py-1 px-3 text-slate-400 no-underline transition-all active:scale-95 flex-1 min-w-0">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span class="text-[10px] tracking-tight truncate">Commandes</span>
          </a>

          <!-- Tab 4: Store Public View -->
          <a *ngIf="store()?._id" 
             [routerLink]="['/store', store()?._id]" 
             target="_blank"
             class="flex flex-col items-center justify-center gap-1 py-1 px-3 text-emerald-600 no-underline transition-all active:scale-95 flex-1 min-w-0">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span class="text-[10px] font-bold tracking-tight truncate">Boutique</span>
          </a>

          <!-- Tab 5: Logout Action -->
          <button (click)="logout()" 
                  class="flex flex-col items-center justify-center gap-1 py-1 px-3 text-slate-400 hover:text-red-500 border-none bg-transparent cursor-pointer transition-all active:scale-95 flex-1 min-w-0"
                  title="Déconnexion">
            <svg class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            <span class="text-[10px] tracking-tight truncate">Quitter</span>
          </button>

        </nav>

      </div>
    </div>
  `
})
export class StoreAdminLayoutComponent implements OnInit {
  isDesktopCollapsed = signal(false);

  authService = inject(AuthService);
  storeService = inject(StoreService);
  lang = inject(LanguageService);
  router = inject(Router);

  store = signal<Store | null>(null);

  ngOnInit() {
    this.storeService.getMyStore().subscribe({
      next: (st) => this.store.set(st),
      error: () => {}
    });
  }

  storeName = computed(() => this.store()?.name || 'Boutique');

  initials = computed(() => {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
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

