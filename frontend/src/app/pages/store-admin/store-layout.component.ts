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
  styles: [':host { display: block; min-height: 100vh; }'],

  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden" dir="ltr">
      <!-- Sidebar -->
      <aside [ngClass]="isSidebarOpen() ? 'w-72 translate-x-0' : 'w-0 -translate-x-full'" 
        class="bg-gray-900 text-white flex-shrink-0 flex flex-col shadow-2xl relative z-30 transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-800">
        
        <div class="px-8 py-8 flex items-center justify-between">
          <a routerLink="/store-admin/dashboard" class="flex items-center gap-3 no-underline group min-w-0">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/30 rotate-3 group-hover:rotate-0 transition-all duration-500 shrink-0">
              🏪
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-black text-base tracking-tight text-white m-0 leading-none group-hover:text-primary-light transition-colors truncate">
                {{ storeName() }}
              </p>
              <p class="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Espace Boutique</p>
            </div>
          </a>
          
          <button (click)="toggleSidebar()" class="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white border-none cursor-pointer transition-colors flex items-center justify-center shrink-0" title="Fermer le menu">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav class="flex-1 py-4 overflow-y-auto px-4 custom-scrollbar">
          <div class="space-y-6">
            <div>
              <p class="px-4 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">Gestion Boutique</p>
              <div class="space-y-1.5">
                <a routerLink="/store-admin/dashboard" routerLinkActive="bg-gray-800 text-white shadow-inner border-l-4 border-primary"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all no-underline border-l-4 border-transparent">
                  <svg class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  Tableau de bord
                </a>
                <a routerLink="/store-admin/products" routerLinkActive="bg-gray-800 text-white shadow-inner border-l-4 border-primary"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all no-underline border-l-4 border-transparent">
                  <svg class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  Mes Produits & Stock
                </a>
                <a routerLink="/store-admin/orders" routerLinkActive="bg-gray-800 text-white shadow-inner border-l-4 border-primary"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all no-underline border-l-4 border-transparent">
                  <svg class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Mes Commandes
                </a>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden bg-gray-50/50 relative z-10">
        <!-- Topbar -->
        <header class="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-8 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.02)] sticky top-0 z-20">
          <div class="flex items-center gap-4">
             <button (click)="toggleSidebar()" class="p-2 border border-gray-100 bg-white hover:bg-gray-50 rounded-xl cursor-pointer text-gray-600 transition-all shadow-sm active:scale-95">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
             </button>
             <h1 class="font-extrabold text-gray-900 text-lg tracking-tight hidden sm:block bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Espace Admin — {{ storeName() }}</h1>
          </div>
          
          <div class="flex items-center gap-5">
            <div class="flex items-center gap-3">
              <div class="hidden sm:block text-right">
                <p class="text-sm font-bold text-gray-900 leading-none">{{ firstName() }}</p>
                <p class="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Admin Boutique</p>
              </div>
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md ring-2 ring-white">{{ initials() }}</div>
            </div>
            <div class="h-8 w-px bg-gray-200"></div>
            <button (click)="logout()" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all bg-transparent border-none cursor-pointer" title="Déconnexion">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto p-8 custom-scrollbar">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `

})
export class StoreAdminLayoutComponent implements OnInit {
  isSidebarOpen = signal(true);
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
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  });

  firstName = computed(() => {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ')[0];
  });

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
