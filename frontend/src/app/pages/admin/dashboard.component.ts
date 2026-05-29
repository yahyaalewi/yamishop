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
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 font-inter">Tableau de Bord Analytique</h1>
          <p class="text-gray-500 mt-1">Vue d'ensemble des performances de votre boutique YamiShop</p>
        </div>
      </div>

      <!-- KPI Cards (Revenus, Commandes, Mois, Clients) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Revenus -->
        <div class="bg-white p-6 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div class="flex flex-col gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center shadow-inner">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Revenus Total Réalisé</p>
              <p class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ revenue() | number }} <span class="text-lg text-primary">MRU</span></p>
            </div>
          </div>
        </div>

        <!-- Commandes -->
        <div class="bg-white p-6 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-terracotta/5 rounded-full blur-2xl group-hover:bg-terracotta/10 transition-colors"></div>
          <div class="flex flex-col gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-terracotta/20 to-terracotta/5 text-terracotta flex items-center justify-center shadow-inner">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Ventes (Total)</p>
              <p class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ confirmedOrdersCount() }} <span class="text-lg text-gray-400 font-medium">/ {{ orders().length }}</span></p>
            </div>
          </div>
        </div>

        <!-- Ce Mois -->
        <div class="bg-white p-6 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-sage/10 rounded-full blur-2xl group-hover:bg-sage/20 transition-colors"></div>
          <div class="flex flex-col gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage/30 to-sage/10 text-sage-dark flex items-center justify-center shadow-inner">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Confirmation Mensuelle</p>
              <p class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ monthOrdersCount() }} <span class="text-lg text-sage-dark">cmdes</span></p>
            </div>
          </div>
        </div>

        <!-- Clients -->
        <div class="bg-white p-6 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl group-hover:bg-yellow-400/20 transition-colors"></div>
          <div class="flex flex-col gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-300/30 to-yellow-300/10 text-yellow-600 flex items-center justify-center shadow-inner">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Clients Uniques</p>
              <p class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ uniqueClients() }} <span class="text-lg text-yellow-600">personnes</span></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Graph & Top Products Row -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <!-- Graph -->
        <div class="xl:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 h-[450px] flex flex-col relative overflow-hidden">
          
          <div class="flex justify-between items-end mb-8 relative z-10">
            <div>
              <h2 class="text-lg font-bold text-gray-900 border-l-4 border-primary pl-3">Performance (7 Derniers Jours)</h2>
              <p class="text-sm text-gray-400 mt-1 pl-4">Évolution des ventes (commandes confirmées)</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Période</p>
              <p class="text-xl font-bold text-gray-900">{{ recentChartTotal() | number }} MRU</p>
            </div>
          </div>

          <div class="flex-grow flex items-end gap-2 md:gap-4 relative z-10 pb-6 border-b border-gray-100">
            <!-- Bars -->
            <div *ngFor="let col of recentChartData()" class="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
              <!-- Tooltip -->
              <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg mb-1 whitespace-nowrap shadow-lg absolute transform -translate-y-[120%] z-20 pointer-events-none">
                {{ col.revenue | number }} MRU
              </div>
              
              <div class="w-full max-w-[4rem] relative flex items-end h-full rounded-xl overflow-hidden bg-gray-50">
                 <div class="w-full bg-gradient-to-t from-primary to-primary-light rounded-xl hover:opacity-90 transition-all duration-500 relative shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
                      [style.height]="col.heightPercentage">
                    <div class="absolute inset-x-0 top-0 h-1.5 bg-white/30 rounded-t-xl"></div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Axis Labels -->
          <div class="flex justify-between items-center px-0 pt-3 relative z-10">
            <div *ngFor="let col of recentChartData()" class="flex-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {{col.label}}
            </div>
          </div>
          
          <!-- Background Deco -->
          <svg class="absolute bottom-0 inset-x-0 opacity-[0.02] w-full h-1/2 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
             <path d="M0,100 C20,90 40,80 60,95 C80,110 90,80 100,70 L100,100 Z" fill="currentColor"></path>
          </svg>
        </div>

        <!-- Top Selling Products -->
        <div class="xl:col-span-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex flex-col h-[450px]">
          <h2 class="text-lg font-bold text-gray-900 border-l-4 border-terracotta pl-3 mb-6">Top 5 Produits Vendus</h2>
          
          <div class="flex-grow overflow-y-auto pr-2 space-y-4">
             <div *ngFor="let prod of topProducts(); let i = index" class="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10">
                <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                  <div class="absolute top-0 left-0 bg-gray-900 text-white text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-br-lg z-10">
                    #{{i + 1}}
                  </div>
                  <img [src]="prod.image" class="w-full h-full object-cover">
                </div>
                <div class="min-w-0 flex-grow">
                  <p class="text-sm font-bold text-gray-900 truncate">{{prod.name}}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{{prod.qty}} ventes</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-black text-terracotta">{{(prod.rev / 1000).toFixed(1)}}k</p>
                  <p class="text-[9px] text-gray-400 font-medium">MRU</p>
                </div>
             </div>

             <!-- Empty state -->
             <div *ngIf="topProducts().length === 0" class="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                 <svg class="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                 <p class="text-sm font-medium">Pas assez de données pour le moment</p>
             </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders List -->
      <app-card header="Commandes Récentes" class="mt-8 block shadow-xl shadow-gray-200/20 rounded-3xl overflow-hidden border border-gray-100">
        <div class="overflow-x-auto" *ngIf="orders().length > 0; else noOrders">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-gray-50 text-gray-700 font-medium whitespace-nowrap">
              <tr>
                <th class="px-6 py-4">ID</th>
                <th class="px-6 py-4">Client</th>
                <th class="px-6 py-4 text-center">Date</th>
                <th class="px-6 py-4 text-center">Montant Total</th>
                <th class="px-6 py-4 text-center">Statut</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders().slice(0, 8)" class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-black">#{{order._id.substring(order._id.length-6).toUpperCase()}}</td>
                <td class="px-6 py-4">
                  <span class="font-bold text-gray-900">{{order.user?.name || 'Client Supprimé'}}</span>
                </td>
                <td class="px-6 py-4 text-center font-medium">{{order.createdAt | date:'shortTime'}} - {{order.createdAt | date:'shortDate'}}</td>
                <td class="px-6 py-4 text-center">
                  <span class="font-black text-primary">{{order.totalPrice | number}} MRU</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span [class]="getStatusClass(order)" class="py-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full" [class.bg-sage]="order.isConfirmed" [class.bg-yellow-500]="!order.isConfirmed" [class.animate-pulse]="!order.isConfirmed"></div>
                    {{ order.isConfirmed ? 'Confirmée' : 'En Attente' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button *ngIf="!order.isConfirmed" 
                      (click)="confirmOrder(order._id)"
                      class="text-white hover:bg-sage font-bold bg-sage-dark border border-sage-dark/20 px-4 py-2 rounded-xl cursor-pointer text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95">
                      Confirmer
                    </button>
                    <button (click)="deleteOrder(order._id)"
                      class="text-terracotta hover:bg-terracotta hover:text-white font-bold bg-terracotta/10 border border-terracotta/20 px-4 py-2 rounded-xl cursor-pointer text-[10px] uppercase tracking-widest transition-all active:scale-95">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noOrders>
          <div class="py-20 text-center text-gray-400 flex flex-col items-center">
            <svg class="w-16 h-16 mb-4 opacity-50 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <p class="font-medium">Aucune commande reçue pour le moment.</p>
          </div>
        </ng-template>
      </app-card>
      
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  orderService = inject(OrderService);
  productService = inject(ProductService);

  orders = signal<Order[]>([]);

  // Top KPIs
  confirmedOrdersCount = computed(() => this.orders().filter(o => o.isConfirmed).length);

  revenue = computed(() => 
    this.orders()
      .filter(o => o.isConfirmed)
      .reduce((sum, o) => sum + o.totalPrice, 0)
  );

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
