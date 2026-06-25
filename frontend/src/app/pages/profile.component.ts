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
                    <div class="flex flex-col gap-2 mt-4">
                      <div *ngFor="let item of order.orderItems" class="flex items-center justify-between p-2 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                        <div class="flex items-center gap-3">
                          <img [src]="productService.getImageUrl(item.image)" class="w-12 h-12 rounded-lg object-cover">
                          <div>
                            <p class="text-xs font-bold text-gray-900 line-clamp-1 max-w-[150px] sm:max-w-[200px]">{{item.name}}</p>
                            <p class="text-[10px] text-gray-500 font-medium">x{{item.qty || item.quantity}} <span *ngIf="item.color">· {{item.color}}</span> <span *ngIf="item.size">· {{item.size}}</span></p>
                          </div>
                        </div>
                        <button *ngIf="order.isConfirmed && !item.rating" (click)="openReviewModal(order, item)" class="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors border border-yellow-200/50 cursor-pointer flex items-center gap-1 shrink-0">
                          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          {{ lang.isRTL() ? 'تقييم' : 'Évaluer' }}
                        </button>
                        <div *ngIf="item.rating" class="flex text-yellow-400">
                          <svg *ngFor="let s of [1,2,3,4,5]" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"
                               [class.text-yellow-400]="s <= item.rating"
                               [class.text-gray-200]="s > item.rating">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
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

      <!-- Review Modal -->
      <div *ngIf="showReviewModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">{{ lang.isRTL() ? 'تقييم المنتج' : 'Évaluer le produit' }}</h3>
            <button (click)="closeReviewModal()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors border-none cursor-pointer">✕</button>
          </div>
          
          <div class="flex flex-col items-center mb-6">
            <img *ngIf="currentReviewContext()?.item" [src]="productService.getImageUrl(currentReviewContext()?.item.image)" class="w-16 h-16 rounded-xl object-cover mb-3">
            <p class="font-bold text-center text-sm">{{ currentReviewContext()?.item?.name }}</p>
          </div>

          <div class="flex justify-center gap-2 mb-6">
            <button *ngFor="let star of [1,2,3,4,5]" 
                    type="button" 
                    (click)="reviewData.rating = star"
                    (mouseenter)="hoverRating = star"
                    (mouseleave)="hoverRating = 0"
                    class="bg-transparent border-none p-0 cursor-pointer transition-transform hover:scale-110">
              <svg class="w-10 h-10 transition-colors" 
                   [class.text-yellow-400]="star <= (hoverRating || reviewData.rating)" 
                   [class.text-gray-200]="star > (hoverRating || reviewData.rating)"
                   viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </button>
          </div>

          <app-button variant="primary" [fullWidth]="true" [disabled]="submittingReview()" (onClick)="submitReview()">
            {{ submittingReview() ? lang.translate('common.loading') : (lang.isRTL() ? 'إرسال التقييم' : 'Envoyer l\\'évaluation') }}
          </app-button>
        </div>
      </div>
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
        const errorMsg = err.error?.error || err.error?.message || this.lang.translate('msg.error_occurred');
        this.notificationService.show(errorMsg, 'error');
      }
    });
  }

  // Review logic
  showReviewModal = signal(false);
  submittingReview = signal(false);
  currentReviewContext = signal<{orderId: string, item: any} | null>(null);
  hoverRating = 0;
  reviewData = { rating: 5 };

  openReviewModal(order: any, item: any) {
    this.currentReviewContext.set({ orderId: order._id, item });
    this.reviewData = { rating: 5 };
    this.showReviewModal.set(true);
  }

  closeReviewModal() {
    this.showReviewModal.set(false);
    this.currentReviewContext.set(null);
  }

  submitReview() {
    const ctx = this.currentReviewContext();
    if (!ctx || !ctx.orderId || !ctx.item?.product) return;

    this.submittingReview.set(true);
    this.orderService.addReview(ctx.orderId, ctx.item.product, this.reviewData.rating).subscribe({
      next: () => {
        this.submittingReview.set(false);
        this.closeReviewModal();
        this.notificationService.show(this.lang.isRTL() ? 'تم إرسال التقييم بنجاح' : 'Évaluation envoyée avec succès');
        this.loadOrders(); // Reload orders to show stars
      },
      error: (err) => {
        this.submittingReview.set(false);
        this.notificationService.show(err.error?.message || 'Erreur', 'error');
      }
    });
  }
}
