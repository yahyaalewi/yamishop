import { Component, signal, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '../components/layout/header.component';
import { FooterComponent } from '../components/layout/footer.component';
import { CartService, cartCount, cartItems } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { LanguageService } from '../services/language.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [':host { display: block; }'],
  template: `
    <div class="h-full">
      <main class="flex-grow container mx-auto px-4 pt-28 pb-16">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h1 class="text-4xl font-black text-gray-900 tracking-tighter mb-2">{{ lang.translate('cart.title') }}</h1>
            <p class="text-gray-400 font-medium text-sm uppercase tracking-[0.2em] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {{items().length}} {{ lang.isRTL() ? 'منتجات مختارة' : 'Article' + (items().length > 1 ? 's' : '') + ' sélectionné' + (items().length > 1 ? 's' : '') }}
            </p>
          </div>
          <a routerLink="/products" class="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors no-underline group">
            <span class="group-hover:-translate-x-1 transition-transform">{{ lang.isRTL() ? '→' : '←' }}</span>
            {{ lang.translate('common.back') }}
          </a>
        </div>

        <!-- Empty cart -->
        <div *ngIf="items().length === 0" class="text-center py-24 bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 animate-in fade-in zoom-in duration-700">
          <div class="relative w-32 h-32 mx-auto mb-8">
            <div class="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
            <div class="relative bg-white rounded-full w-full h-full flex items-center justify-center text-6xl shadow-inner border-4 border-primary/5">🛒</div>
          </div>
          <h2 class="text-2xl font-black text-gray-900 mb-2">{{ lang.translate('cart.empty') }}</h2>
          <p class="text-gray-500 mb-8 max-w-xs mx-auto">{{ lang.translate('cart.empty_msg') }}</p>
          <a routerLink="/home" 
             class="inline-flex items-center bg-terracotta text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-terracotta-dark transition-all duration-300 no-underline cursor-pointer border-2 border-white/20 active:scale-95 premium-button-shine animate-button-hover mx-auto">
            <span>{{ lang.translate('home.shop_now') }}</span>
          </a>
        </div>

        <!-- Filled cart -->
        <div *ngIf="items().length > 0" class="flex flex-col lg:flex-row gap-10 items-start">
          
          <!-- Items list -->
          <div class="lg:w-[65%] w-full space-y-6">
            <div *ngFor="let item of items()" class="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-gray-200/50 border border-gray-100/80 p-5 flex gap-6 items-center transition-all duration-500">
               <!-- Image -->
               <div class="relative overflow-hidden rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-sm">
                 <img [src]="productService.getImageUrl(item.image)" [alt]="item.name" 
                      class="w-24 h-24 md:w-32 md:h-32 object-cover bg-gray-50">
                 <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
               </div>
               
               <!-- Info and Controls Container -->
               <div class="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                  <div class="flex justify-between items-start gap-4">
                    <div class="min-w-0">
                      <p class="text-[10px] font-black text-terracotta uppercase tracking-tighter mb-1">{{ lang.translate('cart.quality_badge') }}</p>
                      <h3 class="font-black text-gray-900 text-base md:text-xl truncate tracking-tight mb-2">{{item.name}}</h3>
                      <div class="flex flex-wrap gap-2" *ngIf="item.color || item.size">
                        <span *ngIf="item.color" class="text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-sm">{{item.color}}</span>
                        <span *ngIf="item.size" class="text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-sm">{{ lang.isRTL() ? 'مقاس' : 'Taille' }} {{item.size}}</span>
                      </div>
                    </div>
                    <button (click)="removeItem(item)" class="text-gray-300 hover:text-terracotta transition-colors bg-transparent border-none cursor-pointer p-2 rounded-xl hover:bg-terracotta/5 group/del">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <div class="flex items-center justify-between mt-4">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center bg-gray-50/50 p-1 rounded-2xl border border-gray-100 w-fit">
                        <button (click)="updateQty(item)" class="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm hover:text-primary transition-all disabled:opacity-30 disabled:grayscale cursor-pointer border-none" [disabled]="item.qty <= 1">−</button>
                        <input type="number" 
                               [value]="item.qty" 
                               (input)="onQtyInput($event, item)"
                               class="w-10 h-full font-black text-gray-900 text-center text-xs bg-transparent outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                        <button (click)="incQty(item)" class="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm hover:text-primary transition-all cursor-pointer border-none disabled:opacity-30 disabled:grayscale" [disabled]="item.qty >= (item.stock || 0)">+</button>
                      </div>
                      <p *ngIf="item.qty > (item.stock || 0)" class="text-[9px] font-black uppercase text-red-500 animate-pulse mt-1">
                        ⚠️ {{ lang.isRTL() ? 'تجاوز المخزون' : 'Stock dépassé' }}
                      </p>
                    </div>
                    
                    <div class="text-right">
                      <p class="font-black text-gray-900 text-lg md:text-2xl tracking-tighter">{{(item.price * item.qty) | number}} <span class="text-[10px] text-gray-400 uppercase tracking-widest ml-1">MRU</span></p>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="lg:w-[35%] w-full sticky top-28">
            <div class="bg-gray-900 text-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden relative group/summary">
              <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full group-hover/summary:scale-150 transition-transform duration-1000"></div>
              
              <h2 class="text-xl font-black mb-8 flex items-center gap-3">
                <span class="w-1.5 h-6 bg-primary rounded-full"></span>
                {{ lang.translate('checkout.summary') }}
              </h2>

              <div class="space-y-6 mb-8">
                <div class="flex justify-between items-center text-white/50 text-xs font-bold uppercase tracking-widest">
                  <span>{{ lang.translate('checkout.subtotal') }}</span>
                  <span class="text-white text-base">{{subtotal() | number}} {{ lang.translate('common.price_label') }}</span>
                </div>
                <div class="flex justify-between items-center text-white/50 text-xs font-bold uppercase tracking-widest">
                  <span>{{ lang.translate('checkout.shipping_fee') }}</span>
                  <div class="text-right">
                    <span class="text-primary font-black text-base">150 {{ lang.translate('common.price_label') }}</span>
                  </div>
                </div>
                
                <div class="pt-6 border-t border-white/10">
                  <div class="flex justify-between items-end">
                    <div>
                      <p class="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mb-1">{{ lang.translate('cart.total') }}</p>
                      <p class="text-3xl font-black tracking-tighter">{{(subtotal() + 150) | number}} <span class="text-sm font-medium text-white/40">{{ lang.translate('common.price_label') }}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <a [routerLink]="hasStockError() ? null : '/checkout'"
                [class.opacity-50]="hasStockError()"
                [class.pointer-events-none]="hasStockError()"
                class="block w-full text-center bg-white text-gray-900 px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary hover:text-white transition-all duration-300 no-underline cursor-pointer active:scale-95 group/btn">
                <span class="flex items-center justify-center gap-3">
                  {{ lang.translate('cart.checkout') }}
                  <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" [class.rotate-180]="lang.isRTL()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </span>
                <p *ngIf="hasStockError()" class="text-[9px] font-black uppercase text-red-400 mt-2">
                  {{ lang.isRTL() ? 'يرجى مراجعة الكميات (مخزون غير كافٍ)' : 'Stock insuffisant pour certains articles' }}
                </p>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class CartComponent {
  productService = inject(ProductService);
  cartService = inject(CartService);
  lang = inject(LanguageService);
  notificationService = inject(NotificationService);
  items = cartItems;

  subtotal() {
    return cartItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  hasStockError = computed(() => {
    return this.items().some(item => item.qty > (item.stock || 0));
  });

  updateQty(item: any) {
    this.cartService.updateQty(item.id, item.qty - 1, item.color, item.size);
  }

  incQty(item: any) {
    if (item.qty < (item.stock || 0)) {
      this.cartService.updateQty(item.id, item.qty + 1, item.color, item.size);
    }
  }

  onQtyInput(event: any, item: any) {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      this.cartService.updateQty(item.id, value, item.color, item.size);
    }
  }

  async removeItem(item: any) {
    const confirmed = await this.notificationService.confirm(
      this.lang.isRTL() ? 'هل أنت متأكد من حذف هذا المنتج من السلة؟' : 'Voulez-vous vraiment retirer cet article du panier ?'
    );
    
    if (confirmed) {
      this.cartService.removeItem(item.id, item.color, item.size);
      this.notificationService.show(this.lang.translate('msg.item_removed'));
    }
  }
}
