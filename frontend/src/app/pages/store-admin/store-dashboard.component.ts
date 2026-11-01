import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { StoreService, Store, StoreStats } from '../../services/store.service';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-5 sm:space-y-8 max-w-7xl mx-auto">

      <!-- Store Header Banner -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div class="absolute right-0 top-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Top row: store info + admin profile -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div class="flex items-center gap-3.5 sm:gap-5 min-w-0">
            <div class="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden shrink-0 flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-lg">
              <img *ngIf="store()?.logo" [src]="getImageUrl(store()!.logo!)" [alt]="store()?.name" class="w-full h-full object-cover">
              <span *ngIf="!store()?.logo">{{ store()?.name?.charAt(0)?.toUpperCase() || '🏪' }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 mb-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Boutique En Ligne</span>
              </div>
              <h1 class="text-xl sm:text-3xl font-black tracking-tight text-white m-0 truncate">{{ store()?.name || 'Ma Boutique' }}</h1>
              <p class="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">{{ store()?.description || 'Gestion du catalogue, du stock et des commandes.' }}</p>
            </div>
          </div>

          <!-- Store preview button on mobile / admin badge -->
          <div class="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t border-white/10 sm:border-0">
            <a *ngIf="store()?._id" 
               [routerLink]="['/store', store()?._id]" 
               target="_blank"
               class="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold no-underline flex items-center gap-1.5 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span>Voir la boutique</span>
            </a>

            <button (click)="logout()"
              class="p-2 sm:p-2.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white rounded-xl border border-red-500/30 transition-all cursor-pointer"
              title="Se déconnecter">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Quick Action Buttons (2 cols on mobile, flex row on tablet/desktop) -->
        <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 mt-5 pt-5 border-t border-white/10 relative z-10">
          <a routerLink="/store-admin/products"
            class="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-light transition-all shadow-md shadow-primary/30 no-underline flex items-center justify-center gap-2 text-center active:scale-95">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            <span>+ Produit</span>
          </a>
          <a routerLink="/store-admin/orders"
            class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/15 no-underline flex items-center justify-center gap-2 text-center active:scale-95">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <span>Commandes</span>
          </a>
          <a routerLink="/store-admin/products"
            class="col-span-2 sm:col-span-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/15 no-underline flex items-center justify-center gap-2 text-center active:scale-95">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <span>Gérer les stocks</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>

      <div *ngIf="!loading() && stats()" class="space-y-6 sm:space-y-8">

        <!-- KPI Cards Grid (2 cols on mobile, 4 on desktop) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">

          <!-- Chiffre d'Affaires Card (Featured on mobile) -->
          <div class="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all flex items-center justify-between group">
            <div>
              <p class="text-[9px] sm:text-[10px] font-black text-emerald-100 uppercase tracking-widest">Chiffre d'Affaires</p>
              <p class="text-2xl sm:text-3xl font-black text-white mt-1.5">{{ stats()!.revenue | number:'1.0-0' }} <span class="text-xs font-bold text-emerald-200">MRU</span></p>
              <p class="text-[10px] text-emerald-100/80 mt-1 font-medium">Revenu total validé</p>
            </div>
            <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center text-xl sm:text-2xl font-black shrink-0 shadow-inner">💰</div>
          </div>

          <!-- Total Commandes -->
          <div class="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
            <div class="min-w-0">
              <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Commandes</p>
              <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5">{{ stats()!.totalOrders }}</p>
              <a routerLink="/store-admin/orders" class="text-xs font-bold text-primary hover:underline no-underline mt-1 inline-block">Voir →</a>
            </div>
            <div class="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg sm:text-2xl font-black shrink-0">🛒</div>
          </div>

          <!-- Produits en Vente -->
          <div class="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
            <div class="min-w-0">
              <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Produits</p>
              <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5">{{ stats()!.totalProducts }}</p>
              <a routerLink="/store-admin/products" class="text-xs font-bold text-primary hover:underline no-underline mt-1 inline-block">Stock →</a>
            </div>
            <div class="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg sm:text-2xl font-black shrink-0">📦</div>
          </div>

          <!-- Clients Uniques -->
          <div class="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
            <div class="min-w-0">
              <p class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Clients</p>
              <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5">{{ stats()!.totalCustomers }}</p>
              <p class="text-[10px] text-slate-400 mt-1 font-medium">Acheteurs</p>
            </div>
            <div class="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg sm:text-2xl font-black shrink-0">👥</div>
          </div>

        </div>

        <!-- Orders Status Breakdown -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
          <!-- Pending Orders Card -->
          <div class="bg-white rounded-2xl p-4 sm:p-6 border border-orange-200/70 shadow-xs flex items-center gap-4 sm:gap-5 bg-gradient-to-r from-orange-50/50 to-white">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl sm:text-2xl shrink-0">⏳</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] sm:text-xs font-black uppercase text-slate-500 tracking-wider">Commandes en attente</span>
                <span class="text-xl sm:text-2xl font-black text-orange-600">{{ stats()!.pendingOrders }}</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">Nécessitent votre confirmation de livraison.</p>
              <a *ngIf="stats()!.pendingOrders > 0" routerLink="/store-admin/orders"
                class="text-xs font-bold text-orange-600 hover:underline no-underline mt-1.5 inline-flex items-center gap-1">
                <span>Traiter les commandes maintenant</span>
                <span>→</span>
              </a>
            </div>
          </div>

          <!-- Delivered Orders Card -->
          <div class="bg-white rounded-2xl p-4 sm:p-6 border border-teal-200/70 shadow-xs flex items-center gap-4 sm:gap-5 bg-gradient-to-r from-teal-50/50 to-white">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center text-xl sm:text-2xl shrink-0">✅</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] sm:text-xs font-black uppercase text-slate-500 tracking-wider">Commandes livrées</span>
                <span class="text-xl sm:text-2xl font-black text-teal-600">{{ stats()!.deliveredOrders }}</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">Remises avec succès aux clients acheteurs.</p>
            </div>
          </div>
        </div>

        <!-- Top Selling Products -->
        <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 m-0 flex items-center gap-2">
              <span>🔥</span>
              <span>Produits les Plus Vendus</span>
            </h3>
            <a routerLink="/store-admin/products" class="text-xs font-bold text-primary hover:underline no-underline">Voir tout →</a>
          </div>
          
          <div *ngIf="stats()!.topProducts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div *ngFor="let p of stats()!.topProducts; let i = index" class="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 flex items-center gap-3 transition-colors">
              <span class="w-7 h-7 rounded-lg bg-primary text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">{{ i + 1 }}</span>
              <img [src]="getImageUrl(p.imageUrl)" [alt]="p.name" class="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white">
              <div class="flex-1 min-w-0">
                <p class="text-xs sm:text-sm font-bold text-slate-900 truncate m-0">{{ p.name }}</p>
                <p class="text-xs font-black text-primary mt-0.5">{{ p.price | number }} MRU</p>
              </div>
            </div>
          </div>
          <p *ngIf="!stats()!.topProducts.length" class="text-xs sm:text-sm text-slate-400 py-6 text-center">Aucun produit vendu pour le moment.</p>
        </div>

      </div>

      <!-- Empty state if no stats -->
      <div *ngIf="!loading() && !stats()" class="text-center py-12 sm:py-16 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <div class="text-4xl mb-3">🏪</div>
        <h3 class="text-lg font-bold text-slate-800">Bienvenue dans votre espace boutique</h3>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">Votre boutique est active. Commencez dès maintenant à ajouter vos produits pour recevoir vos premières commandes.</p>
        <a routerLink="/store-admin/products" class="mt-4 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl no-underline inline-flex items-center gap-2 shadow-md">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Ajouter des produits
        </a>
      </div>

    </div>
  `
})
export class StoreDashboardComponent implements OnInit {
  private storeService = inject(StoreService);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  store = signal<Store | null>(null);
  stats = signal<StoreStats | null>(null);
  loading = signal<boolean>(true);

  adminName = computed(() => this.authService.currentUser()?.name || 'Administrateur');
  initials = computed(() => {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  });

  ngOnInit() {
    this.loadStoreData();
  }

  loadStoreData() {
    this.loading.set(true);
    this.storeService.getMyStore().subscribe({
      next: (st) => {
        this.store.set(st);
        this.storeService.getMyStoreStats().subscribe({
          next: (stStats) => {
            this.stats.set(stStats);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => {
        this.notificationService.show('Erreur lors du chargement de la boutique', 'error');
        this.loading.set(false);
      }
    });
  }

  getImageUrl(src: string): string {
    return this.productService.getImageUrl(src);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
