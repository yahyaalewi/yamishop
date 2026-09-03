import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreService, Store, StoreStats } from '../../services/store.service';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-8">
      
      <!-- Store Header Banner -->
      <div class="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        
        <div class="flex items-center gap-5 relative z-10">
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

        <div class="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end">
          <a routerLink="/store-admin/products" class="px-5 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 no-underline flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Ajouter un produit
          </a>
          <a routerLink="/store-admin/orders" class="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/20 no-underline flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            Mes commandes
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
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Produits en Vente</p>
              <p class="text-3xl font-black text-gray-900 mt-2">{{ stats()!.totalProducts }}</p>
              <a routerLink="/store-admin/products" class="text-xs font-bold text-primary hover:underline no-underline mt-2 inline-block">Gérer le stock →</a>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black shrink-0">📦</div>
          </div>

          <!-- Commandes Card -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Commandes</p>
              <p class="text-3xl font-black text-gray-900 mt-2">{{ stats()!.totalOrders }}</p>
              <a routerLink="/store-admin/orders" class="text-xs font-bold text-primary hover:underline no-underline mt-2 inline-block">Voir les commandes →</a>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-black shrink-0">🛒</div>
          </div>

          <!-- Revenue Card -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chiffre d'Affaires</p>
              <p class="text-3xl font-black text-emerald-600 mt-2">{{ stats()!.revenue | number:'1.0-0' }} <span class="text-sm font-bold">MRU</span></p>
              <p class="text-[10px] text-gray-400 mt-2 font-medium">Revenu cumulé de la boutique</p>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-black shrink-0">💰</div>
          </div>

          <!-- Clients Card -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clients Uniques</p>
              <p class="text-3xl font-black text-gray-900 mt-2">{{ stats()!.totalCustomers }}</p>
              <p class="text-[10px] text-gray-400 mt-2 font-medium">Acheteurs enregistrés</p>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-black shrink-0">👥</div>
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
          <h3 class="text-lg font-bold text-gray-900 mb-4">Produits les Plus Vendus</h3>
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
    </div>
  `
})
export class StoreDashboardComponent implements OnInit {
  private storeService = inject(StoreService);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);

  store = signal<Store | null>(null);
  stats = signal<StoreStats | null>(null);
  loading = signal<boolean>(true);

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
}
