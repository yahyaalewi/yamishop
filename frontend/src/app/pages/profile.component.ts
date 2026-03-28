import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OrderService, Order } from '../services/order.service';
import { ButtonComponent } from '../components/ui/button.component';
import { HeaderComponent } from '../components/layout/header.component';
import { FooterComponent } from '../components/layout/footer.component';
import { NotificationService } from '../services/notification.service';
import { ProductService } from '../services/product.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, RouterLink],
  template: `
    <div class="h-full">
      <main class="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div class="max-w-4xl mx-auto space-y-12">
          
          <div class="flex flex-col md:flex-row gap-8">
            <!-- Profile Info Section -->
            <div class="w-full md:w-1/3 space-y-6">
              <h1 class="text-3xl font-extrabold text-gray-900 font-inter">{{ lang.translate('profile.title') }}</h1>
              <div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <form (ngSubmit)="updateProfile()" #f="ngForm" class="space-y-6">
                  <!-- Name -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ lang.translate('checkout.name') }}</label>
                    <input type="text" name="name" [(ngModel)]="profileData.name"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  </div>

                  <!-- Phone -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ lang.translate('checkout.phone') }}</label>
                    <input type="tel" [value]="profileData.phone" disabled
                      class="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none">
                  </div>

                  <!-- Email -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ lang.translate('profile.email_optional') }}</label>
                    <input type="email" name="email" [(ngModel)]="profileData.email"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  </div>

                  <div class="pt-4 border-t border-gray-100">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">{{ lang.translate('profile.password_change') }}</h3>
                    <input type="password" name="password" [(ngModel)]="newPassword" [placeholder]="lang.translate('profile.password_placeholder')"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm">
                  </div>

                  <div class="flex flex-col gap-3 pt-4">
                    <app-button type="submit" variant="primary" [disabled]="loading()" [fullWidth]="true">
                      <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ loading() ? lang.translate('common.loading') : lang.translate('profile.save') }}
                    </app-button>
                    <app-button type="button" variant="outline" (onClick)="logout()" [fullWidth]="true">
                      <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {{ lang.translate('nav.logout') }}
                    </app-button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Order History Section -->
            <div class="w-full md:w-2/3 space-y-6" id="orders">
              <h2 class="text-3xl font-extrabold text-gray-900 font-inter">{{ lang.translate('profile.orders') }}</h2>
              
              <div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 min-h-[400px]">
                <div *ngIf="loadingOrders()" class="flex flex-col items-center justify-center py-20 animate-pulse">
                  <div class="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4"></div>
                  <p class="text-gray-400 font-medium">{{ lang.translate('profile.loading_orders') }}</p>
                </div>

                <div *ngIf="!loadingOrders() && orders().length === 0" class="flex flex-col items-center justify-center py-20 text-center">
                  <div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                    <svg class="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">{{ lang.translate('profile.no_orders') }}</h3>
                  <p class="text-gray-500 mb-8 max-w-xs">{{ lang.translate('profile.no_orders_msg') }}</p>
                  <a routerLink="/home" 
                     class="inline-flex items-center justify-center bg-terracotta text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-terracotta-dark transition-all duration-300 no-underline cursor-pointer border-2 border-white/20 active:scale-95 premium-button-shine animate-button-hover">
                    <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>{{ lang.translate('home.all_products') }}</span>
                  </a>
                </div>

                <div *ngIf="!loadingOrders() && orders().length > 0" class="space-y-4">
                  <div *ngFor="let order of orders()" class="group border border-gray-100 rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
                    <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{{ lang.translate('profile.order_prefix') }} #{{order._id.substring(order._id.length-6).toUpperCase()}}</p>
                        <p class="text-sm font-medium text-gray-600">{{order.createdAt | date:'longDate'}}</p>
                      </div>
                      <div class="flex flex-col items-end">
                        <span [class]="getStatusClass(order)" class="py-1 px-3 rounded-full text-[10px] font-extrabold mb-1">
                          {{ order.isConfirmed ? lang.translate('profile.order_confirmed') : lang.translate('profile.order_pending') }}
                        </span>
                        <p class="text-lg font-bold text-primary leading-none">{{order.totalPrice | number}} {{ lang.translate('common.price_label') }}</p>
                        <p class="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter" *ngIf="order.shippingPrice > 0">
                          {{ lang.isRTL() ? 'شامل التوصيل' : 'Livraison incluse' }}
                        </p>
                        
                        <!-- Invoice Download Button -->
                        <button *ngIf="order.isConfirmed" 
                                (click)="downloadInvoice(order._id); $event.stopPropagation()"
                                class="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-[10px] font-bold transition-all border border-primary/20">
                          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          {{ lang.translate('profile.invoice') }}
                        </button>
                      </div>
                    </div>

                    <!-- Items Preview -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                      <div *ngFor="let item of order.orderItems" class="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden relative group/item">
                         <img [src]="productService.getImageUrl(item.image)" class="w-full h-full object-cover transition-transform group-hover/item:scale-110">
                         <div class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-[8px] text-white font-bold opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap overflow-hidden px-1">
                           <span *ngIf="item.color">{{item.color}}</span>
                           <span *ngIf="item.size">{{item.size}}</span>
                           <span>x{{item.qty || item.quantity}}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  `,
  styles: [`
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ProfileComponent implements OnInit {
  profileData: any = { name: '', phone: '', email: '' };
  newPassword = '';
  loading = signal(false);
  
  orders = signal<Order[]>([]);
  loadingOrders = signal(true);
  
  authService = inject(AuthService);
  orderService = inject(OrderService);
  productService = inject(ProductService);
  notificationService = inject(NotificationService);
  lang = inject(LanguageService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  constructor() {}

  ngOnInit() {
    this.refreshProfile();
    this.loadOrders();
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'orders') {
        setTimeout(() => {
          document.getElementById('orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    });
  }

  refreshProfile() {
    this.loading.set(true);
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profileData = { ...user };
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadOrders() {
    this.loadingOrders.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loadingOrders.set(false);
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loadingOrders.set(false);
      }
    });
  }

  updateProfile() {
    this.loading.set(true);
    const updateData: any = {
      name: this.profileData.name,
      email: this.profileData.email
    };
    if (this.newPassword) updateData.password = this.newPassword;

    this.authService.updateProfile(updateData).subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.show(this.lang.translate('profile.updated'));
        this.newPassword = '';
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.show(err.error?.message || 'Erreur', 'error');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.notificationService.show(this.lang.translate('msg.logged_out'));
    this.router.navigate(['/login']);
  }

  getStatusClass(order: Order) {
    if (order.isConfirmed) return 'bg-sage/20 text-sage-dark';
    return 'bg-yellow-100 text-yellow-700';
  }

  downloadInvoice(orderId: string) {
    this.notificationService.show(this.lang.translate('common.loading'));
    this.orderService.downloadInvoice(orderId, this.lang.currentLocale()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${orderId.substring(orderId.length-6).toUpperCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Invoice download failed', err);
        this.notificationService.show(this.lang.translate('msg.error_occurred'), 'error');
      }
    });
  }
}
