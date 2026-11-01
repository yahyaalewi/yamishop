import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/ui/card.component';
import { OrderService, Order } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, CardComponent, FormsModule],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto relative font-inter">

      <!-- Details Modal Overlay (Full-screen sheet on mobile, rounded modal on desktop) -->
      <div *ngIf="selectedOrder()" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
        <div class="bg-white rounded-t-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-100 animate-in fade-in slide-in-from-bottom duration-300 overflow-hidden">
          
          <!-- Modal Header -->
          <div class="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">Détails de Commande</h2>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs font-black text-primary uppercase tracking-wider">#{{selectedOrder()?._id?.slice(-6)?.toUpperCase()}}</span>
                <span [class]="selectedOrder()?.isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                  {{ selectedOrder()?.isConfirmed ? 'Confirmée' : 'En Attente' }}
                </span>
              </div>
            </div>
            <button (click)="selectedOrder.set(null)" class="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-all border-none cursor-pointer">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div class="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            
            <!-- Items Ordered -->
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Articles commandés ({{ selectedOrder()?.orderItems?.length || 0 }})</p>
              <div class="space-y-2.5">
                <div *ngFor="let item of selectedOrder()?.orderItems" class="flex gap-3 sm:gap-4 items-center bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-100">
                  <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-xs shrink-0 bg-white border border-slate-200">
                    <img [src]="productService.getImageUrl(item.image)" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-grow min-w-0">
                    <p class="text-xs sm:text-sm font-bold text-slate-900 truncate m-0">{{item.name}}</p>
                    <div class="flex flex-wrap gap-1.5 mt-1" *ngIf="item.color || item.size">
                      <span *ngIf="item.color" class="inline-flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        🎨 {{item.color}}
                      </span>
                      <span *ngIf="item.size" class="inline-flex items-center gap-1 bg-terracotta/10 text-terracotta text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        📐 {{item.size}}
                      </span>
                    </div>
                    <p class="text-[10px] font-black text-slate-400 uppercase mt-1 m-0">Quantité: {{item.qty || item.quantity}}</p>
                  </div>
                  <p class="font-black text-slate-900 text-sm whitespace-nowrap m-0">{{item.price | number}} MRU</p>
                </div>
              </div>
            </div>

            <!-- Total Price Summary -->
            <div class="bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-5 rounded-2xl text-white flex justify-between items-center shadow-sm">
              <span class="text-xs font-black uppercase tracking-wider text-slate-300">Total à payer</span>
              <span class="text-xl sm:text-2xl font-black text-white">{{selectedOrder()?.totalPrice | number}} <span class="text-sm font-bold text-emerald-400">MRU</span></span>
            </div>

            <!-- Customer & Shipping Address Info -->
            <div class="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client & Coordonnées</span>
                <a *ngIf="selectedOrder()?.user?.phone" [href]="'tel:' + selectedOrder()?.user?.phone" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  📞 Appeler le client
                </a>
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900 m-0">{{selectedOrder()?.user?.name || 'Client Inconnu'}}</p>
                <p class="text-xs text-slate-500 font-medium m-0 mt-0.5">Tél : {{selectedOrder()?.user?.phone || 'Non renseigné'}}</p>
              </div>

              <div class="pt-2 border-t border-slate-200/60">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">📍 Destination de livraison</p>
                <p class="text-xs sm:text-sm font-bold text-slate-800 m-0">
                  {{selectedOrder()?.shippingAddress?.street}} {{selectedOrder()?.shippingAddress?.district ? '- ' + selectedOrder()?.shippingAddress?.district : ''}}
                </p>
                <p class="text-[10px] text-slate-400 font-semibold m-0 mt-0.5">{{selectedOrder()?.shippingAddress?.city || 'Nouakchott'}}, Mauritanie</p>
              </div>

              <div *ngIf="selectedOrder()?.shippingAddress?.notes" class="pt-2 border-t border-slate-200/60 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50">
                <p class="text-[9px] font-black text-amber-800 uppercase tracking-wider m-0">Instructions pour le livreur :</p>
                <p class="text-xs font-medium text-amber-900 italic m-0 mt-0.5">"{{selectedOrder()?.shippingAddress?.notes}}"</p>
              </div>
            </div>

          </div>

          <!-- Modal Actions Footer (Sticky at bottom) -->
          <div class="p-4 sm:p-5 border-t border-slate-100 bg-white shrink-0 space-y-2">
            <button *ngIf="!selectedOrder()?.isConfirmed" (click)="confirmOrder()"
              class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 sm:py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all border-none cursor-pointer flex items-center justify-center gap-2 active:scale-98">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              <span>Valider la Commande</span>
            </button>
            
            <button (click)="downloadInvoice(selectedOrder()?._id)"
                    class="w-full bg-primary hover:bg-primary-light text-white py-3 sm:py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-primary/20 transition-all border-none cursor-pointer flex items-center justify-center gap-2 active:scale-98">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Télécharger Facture PDF</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">Gestion des Commandes</h1>
          <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">Consultez, confirmez et suivez toutes les commandes reçues.</p>
        </div>
        <div class="bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 flex items-center gap-2">
          <span class="text-primary font-black text-sm sm:text-base">{{ filteredOrders.length }}</span>
          <span class="text-[10px] font-black text-primary/70 uppercase tracking-widest">Commandes</span>
        </div>
      </div>

      <!-- Card Container -->
      <app-card>
        <!-- Toolbar Filters -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <div class="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Rechercher par ID, client ou téléphone..." 
              class="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-xs sm:text-sm font-medium">
          </div>
          <select [(ngModel)]="statusFilter" class="px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-xs sm:text-sm font-bold text-slate-700 shrink-0">
            <option value="all">Tous les statuts</option>
            <option value="pending">⏳ En Attente</option>
            <option value="confirmed">✅ Confirmées</option>
          </select>
        </div>

        <!-- MOBILE CARDS VIEW (< 768px) -->
        <div class="md:hidden space-y-3">
          <div *ngFor="let order of filteredOrders" class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col gap-3">
            
            <!-- Header Row: ID + Status + Date -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">#{{order._id.slice(-6).toUpperCase()}}</span>
                <span [class]="order.isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                  {{ order.isConfirmed ? 'Confirmée' : 'En Attente' }}
                </span>
              </div>
              <span class="text-[10px] text-slate-400 font-medium">{{formatDate(order.createdAt)}}</span>
            </div>

            <!-- Customer & Phone Row -->
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-bold text-sm text-slate-900 m-0">{{order.user?.name || 'Client Inconnu'}}</p>
                <a *ngIf="order.user?.phone" [href]="'tel:' + order.user?.phone" class="text-xs font-semibold text-primary mt-0.5 inline-flex items-center gap-1 no-underline">
                  <span>📞</span> {{order.user?.phone}}
                </a>
                <p class="text-xs text-slate-400 mt-1 truncate max-w-[220px]">📍 {{order.shippingAddress?.street}}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-base font-black text-primary m-0">{{order.totalPrice | number}}</p>
                <p class="text-[9px] font-bold uppercase text-slate-400 m-0">MRU</p>
              </div>
            </div>

            <!-- Action Buttons Footer -->
            <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button (click)="openDetails(order)" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border-none cursor-pointer text-center active:scale-95">
                Détails
              </button>
              <button (click)="downloadInvoice(order._id)" class="px-3 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center active:scale-95" title="Télécharger Facture PDF">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </button>
              <button *ngIf="!order.isConfirmed" (click)="selectedOrder.set(order); confirmOrder()" class="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 active:scale-95">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                <span>Valider</span>
              </button>
            </div>

          </div>

          <div *ngIf="filteredOrders.length === 0 && !loading()" class="py-12 text-center text-slate-400 text-xs italic">
            Aucune commande trouvée
          </div>
        </div>

        <!-- DESKTOP TABLE VIEW (>= 768px) -->
        <div class="overflow-x-auto hidden md:block">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider whitespace-nowrap border-b border-slate-100">
              <tr>
                <th class="px-4 py-3 rounded-tl-lg">ID</th>
                <th class="px-4 py-3">Client</th>
                <th class="px-4 py-3">Adresse</th>
                <th class="px-4 py-3 text-center">Date</th>
                <th class="px-4 py-3 text-center">Total</th>
                <th class="px-4 py-3 text-center">Statut</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let order of filteredOrders" class="hover:bg-slate-50/60 transition-colors">
                <td class="px-4 py-3 font-black text-slate-900">#{{order._id.slice(-6).toUpperCase()}}</td>
                <td class="px-4 py-3">
                  <p class="font-bold text-slate-900 m-0">{{order.user?.name || 'Client Inconnu'}}</p>
                  <p class="text-[10px] text-slate-400 uppercase font-bold m-0 mt-0.5">{{order.user?.phone}}</p>
                </td>
                <td class="px-4 py-3 max-w-[180px] truncate text-xs font-semibold text-slate-500">{{order.shippingAddress?.street}}</td>
                <td class="px-4 py-3 text-center text-xs font-medium">{{formatDate(order.createdAt)}}</td>
                <td class="px-4 py-3 text-center font-black text-primary">{{order.totalPrice | number}} MRU</td>
                <td class="px-4 py-3 text-center">
                  <span [class]="order.isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'" class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {{ order.isConfirmed ? 'Confirmée' : 'En Attente' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button (click)="openDetails(order)" class="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer hover:border-primary hover:text-primary transition-all shadow-xs active:scale-95">
                      Détails
                    </button>
                    <button (click)="downloadInvoice(order._id)" title="Facture PDF" class="p-1.5 bg-slate-100 hover:bg-primary hover:text-white text-slate-600 rounded-xl transition-colors border-none cursor-pointer">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredOrders.length === 0 && !loading()">
                 <td colspan="7" class="py-16 text-center text-slate-400 italic font-medium">Aucune commande trouvée</td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orderService = inject(OrderService);
  productService = inject(ProductService);
  notificationService = inject(NotificationService);
  
  orders = signal<Order[]>([]);
  loading = signal(true);
  searchTerm = '';        // plain string for [(ngModel)]
  statusFilter = 'all';   // plain string for [(ngModel)]
  selectedOrder = signal<Order | null>(null);

  get filteredOrders(): Order[] {
    const search = this.searchTerm.toLowerCase().trim();
    const status = this.statusFilter;
    let result = this.orders();

    if (search) {
      result = result.filter(o =>
        o._id.toLowerCase().includes(search) ||
        o.user?.name?.toLowerCase().includes(search) ||
        o.user?.phone?.toLowerCase().includes(search) ||
        o.shippingAddress?.street?.toLowerCase().includes(search)
      );
    }

    if (status !== 'all') {
      if (status === 'confirmed') result = result.filter(o => o.isConfirmed);
      if (status === 'pending') result = result.filter(o => !o.isConfirmed);
    }

    return result;
  }

  constructor() {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openDetails(order: Order) {
    console.log('Opening order details:', order._id);
    this.selectedOrder.set(order);
  }

  confirmOrder() {
    const order = this.selectedOrder();
    if (!order) return;
    
    console.log('Confirming order:', order._id);
    this.orderService.confirmOrder(order._id).subscribe({
      next: () => {
        this.notificationService.show('Commande confirmée avec succès !');
        this.selectedOrder.set(null);
        this.loadOrders();
      },
      error: (err) => {
        console.error('Confirm order error:', err);
        this.notificationService.show('Erreur lors de la confirmation', 'error');
      }
    });
  }

  downloadInvoice(orderId?: string) {
    if (!orderId) return;
    this.orderService.downloadInvoice(orderId, 'fr').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${orderId.substring(orderId.length - 6).toUpperCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notificationService.show('Facture téléchargée avec succès !');
      },
      error: (err) => {
        console.error('Invoice download error:', err);
        this.notificationService.show('Erreur lors du téléchargement de la facture', 'error');
      }
    });
  }

  formatDate(dateStr: Date) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}

