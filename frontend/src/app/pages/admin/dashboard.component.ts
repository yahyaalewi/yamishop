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
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-8 font-inter">Tableau de Bord</h1>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Revenus Total</p>
            <p class="text-2xl font-bold text-gray-900">{{ revenue() | number }} MRU</p>
            <p class="text-[10px] text-gray-400 font-medium mt-1">Dont {{ revenueShipping() | number }} MRU livraison</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Commandes (Total)</p>
            <p class="text-2xl font-bold text-gray-900">{{ orders().length }}</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-sage/20 text-sage-dark flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Statut: Mois</p>
            <p class="text-2xl font-bold text-gray-900">{{ monthOrdersCount() }} cmd</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Clients Uniques</p>
            <p class="text-2xl font-bold text-gray-900">{{ uniqueClients() }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Orders List -->
      <app-card header="Commandes Récentes">
        <div class="overflow-x-auto" *ngIf="orders().length > 0; else noOrders">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-gray-50 text-gray-700 font-medium">
              <tr>
                <th class="px-4 py-3 rounded-tl-lg">ID</th>
                <th class="px-4 py-3">Client</th>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Total</th>
                <th class="px-4 py-3">Statut</th>
                <th class="px-4 py-3 rounded-tr-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders().slice(0, 10)" class="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                <td class="px-4 py-3 font-medium text-gray-900 truncate max-w-[100px]">#{{order._id.substring(order._id.length-6).toUpperCase()}}</td>
                <td class="px-4 py-3">{{order.user?.name || 'Client Supprimé'}}</td>
                <td class="px-4 py-3">{{order.createdAt | date:'short'}}</td>
                <td class="px-4 py-3">
                  <span class="font-semibold text-primary">{{order.totalPrice | number}} MRU</span>
                  <div class="text-[10px] text-gray-500 font-medium mt-0.5">Livraison: {{ order.shippingPrice || 150 }} MRU</div>
                </td>
                <td class="px-4 py-3">
                  <span [class]="getStatusClass(order)" class="py-1 px-3 rounded-full text-xs font-semibold">
                    {{ order.isConfirmed ? 'Confirmée' : 'En Attente' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button *ngIf="!order.isConfirmed" 
                      (click)="confirmOrder(order._id)"
                      class="text-sage-dark hover:text-sage font-bold bg-sage/10 border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs">
                      Confirmer
                    </button>
                    <button (click)="deleteOrder(order._id)"
                      class="text-terracotta hover:text-red-600 font-bold bg-terracotta/10 border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noOrders>
          <div class="py-10 text-center text-gray-400">
            Aucune commande reçue pour le moment.
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
  
  revenue = computed(() => 
    this.orders()
      .filter(o => o.isConfirmed)
      .reduce((sum, o) => sum + o.totalPrice, 0)
  );
  
  revenueShipping = computed(() => 
    this.orders()
      .filter(o => o.isConfirmed)
      .reduce((sum, o) => sum + (o.shippingPrice || 150), 0)
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

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => this.orders.set(data),
      error: (err) => console.error('Failed to load orders', err)
    });
  }

  confirmOrder(id: string) {
    if (confirm('Confirmer cette commande ? Elle sera ajoutée aux statistiques.')) {
      this.orderService.confirmOrder(id).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => console.error('Failed to confirm order', err)
      });
    }
  }

  deleteOrder(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible.')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => console.error('Failed to delete order', err)
      });
    }
  }

  getStatusClass(order: Order) {
    if (order.isConfirmed) return 'bg-sage/20 text-sage-dark';
    return 'bg-yellow-100 text-yellow-700';
  }
}
