import { Component, signal, OnInit, inject, effect, computed } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../components/ui/button.component';
import { HeaderComponent } from '../components/layout/header.component';
import { FooterComponent } from '../components/layout/footer.component';
import { cartCount, CartService } from '../services/cart.service';
import { ProductService, Product } from '../services/product.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [':host { display: block; }'],
  template: `
    <div class="h-full">
      <main class="flex-grow">
        <!-- Loading State -->
        <div *ngIf="loading(); else content" class="container mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p class="text-gray-500 font-medium">{{ lang.translate('common.loading') }}</p>
        </div>

        <ng-template #content>
          <div *ngIf="product; else notFound">
            <!-- Breadcrumb -->
            <nav class="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 py-3 px-4">
              <div class="container mx-auto flex items-center gap-1.5">
                <a routerLink="/home" class="hover:text-primary no-underline text-gray-500">{{ lang.translate('nav.home') }}</a>
                <span class="rotate-180 inline-block" *ngIf="lang.isRTL()">‹</span>
                <span *ngIf="!lang.isRTL()">›</span>
                <a routerLink="/products" class="hover:text-primary no-underline text-gray-500">{{ lang.translate('nav.shop') }}</a>
                <span>›</span>
                <span class="text-gray-800 font-medium truncate">{{product.name}}</span>
              </div>
            </nav>

            <div class="container mx-auto px-4 py-8">
              <div class="flex flex-col lg:flex-row gap-10">

                <!-- Images -->
                <div class="lg:w-1/2 space-y-4">
                  <div class="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                    <img [src]="selectedImage()" [alt]="product.name" class="w-full h-full object-cover">
                    <div class="absolute top-3 left-3">
                      <span *ngIf="product.oldPrice" class="bg-terracotta text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{{discount()}}%
                      </span>
                    </div>
                  </div>
                  <div class="flex gap-2 overflow-x-auto pb-2" *ngIf="galleryImages.length > 1">
                    <button *ngFor="let img of galleryImages; let i = index" (click)="selectImage(i)"
                      class="w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-transparent p-0 cursor-pointer"
                      [class.border-primary]="selectedIndex() === i" [class.border-gray-200]="selectedIndex() !== i">
                      <img [src]="productService.getImageUrl(img)" [alt]="product.name" class="w-full h-full object-cover">
                    </button>
                  </div>
                </div>

                <!-- Info -->
                <div class="lg:w-1/2 space-y-6">
                  <div>
                    <p class="text-terracotta font-semibold text-sm tracking-wide mb-1 uppercase">{{ lang.translateCategory(product.category) }}</p>
                    <h1 class="text-3xl font-extrabold text-gray-900 leading-tight">{{ translatedName() || product.name }}</h1>
                  </div>

                  <div class="flex items-center gap-2">
                    <div class="flex">
                      <svg *ngFor="let s of [1,2,3,4,5]" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"
                           [class.text-yellow-400]="s <= (product.rating || 0)"
                           [class.text-gray-300]="s > (product.rating || 0)">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <span class="text-sm text-gray-500">{{ product.rating || 0 }} ({{ product.views || 0 }} {{ lang.isRTL() ? 'مشاهدة' : 'vues' }})</span>
                  </div>

                  <div class="flex items-end gap-3">
                    <span class="text-4xl font-extrabold text-primary">{{product.price | number}} MRU</span>
                    <span *ngIf="product.oldPrice" class="text-xl text-gray-400 line-through mb-1">{{product.oldPrice | number}} MRU</span>
                  </div>
                  <div class="flex items-center gap-2 bg-blue-50/50 px-4 py-2.5 rounded-xl border border-blue-100/50 w-fit">
                    <svg class="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 11-4 0"/></svg>
                    <span *ngIf="(product.shippingPrice || 0) > 0" class="text-xs font-bold text-blue-700">
                      {{ lang.isRTL() ? 'رسوم التوصيل' : 'Livraison' }}: {{product.shippingPrice | number}} MRU
                    </span>
                    <span *ngIf="(product.shippingPrice || 0) === 0" class="text-xs font-bold text-green-600">
                      {{ lang.isRTL() ? 'توصيل مجاني' : 'Livraison gratuite' }}
                    </span>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <div *ngIf="product.gender?.toLowerCase()?.trim() === 'homme'" 
                         class="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20 pointer-events-none">
                      <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="10" cy="14" r="5" /><path d="M14 10l6-6" /><path d="M14 4h6v6" />
                      </svg>
                    </div>
                    <div *ngIf="product.gender?.toLowerCase()?.trim() === 'femme'" 
                         class="w-10 h-10 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center border border-terracotta/20 pointer-events-none">
                      <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="9" r="5" /><path d="M12 14v7" /><path d="M9 18h6" />
                      </svg>
                    </div>

                    <div [class]="(product.stock || 0) > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-100 italic transition-colors">
                      <span class="w-2 h-2 rounded-full animate-pulse" [class]="(product.stock || 0) > 0 ? 'bg-green-500' : 'bg-red-500'"></span>
                      {{ (product.stock || 0) > 0 ? (lang.translate('product.stock_left') + ' ' + product.stock) : lang.translate('product.stock_finished') }}
                    </div>
                  </div>

                  <div class="space-y-5 border-t border-gray-100 pt-5">
                    <div *ngIf="product.colors?.length">
                      <span class="text-sm font-bold text-gray-900 block mb-2 uppercase tracking-wide">{{ lang.translate('product.colors') }}</span>
                      <div class="flex flex-wrap gap-2">
                        <button *ngFor="let color of product.colors" (click)="selectedColor.set(color)" class="px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all bg-white cursor-pointer" [class.border-primary]="selectedColor() === color" [class.border-gray-200]="selectedColor() !== color">{{color}}</button>
                      </div>
                    </div>
                    <div *ngIf="product.sizes?.length">
                      <span class="text-sm font-bold text-gray-900 block mb-2 uppercase tracking-wide">{{ lang.translate('product.sizes') }}</span>
                      <div class="flex flex-wrap gap-2">
                        <button *ngFor="let size of product.sizes" (click)="selectedSize.set(size)" class="min-w-[40px] px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all bg-white cursor-pointer" [class.border-primary]="selectedSize() === size" [class.border-gray-200]="selectedSize() !== size">{{size}}</button>
                      </div>
                    </div>
                  </div>

                  <!-- Qty + Cart -->
                  <div class="flex flex-col sm:flex-row items-stretch gap-4 pt-4">
                    <div class="flex flex-col gap-2 flex-1">
                      <div class="flex items-center border-2 border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50 shadow-inner h-full">
                        <button type="button" (click)="dec()" class="flex-1 px-5 py-4 text-gray-400 hover:text-primary hover:bg-white transition-all text-xl font-black border-none bg-transparent cursor-pointer active:bg-gray-100" [disabled]="qty() <= 1">−</button>
                        <input type="number" [value]="qty()" (input)="onQtyChange($event)" [class.text-red-600]="qty() > (product.stock || 0)" class="w-16 h-full font-black text-gray-900 text-center border-x-2 border-gray-100/50 text-lg tabular-nums bg-transparent outline-none py-4 appearance-none">
                        <button type="button" (click)="inc()" class="flex-1 px-5 py-4 text-gray-400 hover:text-primary hover:bg-white transition-all text-xl font-black border-none bg-transparent cursor-pointer active:bg-gray-100" [disabled]="qty() >= (product.stock || 0)">+</button>
                      </div>
                      <p *ngIf="qty() > (product.stock || 0)" class="text-[10px] font-black uppercase text-red-500 animate-pulse mt-1">⚠️ {{ lang.isRTL() ? 'الكمية تتجاوز المخزون المتوفر' : 'Quantité supérieure au stock' }}</p>
                    </div>

                    <button (click)="addToCart()" [disabled]="(product.stock || 0) === 0 || qty() > (product.stock || 0) || qty() < 1" class="flex-1 inline-flex items-center justify-center bg-terracotta text-white px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-terracotta-dark transition-all border-none cursor-pointer disabled:opacity-50">
                      <span>{{ lang.translate('product.add_to_cart') }}</span>
                    </button>
                  </div>

                  <button (click)="buyNow()" [disabled]="(product.stock || 0) === 0 || qty() > (product.stock || 0) || qty() < 1" class="w-full inline-flex items-center justify-center bg-primary text-white px-8 py-6 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary-dark transition-all border-none cursor-pointer disabled:opacity-50 mt-4">
                    ⚡ {{ lang.translate('product.buy_now') }}
                  </button>

                  <div class="mt-12 space-y-8 pt-8 border-t border-gray-100">
                    <div>
                      <h3 class="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">{{ lang.translate('product.description') }}</h3>
                      <p class="text-gray-600 leading-relaxed font-inter text-base whitespace-pre-wrap">{{ translatedDescription() || product.description }}</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div *ngFor="let feat of (translatedFeatures().length ? translatedFeatures() : product.features)" class="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div class="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary">✓</div>
                        <span class="text-sm font-bold text-gray-700">{{feat}}</span>
                      </div>
                    </div>
                  </div>

                  </div>
                </div>
              </div>

          <ng-template #notFound>
            <div class="flex-grow flex flex-col items-center justify-center gap-4 text-gray-500 py-20 px-4">
              <span class="text-6xl text-gray-300">🔍</span>
              <p class="text-xl font-bold">Produit introuvable</p>
              <a routerLink="/products" class="bg-primary text-white px-8 py-3 rounded-xl no-underline font-bold">Retour à la boutique</a>
            </div>
          </ng-template>
        </ng-template>
      </main>
    </div>
  `
})
export class ProductDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  productService = inject(ProductService);
  cartService = inject(CartService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  lang = inject(LanguageService);
  seo = inject(SeoService);

  product: Product | null = null;
  loading = signal(true);
  qty = signal(1);
  
  translatedName = signal('');
  translatedDescription = signal('');
  translatedFeatures = signal<string[]>([]);
  
  selectedIndex = signal(0);
  selectedColor = signal<string | null>(null);
  selectedSize = signal<string | null>(null);

  constructor() {
    effect(() => {
      const currentProduct = this.product;
      const locale = this.lang.currentLocale();
      
      if (currentProduct) {
        this.lang.translateText(currentProduct.name, locale).then(res => this.translatedName.set(res));
        this.lang.translateText(currentProduct.description, locale).then(res => this.translatedDescription.set(res));
        if (currentProduct.features?.length) {
          Promise.all(currentProduct.features.map((f: string) => this.lang.translateText(f, locale))).then(res => this.translatedFeatures.set(res));
        } else {
          this.translatedFeatures.set([]);
        }
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading.set(true);
      this.productService.getProductById(id).subscribe({
        next: (data) => {
          this.product = data;
          if (this.product.colors?.length) this.selectedColor.set(this.product.colors[0]);
          if (this.product.sizes?.length) this.selectedSize.set(this.product.sizes[0]);
          this.loading.set(false);

          // SEO Tags Update for this product!
          const productName = this.translatedName() || this.product!.name;
          const desc = this.product!.description ? this.product!.description.slice(0, 155) + '...' : 'Produit disponible sur YamiShop';
          const img = this.productService.getImageUrl(this.product!.imageUrl) || 'https://yamishop.store/banner.png';

          this.seo.updateTags({
            title: productName,
            description: desc,
            image: img,
            type: 'product'
          });
        },
        error: () => {
          this.product = null;
          this.loading.set(false);
        }
      });
    }
  }

  /** Unified gallery: uses images[] if populated, otherwise wraps imageUrl */
  get galleryImages(): string[] {
    if (!this.product) return [];
    const imgs: string[] = this.product.images && this.product.images.length > 0
      ? this.product.images
      : (this.product.imageUrl ? [this.product.imageUrl] : []);
    return imgs;
  }

  selectedImage = () => this.productService.getImageUrl(this.galleryImages[this.selectedIndex()] ?? this.product?.imageUrl);
  discount = () => this.product?.oldPrice ? Math.round((1 - this.product.price / this.product.oldPrice) * 100) : 0;
  selectImage(i: number) { this.selectedIndex.set(i); }
  inc() { if (this.qty() < (this.product?.stock || 0)) this.qty.update(n => n + 1); }
  dec() { this.qty.update(n => Math.max(1, n - 1)); }
  onQtyChange(event: any) {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) this.qty.set(value);
  }

  addToCart() {
    const currentImage = this.selectedImage(); // image currently displayed (may differ from imageUrl)
    this.cartService.addItem(this.product!, this.qty(), this.selectedColor(), this.selectedSize(), currentImage);
    this.notificationService.show(`${this.translatedName() || this.product!.name}: ${this.lang.translate('msg.added_to_cart')}`);
  }

  buyNow() {
    if (!this.authService.currentUser()) {
      this.notificationService.show(this.lang.translate('auth.please_login'), 'info');
      this.router.navigate(['/register'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.addToCart();
    this.router.navigate(['/checkout']);
  }
}
