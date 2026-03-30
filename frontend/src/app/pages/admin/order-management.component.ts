import { Component, OnInit, signal, computed, inject } from '@angular/core';
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
    <div class="p-6 max-w-7xl mx-auto relative">
      <!-- DEBUG ALERT INDICATOR (Will be removed after fix confirmed) -->
      <div *ngIf="selectedOrder()" class="fixed top-4 right-4 bg-terracotta text-white px-4 py-2 rounded-full z-[100000] shadow-2xl font-black text-[10px] animate-pulse">
        DEBUG: MODAL SIGNAL ACTIVE
      </div>

      <!-- Details Modal Overlay (Moved to top of template) -->
      <div *ngIf="selectedOrder()" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-80 transition-opacity">
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative border-4 border-primary shadow-primary/20">
          <button (click)="selectedOrder.set(null)" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center transition-all border-none cursor-pointer z-[10000]">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div class="mb-6">
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Détails de Commande</h2>
            <p class="text-xs font-black text-primary/50 uppercase tracking-widest mt-1">#{{selectedOrder()?._id?.slice(-6)?.toUpperCase()}}</p>
          </div>

          <div class="space-y-6">
            <!-- Items -->
            <div class="space-y-4">
              <div *ngFor="let item of selectedOrder()?.orderItems" class="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div class="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-white">
                  <img [src]="productService.getImageUrl(item.image)" class="w-full h-full object-cover">
                </div>
                <div class="flex-grow min-w-0">
                  <p class="text-sm font-bold text-gray-900 truncate">{{item.name}}</p>
                  <!-- Color & Size badges -->
                  <div class="flex flex-wrap gap-1.5 mt-1" *ngIf="item.color || item.size">
                    <span *ngIf="item.color" class="inline-flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      🎨 {{item.color}}
                    </span>
                    <span *ngIf="item.size" class="inline-flex items-center gap-1 bg-terracotta/10 text-terracotta text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      📐 {{item.size}}
                    </span>
                  </div>
                  <p class="text-[10px] font-black text-primary uppercase mt-1">Quantité: {{item.qty || item.quantity}}</p>
                </div>
                <p class="font-black text-gray-900 text-sm whitespace-nowrap">{{item.price | number}} MRU</p>
              </div>
            </div>

            <!-- Total -->
            <div class="bg-gray-900 p-6 rounded-2xl text-white">
               <div class="flex justify-between items-center">
                 <span class="text-[10px] font-black uppercase tracking-widest opacity-60">Total à payer</span>
                 <span class="text-2xl font-black">{{selectedOrder()?.totalPrice | number}} MRU</span>
               </div>
            </div>

            <!-- Address -->
            <div class="bg-gray-100 rounded-2xl p-6 border border-gray-200">
              <h4 class="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-4">📍 Destination & Instructions</h4>
              
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] flex-shrink-0">📬</div>
                  <div>
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Adresse & Quartier</p>
                    <p class="text-sm font-bold text-gray-900">{{selectedOrder()?.shippingAddress?.street}} {{selectedOrder()?.shippingAddress?.district ? '- ' + selectedOrder()?.shippingAddress?.district : ''}}</p>
                    <p class="text-[10px] font-black text-gray-400 uppercase mt-0.5">{{selectedOrder()?.shippingAddress?.city}}, Mauritanie</p>
                  </div>
                </div>

                <div *ngIf="selectedOrder()?.shippingAddress?.notes" class="flex items-start gap-3 pt-3 border-t border-gray-200/50">
                  <div class="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-[10px] flex-shrink-0">📝</div>
                  <div>
                    <p class="text-[9px] font-black text-orange-600/60 uppercase tracking-widest">Notes pour le livreur</p>
                    <p class="text-xs font-bold text-gray-700 italic">"{{selectedOrder()?.shippingAddress?.notes}}"</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Confirm -->
            <button *ngIf="!selectedOrder()?.isConfirmed" (click)="confirmOrder()"
              class="w-full bg-terracotta text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-terracotta-dark transition-all border-none cursor-pointer">
              Valider la Commande
            </button>
            
            <div class="bg-green-100 text-green-700 p-3 rounded-xl text-center text-[10px] font-black uppercase tracking-widest" *ngIf="selectedOrder()?.isConfirmed">
              Commande Confirmée ✓
            </div>
          </div>
        </div>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 font-inter mb-8">Gestion des Commandes</h1>

      <app-card>
        <!-- Filters -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Rechercher par ID, Client ou Téléphone..." class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
          </div>
          <select [(ngModel)]="statusFilter" class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-600">
            <option value="all">Tous les statuts</option>
            <option value="pending">En Attente</option>
            <option value="confirmed">Confirmée</option>
          </select>
        </div>

        <!-- Orders Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-gray-50 text-gray-700 font-medium whitespace-nowrap">
              <tr>
                <th class="px-4 py-3 rounded-tl-lg">ID</th>
                <th class="px-4 py-3">Client</th>
                <th class="px-4 py-3">Adresse</th>
                <th class="px-4 py-3 text-center">Date</th>
                <th class="px-4 py-3 text-center">Total</th>
                <th class="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders()" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-black text-gray-900">#{{order._id.slice(-6).toUpperCase()}}</td>
                <td class="px-4 py-3">
                  <p class="font-bold text-gray-900">{{order.user?.name || 'Client Inconnu'}}</p>
                  <p class="text-[10px] text-gray-400 uppercase font-black">{{order.user?.phone}}</p>
                </td>
                <td class="px-4 py-3 max-w-[150px] truncate text-xs font-bold text-gray-500">{{order.shippingAddress?.street}}</td>
                <td class="px-4 py-3 text-center text-xs font-medium">{{formatDate(order.createdAt)}}</td>
                <td class="px-4 py-3 text-center font-black text-primary">{{order.totalPrice | number}} MRU</td>
                <td class="px-4 py-3 text-center">
                  <button (click)="openDetails(order)" class="bg-primary text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">Détails</button>
                </td>
              </tr>
              <tr *ngIf="filteredOrders().length === 0 && !loading()">
                 <td colspan="6" class="py-20 text-center text-gray-400 italic font-medium">Aucune commande trouvée</td>
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
  searchTerm = signal('');
  statusFilter = signal('all');
  selectedOrder = signal<Order | null>(null);

  filteredOrders = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();
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
  });

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

  formatDate(dateStr: Date) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}

