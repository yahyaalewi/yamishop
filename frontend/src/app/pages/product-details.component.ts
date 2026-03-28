import { Component, signal, OnInit, inject, effect } from '@angular/core';
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

const PRODUCTS: any[] = [
  { id: '1', name: 'Montre Premium Connectée', price: 35000, oldPrice: 45000, category: 'Électronique', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80'], description: 'Montre connectée premium avec suivi cardiaque, GPS, paiement sans contact et écran AMOLED haute résolution.', features: ['Résistance à l\'eau IPX68', 'Batterie 14 jours', 'Écran AMOLED 1.4"', 'Compatible iOS & Android'] },
  { id: '2', name: 'Lunettes de soleil Classic', price: 12500, oldPrice: null, category: 'Accessoires', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80'], description: 'Lunettes de soleil élégantes avec protection UV400 et verres polarisés.', features: ['Protection UV400', 'Verres Polarisés', 'Monture légère', 'Étui inclus'] },
  { id: '3', name: 'Sac à main Élégant', price: 28000, oldPrice: 35000, category: 'Mode', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80'], description: 'Sac à main en cuir véritable, design intemporel avec multiples compartiments.', features: ['Cuir véritable', 'Grande capacité', 'Bandoulière amovible', 'Fermeture sécurisée'] },
  { id: '4', name: 'Casque Audio Sans fil', price: 22000, oldPrice: null, category: 'Électronique', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'], description: 'Casque audio sans fil avec réduction de bruit active et autonomie de 30h.', features: ['Réduction de bruit active', 'Autonomie 30 heures', 'Connexion Bluetooth 5.0', 'Repliable pour voyage'] },
  { id: '5', name: 'Parfum Arabesque Or', price: 18500, oldPrice: 22000, category: 'Beauté', image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=400&q=80'], description: 'Parfum oriental luxueux aux notes de oud, rose et ambre.', features: ['Notes: Oud, Rose, Ambre', '100ml EDP', 'Tenue longue durée', 'Flacon élégant'] },
  { id: '6', name: 'Chaussures Sport Pro', price: 15000, oldPrice: null, category: 'Mode', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'], description: 'Chaussures de sport légères et respirantes pour toutes vos activités.', features: ['Semelle amortissante', 'Matériaux respirants', 'Semelle antidérapante', 'Design ergonomique'] },
  { id: '7', name: 'Lampe Bureau Design', price: 9500, oldPrice: null, category: 'Maison', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80'], description: 'Lampe de bureau LED design avec lumière variable et port USB intégré.', features: ['LED économique', 'Luminosité variable', 'Port USB intégré', '3 modes de lumière'] },
  { id: '8', name: 'Veste en Cuir Premium', price: 45000, oldPrice: 60000, category: 'Mode', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80'], description: 'Veste en cuir véritable, coupe moderne et doublure chaude pour toutes saisons.', features: ['Cuir pleine fleur', 'Doublure polaire', 'Poches interne/externe', 'Tailles S-XXL'] },
];

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
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
              <div class="flex gap-2 overflow-x-auto pb-2">
                <button *ngFor="let img of product.images; let i = index" (click)="selectImage(i)"
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

              <!-- Stars -->
              <div class="flex items-center gap-2">
                <div class="flex text-yellow-400">
                  <svg *ngFor="let s of [1,2,3,4,5]" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span class="text-sm text-gray-500">4.8 (128 {{ lang.isRTL() ? 'آراء' : 'avis' }})</span>
              </div>

              <!-- Price -->
              <div class="flex items-end gap-3">
                <span class="text-4xl font-extrabold text-primary">{{product.price | number}} MRU</span>
                <span *ngIf="product.oldPrice" class="text-xl text-gray-400 line-through mb-1">{{product.oldPrice | number}} MRU</span>
              </div>

              <!-- Badges -->
              <div class="flex flex-wrap gap-2">
                <!-- Gender Symbols Only -->
                <div *ngIf="product.gender?.toLowerCase()?.trim() === 'homme'" 
                     class="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shadow-sm border border-primary/20 hover:bg-primary/20 transition-all pointer-events-none">
                  <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="10" cy="14" r="5" /><path d="M14 10l6-6" /><path d="M14 4h6v6" />
                  </svg>
                </div>
                <div *ngIf="product.gender?.toLowerCase()?.trim() === 'femme'" 
                     class="w-10 h-10 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center shadow-sm border border-terracotta/20 hover:bg-terracotta/20 transition-all pointer-events-none">
                  <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="9" r="5" /><path d="M12 14v7" /><path d="M9 18h6" />
                  </svg>
                </div>

                <div [class]="(product.stock || 0) > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-100 italic transition-colors">
                  <span class="w-2 h-2 rounded-full animate-pulse" [class]="(product.stock || 0) > 0 ? 'bg-green-500' : 'bg-red-500'"></span>
                  <ng-container *ngIf="(product.stock || 0) > 0; else outOfStock">
                    {{ lang.translate('product.stock_left') }} {{ product.stock }}
                  </ng-container>
                  <ng-template #outOfStock>
                    {{ lang.translate('product.stock_finished') }}
                  </ng-template>
                </div>
                <div class="bg-blue-50 text-blue-700 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold">
                  <span class="text-base">📍</span>
                  {{ lang.translate('product.shipping_info') }}
                </div>
              </div>

              <!-- Description -->
              <p class="text-gray-600 leading-relaxed border-t border-gray-100 pt-5 whitespace-pre-wrap break-words">{{product.description}}</p>

              <!-- Selections (Colors & Sizes) -->
              <div class="space-y-5 border-t border-gray-100 pt-5">
                <!-- Color Selector -->
                <div *ngIf="product.colors?.length">
                  <span class="text-sm font-bold text-gray-900 block mb-2 uppercase tracking-wide">{{ lang.translate('product.colors') }}</span>
                  <div class="flex flex-wrap gap-2">
                    <button *ngFor="let color of product.colors" 
                      (click)="selectedColor.set(color)"
                      class="px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all bg-white cursor-pointer"
                      [class.border-primary]="selectedColor() === color"
                      [class.bg-primary/5]="selectedColor() === color"
                      [class.border-gray-200]="selectedColor() !== color">
                      {{color}}
                    </button>
                  </div>
                </div>

                <!-- Size Selector -->
                <div *ngIf="product.sizes?.length">
                  <span class="text-sm font-bold text-gray-900 block mb-2 uppercase tracking-wide">{{ lang.translate('product.sizes') }}</span>
                  <div class="flex flex-wrap gap-2">
                    <button *ngFor="let size of product.sizes" 
                      (click)="selectedSize.set(size)"
                      class="min-w-[40px] px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all bg-white cursor-pointer"
                      [class.border-primary]="selectedSize() === size"
                      [class.bg-primary/5]="selectedSize() === size"
                      [class.border-gray-200]="selectedSize() !== size">
                      {{size}}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Features Grid -->
              <div *ngIf="product.features?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl">
                <div *ngFor="let feat of product.features" class="flex items-center gap-2 text-sm text-gray-700">
                  <div class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                  {{feat}}
                </div>
              </div>

              <!-- Quantity + Cart -->
              <div class="flex flex-col sm:flex-row items-stretch gap-4 pt-4">
                <div class="flex items-center border-2 border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50 shadow-inner">
                  <button (click)="dec()" class="flex-1 px-5 py-4 text-gray-400 hover:text-primary hover:bg-white transition-all text-xl font-black border-none bg-transparent cursor-pointer active:bg-gray-100">−</button>
                  <span class="px-6 py-4 font-black text-gray-900 min-w-[4rem] text-center border-x-2 border-gray-100/50 text-lg tabular-nums">{{qty()}}</span>
                  <button (click)="inc()" class="flex-1 px-5 py-4 text-gray-400 hover:text-primary hover:bg-white transition-all text-xl font-black border-none bg-transparent cursor-pointer active:bg-gray-100">+</button>
                </div>
                <button (click)="addToCart()" 
                   [disabled]="(product.stock || 0) === 0"
                   class="flex-1 inline-flex items-center justify-center bg-terracotta text-white px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-terracotta-dark transition-all duration-300 border-2 border-white/20 active:scale-95 premium-button-shine animate-button-hover cursor-pointer group disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
                  <svg class="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span>{{ lang.translate('product.add_to_cart') }}</span>
                </button>

              </div>

              <!-- Direct Buy -->
              <button (click)="buyNow()" 
                 [disabled]="(product.stock || 0) === 0"
                 class="w-full inline-flex items-center justify-center bg-primary text-white px-8 py-6 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary-dark transition-all duration-300 border-2 border-white/10 active:scale-95 premium-button-shine animate-button-hover cursor-pointer relative overflow-hidden disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
                <span class="relative z-10 flex items-center gap-3">
                  <span class="text-xl">⚡</span>
                  {{ lang.translate('product.buy_now') }}
                </span>
                <div *ngIf="(product.stock || 0) > 0" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-shine"></div>
              </button>
              <!-- Description & Features -->
              <div class="mt-12 space-y-12">
                <!-- Description -->
                <div class="pt-8 border-t border-gray-100">
                  <h3 class="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">{{ lang.translate('product.description') }}</h3>
                  <p class="text-gray-600 leading-relaxed font-inter text-base" [class.text-right]="lang.isRTL()" style="white-space: pre-wrap;">
                    {{ translatedDescription() || product.description }}
                  </p>
                </div>

                <!-- Features Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div *ngFor="let feat of (translatedFeatures().length ? translatedFeatures() : product.features)" 
                       class="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all group">
                    <div class="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform">✓</div>
                    <span class="text-sm font-bold text-gray-700">{{feat}}</span>
                  </div>
                </div>

                <!-- Extra Info -->
                <div class="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 flex items-center gap-4">
                  <div class="text-3xl">🚚</div>
                  <div>
                    <h4 class="font-black text-primary text-sm uppercase tracking-widest mb-1">{{ lang.translate('product.shipping_info') }}</h4>
                    <p class="text-xs text-gray-500 font-medium italic">Livraison rapide à votre domicile ou bureau.</p>
                  </div>
                </div>
                
                <div class="pt-8 text-center">
                  <a routerLink="/products" class="text-xs font-bold text-gray-400 hover:text-primary transition-colors no-underline uppercase tracking-widest">
                    {{ lang.isRTL() ? 'الرجوع للمتجر' : 'Retour à la boutique' }}
                  </a>
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
              <app-button routerLink="/products" variant="primary">Retour à la boutique</app-button>
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

  product: any = null;
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
        // Translate Name
        this.lang.translateText(currentProduct.name, locale).then(res => this.translatedName.set(res));
        
        // Translate Description
        this.lang.translateText(currentProduct.description, locale).then(res => this.translatedDescription.set(res));
        
        // Translate Features
        if (currentProduct.features?.length) {
          Promise.all(
            currentProduct.features.map((f: string) => this.lang.translateText(f, locale))
          ).then(res => this.translatedFeatures.set(res));
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
        },
        error: () => {
          this.product = null;
          this.loading.set(false);
        }
      });
    }
  }

  selectedImage = () => this.productService.getImageUrl(this.product?.images?.[this.selectedIndex()] ?? this.product?.imageUrl);
  discount = () => this.product?.oldPrice ? Math.round((1 - this.product.price / this.product.oldPrice) * 100) : 0;

  selectImage(i: number) { this.selectedIndex.set(i); }
  inc() { this.qty.update(n => n + 1); }
  dec() { this.qty.update(n => Math.max(1, n - 1)); }

  addToCart() {
    this.cartService.addItem(this.product, this.qty(), this.selectedColor(), this.selectedSize());
    this.notificationService.show(`${this.translatedName() || this.product.name}: ${this.lang.translate('msg.added_to_cart')}`);
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
