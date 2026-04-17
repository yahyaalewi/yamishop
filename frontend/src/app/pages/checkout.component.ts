import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from '../components/layout/header.component';
import { FooterComponent } from '../components/layout/footer.component';
import { cartCount, cartItems, CartService } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styles: [':host { display: block; }'],
  template: `
    <div class="h-full">
      <main class="flex-grow container mx-auto px-4 py-8">

        <!-- Success screen -->
        <div *ngIf="orderPlaced()" class="max-w-md mx-auto text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-5 animate-in fade-in zoom-in duration-500">
          <div class="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-2 shadow-inner">✓</div>
          <h1 class="text-2xl font-extrabold text-gray-900 font-inter">{{ lang.translate('checkout.success_title') }}</h1>
          <p class="text-gray-500 text-sm">{{ lang.translate('checkout.success_msg') }}</p>
          <div class="bg-primary/5 py-4 rounded-2xl border border-primary/10">
            <p class="text-xs text-primary/60 uppercase font-bold tracking-widest mb-1">{{ lang.translate('checkout.order_num') }}</p>
            <p class="font-extrabold text-primary text-2xl tracking-tight">YM-{{orderNumber()}}</p>
          </div>
          <div class="flex flex-col gap-4 pt-6">
            <a [routerLink]="['/profile']" fragment="orders"
               class="w-full inline-flex items-center justify-center bg-primary text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary-dark transition-all duration-300 no-underline cursor-pointer border-2 border-white/20 active:scale-95 premium-button-shine animate-button-hover shadow-primary/30">
              <svg class="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>{{ lang.translate('checkout.track_order') }}</span>
            </a>
            
            <a routerLink="/home" 
               class="w-full inline-flex items-center justify-center bg-white text-gray-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-gray-100 hover:border-primary hover:text-primary transition-all no-underline cursor-pointer active:scale-95">
              <svg class="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{{ lang.translate('common.back') }}</span>
            </a>
          </div>
        </div>

        <!-- Checkout form -->
        <div *ngIf="!orderPlaced()">
          <h1 class="text-2xl font-extrabold text-gray-900 mb-8 font-inter flex items-center gap-3">
             {{ lang.translate('checkout.confirm') }}
             <span class="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{{items().length}} {{ lang.isRTL() ? 'منتجات مختارة' : 'article(s)' }}</span>
          </h1>

          <div class="flex flex-col lg:flex-row gap-8">
            <!-- Shipping Form -->
            <div class="lg:w-2/3 space-y-6">
              <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span class="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20 italic">1</span>
                  {{ lang.translate('checkout.delivery') }}
                </h2>
                <form (ngSubmit)="placeOrder()" #f="ngForm" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{{ lang.translate('checkout.name') }} *</label>
                    <input type="text" name="name" [(ngModel)]="form.name" required placeholder="Ex: Mohamed Ahmed"
                      class="w-full px-4 py-3.5 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 placeholder-gray-300"
                      [class.border-red-400]="submitted && !form.name">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{{ lang.translate('checkout.phone') }} *</label>
                    <input type="tel" name="phone" [(ngModel)]="form.phone" required placeholder="+222 4X XX XX XX"
                      class="w-full px-4 py-3.5 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 placeholder-gray-300"
                      [class.border-red-400]="submitted && !form.phone">
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{{ lang.isRTL() ? 'المدينة' : 'Ville' }} *</label>
                    <div class="relative group">
                      <input type="text" name="city" value="Nouakchott" disabled
                        class="w-full px-4 py-3.5 border border-primary/20 rounded-2xl bg-primary/5 focus:outline-none transition-all text-primary font-bold cursor-not-allowed">
                      <div class="absolute" [class.left-4]="lang.isRTL()" [class.right-4]="!lang.isRTL()" class="top-1/2 -translate-y-1/2 text-primary font-black text-xs uppercase tracking-widest">{{ lang.isRTL() ? 'نواكشوط' : 'Fixé' }}</div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{{ lang.translate('checkout.district_label') }} *</label>
                    <select name="district" [(ngModel)]="form.district" required
                      class="w-full px-4 py-3.5 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 cursor-pointer"
                      [class.border-red-400]="submitted && !form.district">
                      <option value="" disabled selected>{{ lang.translate('checkout.district_placeholder') }}</option>
                      <option value="Tevragh Zeina">{{ lang.translate('district.tevragh') }}</option>
                      <option value="Ksar">{{ lang.translate('district.ksar') }}</option>
                      <option value="Teyarett">{{ lang.translate('district.teyarett') }}</option>
                      <option value="Dar Naim">{{ lang.translate('district.darnaim') }}</option>
                      <option value="Toujounine">{{ lang.translate('district.toujounine') }}</option>
                      <option value="Arafat">{{ lang.translate('district.arafat') }}</option>
                      <option value="Sebkha">{{ lang.translate('district.sebkha') }}</option>
                      <option value="El Mina">{{ lang.translate('district.elmina') }}</option>
                      <option value="Riyadh">{{ lang.translate('district.riyadh') }}</option>
                    </select>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{{ lang.translate('checkout.address_label') }} *</label>
                    <input type="text" name="address" [(ngModel)]="form.address" required placeholder="Ex: Côté pharmacie, N° de villa, Avenue..."
                      class="w-full px-4 py-3.5 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 placeholder-gray-300"
                      [class.border-red-400]="submitted && !form.address">
                  </div>
                </form>
              </div>

              <!-- Payment method -->
              <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 class="text-lg font-bold text-gray-900 mb-5 flex items-center gap-3">
                  <span class="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20 italic">2</span>
                  {{ lang.translate('checkout.payment_method') }}
                </h2>
                <div class="flex items-center gap-4 bg-green-50/50 border-2 border-green-500/20 rounded-2xl p-5 ring-4 ring-green-500/5">
                  <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                    <div>
                      <p class="font-bold text-green-800">💵 {{ lang.translate('checkout.payment_cash') }}</p>
                      <p class="text-xs text-green-600/70">{{ lang.translate('checkout.exact_amount') }}</p>
                    </div>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="lg:w-1/3">
              <div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-24 ring-1 ring-gray-900/5">
                <h2 class="text-lg font-bold text-gray-900 mb-6">{{ lang.translate('checkout.summary') }}</h2>

                <!-- Items -->
                <div class="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <div *ngFor="let item of items()" class="flex items-center gap-4 group">
                    <div class="relative flex-shrink-0">
                      <img [src]="productService.getImageUrl(item.image)" class="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                      <span class="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                        {{item.qty}}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-gray-900 truncate uppercase tracking-tight">{{item.name}}</p>
                      <div class="flex gap-1.5 text-[8px] font-bold uppercase text-gray-400 mt-0.5" *ngIf="item.color || item.size">
                        <span *ngIf="item.color" class="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 italic">{{item.color}}</span>
                        <span *ngIf="item.size" class="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 italic">{{item.size}}</span>
                      </div>
                      <p class="text-xs text-gray-400 mt-0.5">{{item.price | number}} MRU / pc</p>
                    </div>
                    <span class="text-sm font-extrabold text-primary">{{(item.price * item.qty) | number}} MRU</span>
                  </div>
                </div>

                <div class="border-t border-gray-100 pt-6 space-y-3 text-sm">
                  <div class="flex justify-between text-gray-500 font-medium">
                    <span>{{ lang.translate('checkout.subtotal') }}</span> <span class="text-gray-900">{{subtotal() | number}} {{ lang.translate('common.price_label') }}</span>
                  </div>
                  <div class="flex justify-between text-gray-500 font-medium">
                    <span>{{ lang.translate('checkout.shipping_fee') }}</span> <span class="text-primary font-bold">{{shippingFee() | number}} {{ lang.translate('common.price_label') }}</span>
                  </div>
                  <div class="flex justify-between font-extrabold text-gray-900 pt-4 border-t border-gray-100 items-baseline">
                    <span class="text-base uppercase tracking-wider">Total</span>
                    <div class="text-right">
                       <span class="text-3xl font-black text-terracotta tracking-tight">{{(subtotal() + shippingFee()) | number}} {{ lang.translate('common.price_label') }}</span>
                    </div>
                  </div>
                </div>

                <button (click)="placeOrder()" [disabled]="loading()"
                  class="w-full inline-flex items-center justify-center bg-terracotta text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-terracotta-dark transition-all duration-300 cursor-pointer border-2 border-white/20 active:scale-95 disabled:opacity-50 disabled:grayscale mt-8">
                  <svg *ngIf="loading()" class="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  <span class="flex items-center gap-2">
                    <svg *ngIf="!loading()" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                    {{ loading() ? lang.translate('common.loading') : lang.translate('checkout.confirm') }}
                  </span>
                </button>
                <div class="mt-8 pt-6 border-t border-gray-50 flex flex-wrap items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <!-- Bankily Badge -->
                  <div class="h-8 px-3 rounded-xl flex items-center justify-center bg-[#00AEEF]/5 border border-[#00AEEF]/20 text-[#00AEEF] gap-1.5 shadow-sm" title="Bankily">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h8.5c2.5 0 4.5 2 4.5 4.5 0 1.5-.7 2.8-1.8 3.5 1.4.6 2.3 2 2.3 3.6 0 2.8-2.2 5-5 5H4V4zm3 8h4.5c1.4 0 2.5-1.1 2.5-2.5S12.9 7 11.5 7H7v5zm0 5.5h5.5c1.4 0 2.5-1.1 2.5-2.5S13.9 12.5 12.5 12.5H7v5z"/></svg>
                    <span class="text-[11px] font-black tracking-widest uppercase mt-0.5">Bankily</span>
                  </div>
                  <!-- Masrivi Badge -->
                  <div class="h-8 px-3 rounded-xl flex items-center justify-center bg-[#0C6A36]/5 border border-[#0C6A36]/20 text-[#0C6A36] gap-1.5 shadow-sm" title="Masrivi">
                    <svg class="w-4 h-4 text-[#FFD000]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span class="text-[11px] font-black tracking-widest uppercase mt-0.5 relative">
                      Masrivi
                      <span class="absolute -right-2 top-0.5 w-1 h-1 bg-[#FFD000] rounded-full"></span>
                    </span>
                  </div>
                  <!-- Cash Badge -->
                  <div class="h-8 px-3 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-400 gap-1.5 shadow-sm" title="Cash">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <span class="text-[11px] font-bold tracking-widest uppercase mt-0.5">Cash</span>
                  </div>
                </div>
              </div>

              <!-- Extra info -->
              <div class="mt-4 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                <p class="text-[11px] font-bold text-gray-600 leading-relaxed">
                  <span class="text-primary mr-1">📍</span> {{ lang.translate('product.shipping_info') }}
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  `
})
export class CheckoutComponent {
  router = inject(Router);
  productService = inject(ProductService);
  cartService = inject(CartService);
  notificationService = inject(NotificationService);
  orderService = inject(OrderService);
  authService = inject(AuthService);
  lang = inject(LanguageService);

  form = { name: '', phone: '', address: '', district: '', city: 'Nouakchott', notes: '' };
  submitted = false;
  loading = signal(false);
  orderPlaced = signal(false);
  orderNumber = signal('');
  items = cartItems;

  constructor() {}

  ngOnInit() {
    // Pre-fill form if user is logged in
    const user = this.authService.currentUser();
    if (user) {
      this.form.name = user.name;
      this.form.phone = user.phone;
    }
    
    // Check if cart is empty and not just placed
    if (this.items().length === 0 && !this.orderPlaced()) {
      this.router.navigate(['/cart']);
    }
  }

  subtotal() {
    return cartItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  shippingFee() {
    const items = cartItems();
    if (items.length === 0) return 0;
    return Math.max(...items.map(i => i.shippingPrice || 0));
  }

  placeOrder() {
    this.submitted = true;
    if (!this.form.name || !this.form.phone || !this.form.address || !this.form.city) {
      this.notificationService.show(this.lang.translate('checkout.fill_fields'), 'error');
      return;
    }

    this.loading.set(true);
    
    const orderData = {
      orderItems: this.items().map(i => ({
        name: i.name,
        qty: i.qty,
        image: i.image,
        price: i.price,
        id: i.id,
        color: i.color,
        size: i.size
      })),
      shippingAddress: {
        street: this.form.address,
        district: this.form.district,
        city: this.form.city,
        notes: this.form.notes,
        postalCode: '0000',
        country: 'Mauritanie'
      },
      paymentMethod: 'Cash on Delivery',
      shippingPrice: this.shippingFee(),
      totalPrice: this.subtotal() + this.shippingFee()
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        const orderId = res._id as string;
        this.orderNumber.set(orderId.substring(orderId.length - 6).toUpperCase());
        this.orderPlaced.set(true);
        this.notificationService.show(this.lang.translate('msg.order_placed'));
        this.cartService.clearCart();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err: any) => {
        this.loading.set(false);
        this.notificationService.show(err.error?.message || this.lang.translate('msg.error_occurred'), 'error');
      }
    });
  }
}
