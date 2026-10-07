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
    <div class="p-6 max-w-7xl mx-auto space-y-8">

      <!-- Store Header Banner -->
      <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div class="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Top row: store name + admin info -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div class="flex items-center gap-5">
            <div class="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden shrink-0 flex items-center justify-center text-3xl font-black text-white shadow-lg">
              <img *ngIf="store()?.logo" [src]="getImageUrl(store()!.logo!)" [alt]="store()?.name" class="w-full h-full object-cover">
              <span *ngIf="!store()?.logo">{{ store()?.name?.charAt(0)?.toUpperCase() || '🏪' }}</span>
            </div>
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 mb-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Espace Administrateur de Boutique
              </div>
              <h1 class="text-3xl font-black tracking-tight text-white m-0">{{ store()?.name || 'Ma Boutique' }}</h1>
              <p class="text-xs text-gray-300 font-medium mt-1">{{ store()?.description || 'Gestion du catalogue, du stock et des commandes.' }}</p>
            </div>
          </div>

          <!-- Admin profile + logout -->
          <div class="flex items-center gap-3 shrink-0">
            <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                {{ initials() }}
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-bold text-white leading-none">{{ adminName() }}</p>
                <p class="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Admin Boutique</p>
              </div>
            </div>
            <button (click)="logout()"
              class="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white rounded-xl border border-red-500/30 transition-all cursor-pointer"
              title="Se déconnecter">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Quick action buttons -->
        <div class="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-white/10 relative z-10">
          <a routerLink="/store-admin/products"
            class="px-5 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 no-underline flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Ajouter un produit
          </a>
          <a routerLink="/store-admin/orders"
            class="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/20 no-underline flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            Voir les commandes
          </a>
          <a routerLink="/store-admin/products"
            class="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/20 no-underline flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            Gérer le stock
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <div *ngIf="!loading() && stats()" class="space-y-8">

        <!-- KPI Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <!-- Produits Card -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-between group">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Produits en Vente</p>
              <p class="text-3xl font-black text-gray-900 mt-2">{{ stats()!.totalProducts }}</p>
              <a routerLink="/store-admin/products" class="text-xs font-bold text-primary hover:underline no-underline mt-2 inline-block">Gérer le stock →</a>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black shrink-0 group-hover:scale-110 transition-transform">📦</div>
          </div>

          <!-- Commandes Card -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-between group">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Commandes</p>
              <p class="text-3xl font-black text-gray-900 mt-2">{{ stats()!.totalOrders }}</p>
              <a routerLink="/store-admin/orders" class="text-xs font-bold text-primary hover:underline no-underline mt-2 inline-block">Voir les commandes →</a>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-black shrink-0 group-hover:scale-110 transition-transform">🛒</div>
          </div>

          <!-- Revenue Card -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-between group">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chiffre d'Affaires</p>
              <p class="text-3xl font-black text-emerald-600 mt-2">{{ stats()!.revenue | number:'1.0-0' }} <span class="text-sm font-bold">MRU</span></p>
              <p class="text-[10px] text-gray-400 mt-2 font-medium">Revenu cumulé</p>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-black shrink-0 group-hover:scale-110 transition-transform">💰</div>
          </div>

          <!-- Clients Card -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-between group">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clients Uniques</p>
              <p class="text-3xl font-black text-gray-900 mt-2">{{ stats()!.totalCustomers }}</p>
              <p class="text-[10px] text-gray-400 mt-2 font-medium">Acheteurs enregistrés</p>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-black shrink-0 group-hover:scale-110 transition-transform">👥</div>
          </div>

        </div>

        <!-- Orders Status Breakdown -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl shrink-0">⏳</div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black uppercase text-gray-400 tracking-wider">Commandes en attente</span>
                <span class="text-2xl font-black text-orange-600">{{ stats()!.pendingOrders }}</span>
              </div>
              <p class="text-xs text-gray-400 mt-1">Commandes qui nécessitent une confirmation de livraison.</p>
              <a *ngIf="stats()!.pendingOrders > 0" routerLink="/store-admin/orders"
                class="text-xs font-bold text-orange-600 hover:underline no-underline mt-2 inline-block">
                Traiter maintenant →
              </a>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center text-2xl shrink-0">✅</div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black uppercase text-gray-400 tracking-wider">Commandes livrées</span>
                <span class="text-2xl font-black text-teal-600">{{ stats()!.deliveredOrders }}</span>
              </div>
              <p class="text-xs text-gray-400 mt-1">Commandes remises avec succès aux clients.</p>
            </div>
          </div>
        </div>

        <!-- Top Selling Products -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900 m-0">Produits les Plus Vendus</h3>
            <a routerLink="/store-admin/products" class="text-xs font-bold text-primary hover:underline no-underline">Voir tout →</a>
          </div>
          <div *ngIf="stats()!.topProducts?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let p of stats()!.topProducts; let i = index" class="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
              <span class="w-8 h-8 rounded-xl bg-primary text-white text-xs font-black flex items-center justify-center shrink-0 shadow-md">{{ i + 1 }}</span>
              <img [src]="getImageUrl(p.imageUrl)" [alt]="p.name" class="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-gray-900 truncate m-0">{{ p.name }}</p>
                <p class="text-xs font-black text-primary mt-0.5">{{ p.price | number }} MRU</p>
              </div>
            </div>
          </div>
          <p *ngIf="!stats()!.topProducts?.length" class="text-sm text-gray-400 py-4 text-center">Aucun produit vendu pour le moment.</p>
        </div>

      </div>

      <!-- Empty state if no stats -->
      <div *ngIf="!loading() && !stats()" class="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div class="text-4xl mb-4">🏪</div>
        <h3 class="text-lg font-bold text-gray-800">Bienvenue dans votre espace boutique</h3>
        <p class="text-sm text-gray-500 mt-1">Commencez par ajouter vos premiers produits.</p>
        <a routerLink="/store-admin/products" class="mt-4 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl no-underline inline-block">
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
