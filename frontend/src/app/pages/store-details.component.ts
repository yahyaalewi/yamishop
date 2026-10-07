import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { StoreService, Store } from '../services/store.service';
import { HeaderComponent } from '../components/layout/header.component';
import { FooterComponent } from '../components/layout/footer.component';
import { LanguageService } from '../services/language.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-store-details',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    
    <div class="min-h-screen bg-gray-50 pt-20">
      <div *ngIf="loadingStore()" class="flex justify-center items-center py-32">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <div *ngIf="error()" class="flex flex-col items-center justify-center py-32">
        <div class="text-6xl mb-4 grayscale opacity-20">🏪</div>
        <h3 class="text-2xl font-black text-gray-900 mb-2">Boutique introuvable</h3>
        <p class="text-gray-500 mb-6">Cette boutique n'existe pas ou n'est plus disponible.</p>
        <a routerLink="/home" class="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all no-underline">
          Retour à l'accueil
        </a>
      </div>

      <div *ngIf="!loadingStore() && store() && !error()">
        <!-- Store Banner -->
        <div class="bg-white border-b border-gray-200/60 shadow-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              <!-- Store Logo -->
              <div class="w-32 h-32 rounded-3xl bg-white border border-gray-100 shadow-xl overflow-hidden flex items-center justify-center text-4xl font-black text-primary shrink-0 ring-4 ring-white">
                <img *ngIf="store()?.logo" [src]="productService.getImageUrl(store()!.logo!)" [alt]="store()?.name" class="w-full h-full object-cover">
                <span *ngIf="!store()?.logo">{{ store()?.name?.charAt(0)?.toUpperCase() || '🏪' }}</span>
              </div>

              <!-- Store Info -->
              <div class="flex-1 text-center md:text-left">
                <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  Boutique Partenaire
                </div>
                <h1 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">{{ store()?.name }}</h1>
                <p class="text-gray-500 font-medium max-w-2xl mb-4">{{ store()?.description || 'Découvrez nos produits exclusifs !' }}</p>
                
                <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-gray-600">
                  <div *ngIf="store()?.address" class="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span>📍</span> {{ store()?.address }}
                  </div>
                  <div *ngIf="store()?.phone" class="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span>📞</span> {{ store()?.phone }}
                  </div>
                </div>
              </div>

              <!-- Share Button -->
              <div class="shrink-0 mt-4 md:mt-0">
                <button (click)="shareStore()" class="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 transition-all border-none cursor-pointer active:scale-95">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  <span>Partager la boutique</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Products Section -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">
              Catalogue de <span class="text-primary">{{ store()?.name }}</span>
            </h2>
            <div class="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {{ products().length }} {{ products().length > 1 ? 'Produits' : 'Produit' }}
            </div>
          </div>

          <div *ngIf="loadingProducts()" class="flex justify-center items-center py-20">
            <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>

          <div *ngIf="!loadingProducts() && products().length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div class="text-5xl mb-4 grayscale opacity-20">📦</div>
            <h3 class="text-lg font-black text-gray-900 mb-1">Aucun produit</h3>
            <p class="text-gray-400 font-medium">Cette boutique n'a pas encore ajouté de produits.</p>
          </div>

          <div *ngIf="!loadingProducts() && products().length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            <div *ngFor="let product of products()" class="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden group relative">
               
               <div class="absolute top-3 right-3 z-30">
                 <button (click)="addToCart(product, $event)" class="w-10 h-10 bg-white text-gray-900 rounded-xl flex items-center justify-center shadow-lg border border-gray-100 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 border-none cursor-pointer">
                   <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                   </svg>
                 </button>
               </div>

               <div class="w-full aspect-square overflow-hidden bg-gray-50 relative cursor-pointer" [routerLink]="['/product', product._id]">
                 <img [src]="productService.getImageUrl(product.imageUrl)" [alt]="product.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
               </div>

               <div class="p-5 cursor-pointer" [routerLink]="['/product', product._id]">
                 <h3 class="font-bold text-gray-900 text-sm truncate mb-1 group-hover:text-primary transition-colors">{{ product.name }}</h3>
                 <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate mb-3">{{ product.category }}</p>
                 <div class="flex items-center justify-between">
                   <div class="flex flex-col">
                     <span class="font-black text-primary text-base">{{ product.price | number }} <span class="text-[10px]">MRU</span></span>
                     <span *ngIf="product.oldPrice" class="text-[10px] text-gray-400 line-through font-bold">{{ product.oldPrice | number }} MRU</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <app-footer></app-footer>
  `
})
export class StoreDetailsComponent implements OnInit {
  storeId = '';
  store = signal<Store | null>(null);
  products = signal<Product[]>([]);
  loadingStore = signal(true);
  loadingProducts = signal(false);
  error = signal(false);

  storeService = inject(StoreService);
  productService = inject(ProductService);
  cartService = inject(CartService);
  lang = inject(LanguageService);
  route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.storeId = params.get('id') || '';
      if (this.storeId) {
        this.loadStore();
      } else {
        this.error.set(true);
        this.loadingStore.set(false);
      }
    });
  }

  loadStore() {
    this.loadingStore.set(true);
    this.error.set(false);
    this.storeService.getPublicStoreById(this.storeId).subscribe({
      next: (st) => {
        this.store.set(st);
        this.loadingStore.set(false);
        this.loadProducts();
      },
      error: () => {
        this.error.set(true);
        this.loadingStore.set(false);
      }
    });
  }

  loadProducts() {
    this.loadingProducts.set(true);
    this.productService.getProducts(this.storeId).subscribe({
      next: (prods) => {
        // filter on client side just in case, but backend should already filter if storeId is passed
        const storeProducts = prods.filter(p => p.storeId === this.storeId);
        this.products.set(storeProducts);
        this.loadingProducts.set(false);
      },
      error: () => {
        this.loadingProducts.set(false);
      }
    });
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.cartService.addItem(product, 1);
  }

  shareStore() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.store()?.name || 'Boutique',
        text: 'Découvrez cette superbe boutique sur YamiShop !',
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Lien copié dans le presse-papier !');
      });
    }
  }
}

