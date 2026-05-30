import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/ui/card.component';
import { OrderService, Order } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="space-y-8 animate-fade-in pb-12 font-inter">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div class="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-3">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            En direct
          </div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Tableau de Bord</h1>
          <p class="text-gray-500 mt-2 font-medium">Analysez les performances et la croissance de YamiShop.</p>
        </div>
        <div class="relative z-10 flex gap-3">
          <button class="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Exporter
          </button>
        </div>
      </div>

      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6">
        
        <!-- Revenus -->
        <div class="xl:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div class="flex items-start justify-between relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center shadow-inner">
               <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div class="relative z-10 mt-4">
            <p class="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Revenus Total</p>
            <p class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ revenue() | number }} <span class="text-base text-primary font-bold">MRU</span></p>
          </div>
        </div>

        <!-- Panier Moyen -->
        <div class="xl:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-sage/10 rounded-full blur-2xl group-hover:bg-sage/20 transition-colors"></div>
          <div class="flex items-start justify-between relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage/30 to-sage/10 text-sage-dark flex items-center justify-center shadow-inner">
               <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
          <div class="relative z-10 mt-4">
            <p class="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Panier Moyen</p>
            <p class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ averageOrderValue() | number:'1.0-0' }} <span class="text-base text-sage-dark font-bold">MRU</span></p>
          </div>
        </div>

        <!-- En Attente -->
        <div class="xl:col-span-1 bg-white p-6 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl group-hover:bg-yellow-400/20 transition-colors"></div>
          <div class="relative z-10">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300/30 to-yellow-300/10 text-yellow-600 flex items-center justify-center shadow-inner mb-4">
               <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">En Attente</p>
            <p class="text-2xl font-extrabold text-gray-900 tracking-tight">{{ pendingOrdersCount() }}</p>
          </div>
        </div>

        <!-- Confirmées -->
        <div class="xl:col-span-1 bg-white p-6 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-terracotta/5 rounded-full blur-2xl group-hover:bg-terracotta/10 transition-colors"></div>
          <div class="relative z-10">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta/20 to-terracotta/5 text-terracotta flex items-center justify-center shadow-inner mb-4">
               <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Confirmées</p>
            <p class="text-2xl font-extrabold text-gray-900 tracking-tight">{{ confirmedOrdersCount() }} <span class="text-sm text-gray-400 font-medium">/ {{ orders().length }}</span></p>
          </div>
        </div>

      </div>

      <!-- Secondary KPIs Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-6">
         <!-- Ce Mois -->
         <div class="bg-white p-5 rounded-[1.5rem] border border-gray-100/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-4 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p class="text-[11px] font-black uppercase tracking-widest text-gray-400">Ce Mois-ci</p>
              <p class="text-xl font-extrabold text-gray-900">{{ monthOrdersCount() }} <span class="text-sm font-medium text-gray-500">commandes</span></p>
            </div>
         </div>
         <!-- Clients -->
         <div class="bg-white p-5 rounded-[1.5rem] border border-gray-100/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-4 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 rounded-full bg-terracotta/5 text-terracotta flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <p class="text-[11px] font-black uppercase tracking-widest text-gray-400">Clients Uniques</p>
              <p class="text-xl font-extrabold text-gray-900">{{ uniqueClients() }} <span class="text-sm font-medium text-gray-500">personnes</span></p>
            </div>
         </div>
      </div>

      <!-- Graph & Top Products Row -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <!-- Graph -->
        <div class="xl:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[480px] flex flex-col relative overflow-hidden group">
          <div class="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 relative z-10 gap-4">
            <div>
              <h2 class="text-xl font-extrabold text-gray-900 flex items-center gap-3">
                <span class="w-1.5 h-6 bg-primary rounded-full"></span>
                Performance (7 Jours)
              </h2>
              <p class="text-sm text-gray-500 mt-1 pl-4">Évolution quotidienne des ventes confirmées</p>
            </div>
            <div class="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 text-right shrink-0">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Période</p>
              <p class="text-xl font-extrabold text-primary">{{ recentChartTotal() | number }} <span class="text-sm">MRU</span></p>
            </div>
          </div>

          <div class="flex-grow flex items-end gap-3 md:gap-6 relative z-10 pb-2">
            <!-- Grid Lines -->
            <div class="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none opacity-30">
               <div class="w-full border-b border-gray-200 border-dashed flex-1"></div>
               <div class="w-full border-b border-gray-200 border-dashed flex-1"></div>
               <div class="w-full border-b border-gray-200 border-dashed flex-1"></div>
               <div class="w-full border-b border-gray-200 border-solid flex-1"></div>
            </div>

            <!-- Bars -->
            <div *ngFor="let col of recentChartData()" class="flex-1 flex flex-col items-center justify-end h-full gap-3 group/bar relative z-10">
              <!-- Tooltip -->
              <div class="opacity-0 group-hover/bar:opacity-100 transition-all duration-300 bg-gray-900 text-white text-[11px] font-bold px-3 py-2 rounded-xl mb-2 whitespace-nowrap shadow-xl absolute bottom-[100%] z-20 pointer-events-none translate-y-2 group-hover/bar:translate-y-0 flex flex-col items-center">
                <span>{{ col.revenue | number }} MRU</span>
                <div class="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1"></div>
              </div>
              
              <div class="w-full max-w-[3.5rem] relative flex items-end h-full rounded-t-xl overflow-hidden bg-transparent">
                 <div class="w-full bg-gradient-to-t from-primary to-primary-light rounded-t-xl hover:opacity-90 transition-all duration-500 relative shadow-[0_4px_15px_rgba(15,77,92,0.2)] group-hover/bar:from-primary-light group-hover/bar:to-primary"
                      [style.height]="col.heightPercentage">
                    <div class="absolute inset-x-0 top-0 h-1.5 bg-white/30 rounded-t-xl"></div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Axis Labels -->
          <div class="flex justify-between items-center px-0 pt-4 relative z-10 border-t border-gray-100">
            <div *ngFor="let col of recentChartData()" class="flex-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {{col.label}}
            </div>
          </div>
        </div>

        <!-- Top Selling Products -->
        <div class="xl:col-span-1 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[480px] relative overflow-hidden">
          <div class="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-terracotta/5 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <h2 class="text-xl font-extrabold text-gray-900 flex items-center gap-3 mb-6 relative z-10">
            <span class="w-1.5 h-6 bg-terracotta rounded-full"></span>
            Top Produits
          </h2>
          
          <div class="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar relative z-10">
             <div *ngFor="let prod of topProducts(); let i = index" class="flex items-center gap-4 bg-white border border-gray-100 p-3 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm hover:shadow">
                <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                  <div class="absolute top-0 left-0 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-extrabold w-6 h-6 flex items-center justify-center rounded-br-xl z-10">
                    #{{i + 1}}
                  </div>
                  <img [src]="prod.image" class="w-full h-full object-cover transition-transform hover:scale-110 duration-500">
                </div>
                <div class="min-w-0 flex-grow">
                  <p class="text-sm font-bold text-gray-900 truncate" [title]="prod.name">{{prod.name}}</p>
                  <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                    <svg class="w-3 h-3 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    {{prod.qty}} ventes
                  </p>
                </div>
                <div class="text-right shrink-0 bg-gray-50 px-2 py-1.5 rounded-xl">
                  <p class="text-sm font-black text-terracotta">{{(prod.rev / 1000).toFixed(1)}}k</p>
                  <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest">MRU</p>
                </div>
             </div>

             <!-- Empty state -->
             <div *ngIf="topProducts().length === 0" class="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                 <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                   <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                 </div>
                 <p class="text-sm font-medium">Pas de données disponibles</p>
             </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders List -->
      <div class="mt-8 bg-white rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div class="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-xl font-extrabold text-gray-900 flex items-center gap-3">
            <span class="w-1.5 h-6 bg-gray-900 rounded-full"></span>
            Commandes Récentes
          </h2>
          <button class="text-primary text-sm font-bold hover:underline">Voir tout</button>
        </div>
        
        <div class="overflow-x-auto" *ngIf="orders().length > 0; else noOrders">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-gray-50/80 text-gray-500 font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
              <tr>
                <th class="px-6 py-4">ID Commande</th>
                <th class="px-6 py-4">Client</th>
                <th class="px-6 py-4 text-center">Date & Heure</th>
                <th class="px-6 py-4 text-center">Montant Total</th>
                <th class="px-6 py-4 text-center">Statut</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let order of orders().slice(0, 8)" class="hover:bg-gray-50/50 transition-colors group">
                <td class="px-6 py-5 font-black text-gray-900">#{{order._id.substring(order._id.length-6).toUpperCase()}}</td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {{ (order.user?.name || 'C').charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-bold text-gray-900">{{order.user?.name || 'Client Supprimé'}}</span>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <div class="flex flex-col">
                    <span class="font-bold text-gray-900">{{order.createdAt | date:'shortDate'}}</span>
                    <span class="text-[10px] text-gray-500 font-medium">{{order.createdAt | date:'shortTime'}}</span>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <span class="font-black text-primary text-base">{{order.totalPrice | number}} <span class="text-xs text-gray-400">MRU</span></span>
                </td>
                <td class="px-6 py-5 text-center">
                  <span [class]="getStatusClass(order)" class="py-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full" [class.bg-sage]="order.isConfirmed" [class.bg-yellow-500]="!order.isConfirmed" [class.animate-pulse]="!order.isConfirmed"></div>
                    {{ order.isConfirmed ? 'Confirmée' : 'En Attente' }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button *ngIf="!order.isConfirmed" 
                      (click)="confirmOrder(order._id)"
                      title="Confirmer"
                      class="text-sage-dark hover:text-white hover:bg-sage font-bold bg-sage/10 p-2 rounded-xl cursor-pointer transition-all active:scale-95">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button (click)="deleteOrder(order._id)"
                      title="Supprimer"
                      class="text-terracotta hover:text-white hover:bg-terracotta font-bold bg-terracotta/10 p-2 rounded-xl cursor-pointer transition-all active:scale-95">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noOrders>
          <div class="py-20 text-center flex flex-col items-center bg-gray-50/50">
            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
               <svg class="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p class="font-bold text-gray-900 text-lg">Aucune commande</p>
            <p class="text-gray-500 text-sm mt-1">Les nouvelles commandes apparaîtront ici.</p>
          </div>
        </ng-template>
      </div>
      
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  orderService = inject(OrderService);
  productService = inject(ProductService);

  orders = signal<Order[]>([]);

  // Top KPIs
  confirmedOrdersCount = computed(() => this.orders().filter(o => o.isConfirmed).length);
  pendingOrdersCount = computed(() => this.orders().filter(o => !o.isConfirmed).length);

  revenue = computed(() => 
    this.orders()
      .filter(o => o.isConfirmed)
      .reduce((sum, o) => sum + o.totalPrice, 0)
  );

  averageOrderValue = computed(() => {
    const count = this.confirmedOrdersCount();
    return count > 0 ? this.revenue() / count : 0;
  });

  monthOrdersCount = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return this.orders().filter(o => {
      const d = new Date(o.createdAt);
      return o.isConfirmed && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  });

  uniqueClients = computed(() => {
    const clients = new Set(this.orders().map(o => o.user?._id).filter(id => !!id));
    return clients.size;
  });

  // Chart Data (Last 7 Days)
  recentChartData = computed(() => {
    const data: {date: Date, label: string, revenue: number, heightPercentage: string}[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for(let i=6; i>=0; i--) {
      const d = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      data.push({ 
        date: d, 
        label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        revenue: 0,
        heightPercentage: '0%'
      });
    }

    const confirmedOrders = this.orders().filter(o => o.isConfirmed);
    confirmedOrders.forEach(o => {
      const d = new Date(o.createdAt);
      d.setHours(0,0,0,0);
      const diffTime = Math.abs(today.getTime() - d.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if(diffDays <= 6) {
        const idx = 6 - diffDays;
        if(data[idx]) data[idx].revenue += o.totalPrice;
      }
    });

    const maxRev = Math.max(...data.map(d => d.revenue), 100);
    return data.map(d => ({
       ...d,
       heightPercentage: Math.max(5, Math.min(100, Math.round((d.revenue / maxRev) * 100))) + '%'
    }));
  });

  recentChartTotal = computed(() => {
    return this.recentChartData().reduce((sum, item) => sum + item.revenue, 0);
  });

  // Top 5 Products
  topProducts = computed(() => {
    const productStats = new Map<string, {name: string, image: string, qty: number, rev: number}>();
    
    this.orders().filter(o => o.isConfirmed).forEach(o => {
      o.orderItems.forEach(item => {
        const id = item.product || item.name;
        const qty = item.qty || item.quantity || 1;
        const rev = item.price * qty;
        
        if(productStats.has(id)) {
           const stat = productStats.get(id)!;
           stat.qty += qty;
           stat.rev += rev;
        } else {
           const imgUrl = item.image ? this.productService.getImageUrl(item.image) : '';
           productStats.set(id, { name: item.name, image: imgUrl, qty, rev });
        }
      });
    });

    return Array.from(productStats.values())
      .sort((a,b) => b.qty - a.qty)
      .slice(0, 5);
  });

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        // Sort by createdAt descending
        this.orders.set(data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      error: (err) => console.error('Failed to load orders', err)
    });
  }

  confirmOrder(id: string) {
    if (confirm('Confirmer cette commande ? Elle sera ajoutée aux statistiques et comptée comme chiffre d\'affaires.')) {
      this.orderService.confirmOrder(id).subscribe({
        next: () => this.loadOrders(),
        error: (err) => alert('Erreur lors de la confirmation.')
      });
    }
  }

  deleteOrder(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible et retirera le montant des analyses.')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => this.loadOrders(),
        error: (err) => alert('Erreur lors de la suppression.')
      });
    }
  }

  getStatusClass(order: Order) {
    if (order.isConfirmed) return 'bg-sage/10 text-sage-dark border border-sage/20';
    return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
  }
}
