import { Component, signal, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  styles: [':host { display: block; min-height: 100vh; }'],

  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden" dir="ltr">
      <!-- Sidebar -->
      <aside [ngClass]="isSidebarOpen() ? 'w-72 translate-x-0' : 'w-0 -translate-x-full'" 
        class="bg-gray-900 text-white flex-shrink-0 flex flex-col shadow-2xl relative z-30 transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-800">
        
        <div class="px-8 py-8 flex items-center justify-between">
          <a routerLink="/admin/dashboard" class="flex items-center gap-4 no-underline group">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/30 rotate-3 group-hover:rotate-0 transition-all duration-500">Y</div>
            <div>
              <p class="font-black text-lg tracking-tight text-white m-0 leading-none group-hover:text-primary-light transition-colors">YamiShop</p>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Dashboard Admin</p>
            </div>
          </a>
          
          <button (click)="toggleSidebar()" class="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white border-none cursor-pointer transition-colors flex items-center justify-center" title="Fermer le menu">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav class="flex-1 py-4 overflow-y-auto px-4 custom-scrollbar">
          <div class="space-y-6">
            <div>
              <p class="px-4 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">Gestion</p>
              <div class="space-y-1.5">
                <a routerLink="/admin/dashboard" routerLinkActive="bg-gray-800 text-white shadow-inner border-l-4 border-primary"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all no-underline border-l-4 border-transparent">
                  <svg class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  {{ lang.translate('admin.stats', 'fr') }}
                </a>
                <a routerLink="/admin/products" routerLinkActive="bg-gray-800 text-white shadow-inner border-l-4 border-primary"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all no-underline border-l-4 border-transparent">
                  <svg class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  {{ lang.translate('admin.catalog', 'fr') }}
                </a>
                <a routerLink="/admin/orders" routerLinkActive="bg-gray-800 text-white shadow-inner border-l-4 border-primary"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all no-underline border-l-4 border-transparent">
                  <svg class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  {{ lang.translate('admin.orders', 'fr') }}
                </a>
                <a routerLink="/admin/users" routerLinkActive="bg-gray-800 text-white shadow-inner border-l-4 border-primary"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all no-underline border-l-4 border-transparent">
                  <svg class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Utilisateurs
                </a>
              </div>
            </div>
            <div>
              <p class="px-4 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">Système</p>
              <div class="space-y-1.5">
                 <a routerLink="/admin/settings" routerLinkActive="bg-gray-800 text-white shadow-inner border-l-4 border-primary"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all no-underline border-l-4 border-transparent">
                  <svg class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {{ lang.translate('admin.settings', 'fr') }}
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
             <h1 class="font-extrabold text-gray-900 text-lg tracking-tight hidden sm:block bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">{{ lang.translate('admin.control_panel', 'fr') }}</h1>
          </div>
          
          <div class="flex items-center gap-5">
            <button class="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all bg-transparent border-none cursor-pointer">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </button>
            <div class="h-8 w-px bg-gray-200"></div>
            <div class="flex items-center gap-3">
              <div class="hidden sm:block text-right">
                <p class="text-sm font-bold text-gray-900 leading-none">{{ firstName() }}</p>
                <p class="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Super Admin</p>
              </div>
              <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-light text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md ring-2 ring-white">{{ initials() }}</div>
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
export class AdminLayoutComponent {
  isSidebarOpen = signal(true);
  authService = inject(AuthService);
  lang = inject(LanguageService);
  router = inject(Router);

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
