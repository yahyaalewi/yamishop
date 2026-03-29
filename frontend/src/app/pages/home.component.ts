import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '../components/layout/header.component';
import { FooterComponent } from '../components/layout/footer.component';
import { LanguageService } from '../services/language.service';
import { CartService } from '../services/cart.service';
import { ProductService, Product } from '../services/product.service';
import { NotificationService } from '../services/notification.service';

const CATEGORIES = [
  { name: 'Mode', image: '/images/categories/fashion.png' },
  { name: 'Électronique', image: '/images/categories/electronics.png' },
  { name: 'Maison', image: '/images/categories/home.png' },
  { name: 'Beauté', image: '/images/categories/beauty.png' },
  { name: 'Accessoires', image: '/images/categories/accessories.png' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    :host { display: block; }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    @keyframes bounce-horizontal {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(5px); }
    }
    .animate-bounce-horizontal {
      animation: bounce-horizontal 2s infinite;
    }
  `],
  template: `
    <div class="h-full">
      <main class="flex-grow">

        <!-- Hero -->
        <section class="bg-gradient-to-br from-primary via-primary-dark to-primary py-24 md:py-44 overflow-hidden relative min-h-[600px] flex items-end justify-center pb-24 md:pb-36">
          <div class="absolute inset-0 opacity-50 transition-opacity duration-1000" style="background-image: url('/banner.png'); background-size: cover; background-position: center;"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
          
          <div class="container mx-auto relative z-20 text-center px-4">
            <a [routerLink]="['/home']" fragment="products-list"
               class="inline-flex items-center bg-terracotta text-white px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-terracotta-dark transition-all duration-300 no-underline cursor-pointer border-2 border-white/20 active:scale-95 premium-button-shine animate-button-hover">
              <span>{{ lang.translate('home.shop_now') }}</span>
            </a>
          </div>
        </section>

        <!-- Categories -->
        <section id="categories-section" class="py-12 container mx-auto px-4">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl font-black text-gray-900 tracking-tighter">
                {{ selectedCategory() ? lang.translate('home.category_label') + ': ' + lang.translateCategory(selectedCategory()!) : lang.translate('home.categories') }}
              </h2>
              <div class="h-1.5 w-12 bg-terracotta mt-2 rounded-full shadow-sm shadow-terracotta/20"></div>
            </div>
            
            <!-- Scroll Indicator Symbol -->
            <div class="flex items-center gap-2 text-primary/30 animate-in fade-in slide-in-from-right duration-700">
               <span class="text-[9px] font-black uppercase tracking-[0.3em]">{{ lang.isRTL() ? 'اسحب' : 'Glisser' }}</span>
               <div class="flex items-center bg-gray-50 p-2 rounded-full border border-gray-100 shadow-inner">
                  <svg class="h-4 w-4 animate-bounce-horizontal" [class.rotate-180]="lang.isRTL()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
               </div>
            </div>
          </div>
          
          <div class="flex overflow-x-auto gap-6 md:gap-10 pb-8 pt-4 scrollbar-hide px-2">
            <div *ngFor="let cat of categories" (click)="filterByCategory(cat.name)"
              class="flex-shrink-0 flex flex-col items-center gap-4 cursor-pointer group transition-all duration-300 active:scale-95">
              
              <!-- Circular Image Container -->
              <div class="relative">
                <div 
                  [class.ring-4]="selectedCategory() === cat.name"
                  [class.ring-primary]="selectedCategory() === cat.name"
                  [class.ring-offset-4]="selectedCategory() === cat.name"
                  [class.scale-105]="selectedCategory() === cat.name"
                  class="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-50 shadow-md group-hover:shadow-xl group-hover:border-primary/20 transition-all duration-500 bg-gray-50 relative">
                  <img [src]="cat.image" [alt]="cat.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                  
                  <!-- Overlays and Badges -->
                  <div *ngIf="selectedCategory() === cat.name" class="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                     <div class="bg-primary text-white p-1.5 rounded-full shadow-lg transform scale-110">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                     </div>
                  </div>
                </div>

                <!-- Subtle Glow effect on selected -->
                <div *ngIf="selectedCategory() === cat.name" class="absolute -inset-1 bg-primary/20 blur-xl rounded-full -z-10 animate-pulse"></div>
              </div>

              <!-- Label -->
              <div class="flex flex-col items-center">
                <span [class.text-primary]="selectedCategory() === cat.name"
                      [class.font-black]="selectedCategory() === cat.name"
                      class="text-sm font-extrabold text-gray-700 tracking-tight transition-all duration-300 group-hover:text-primary whitespace-nowrap uppercase text-[11px]">
                  {{ lang.translateCategory(cat.name) }}
                </span>
                <div class="h-1 w-0 bg-primary/40 rounded-full mt-1.5 transition-all duration-500 group-hover:w-full"
                     [class.w-full]="selectedCategory() === cat.name"
                     [class.bg-primary]="selectedCategory() === cat.name"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Products List Section -->
        <section class="pt-24 pb-24 container mx-auto px-4" id="products-list">
          <!-- Products Header Redesign -->
          <div class="mb-16">
            <div class="flex flex-col items-center text-center space-y-4">
              <!-- Aesthetic Badge -->
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10 animate-in fade-in slide-in-from-bottom duration-700">
                <span class="text-xs">✨</span>
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                  {{ selectedCategory() ? lang.translate('home.category_label') : lang.translate('home.all_products') }}
                </span>
                <span class="text-xs">✨</span>
              </div>

              <!-- Main Title -->
              <h2 class="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight max-w-2xl">
                {{ lang.isRTL() ? 'اكتشف' : 'Découvrez' }}
                <span class="text-transparent bg-clip-text bg-gradient-to-br from-terracotta to-primary">
                  {{ selectedCategory() ? lang.translateCategory(selectedCategory()!) : (lang.isRTL() ? 'منتجاتنا المختارة' : 'Nos Pépites') }}
                </span>
              </h2>

              <!-- Subtitle -->
              <p class="text-gray-400 text-xs font-black uppercase tracking-[0.4em]">
                {{ selectedCategory() ? lang.translate('home.cat_msg') : lang.translate('home.all_msg') }}
              </p>

              <!-- Full Catalog Link - Visible only when a category IS selected -->
              <div class="pt-4" *ngIf="selectedCategory()">
                <a (click)="resetAndScroll()"
                   class="group inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary-dark transition-all no-underline cursor-pointer animate-in zoom-in duration-500">
                  <span>{{ lang.translate('home.full_catalog') }}</span>
                  <div class="flex items-center">
                    <span class="w-8 h-[2px] bg-primary/20 group-hover:w-12 transition-all duration-300"></span>
                    <span class="text-primary group-hover:translate-x-1 transition-transform" [class.rotate-180]="lang.isRTL()">→</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading()" class="flex flex-col items-center justify-center py-24">
             <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             <p class="mt-4 text-xs font-black uppercase tracking-widest text-gray-300">Synchronisation des produits...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading() && filteredProducts().length === 0" 
               class="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 animate-in fade-in zoom-in duration-700">
            <div class="text-6xl mb-6 grayscale opacity-20">🔎</div>
            <h3 class="text-xl font-black text-gray-900 mb-2">{{ lang.translate('shop.no_products') }}</h3>
            <p class="text-gray-400 font-medium italic mb-8">{{ lang.translate('shop.no_products_msg') }}</p>
            <button (click)="filterByGender(null); selectedCategory.set(null)" 
                    class="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-none cursor-pointer hover:bg-gray-200 transition-colors">
              {{ lang.translate('shop.reset_filters') }}
            </button>
          </div>

          <!-- Grid -->
          <div *ngIf="!loading() && filteredProducts().length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            <div *ngFor="let product of filteredProducts()" class="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden group relative">
               
               <!-- Gender Badge -->
               <div class="absolute top-3 left-3 z-30 pointer-events-none">
                 <div *ngIf="product.gender?.toLowerCase()?.trim() === 'homme'" 
                      class="bg-white/95 backdrop-blur-md text-primary w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border border-white/50">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="10" cy="14" r="5" /><path d="M14 10l6-6" /><path d="M14 4h6v6" />
                    </svg>
                 </div>
                 <div *ngIf="product.gender?.toLowerCase()?.trim() === 'femme'" 
                      class="bg-white/95 backdrop-blur-md text-terracotta w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border border-white/50">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="9" r="5" /><path d="M12 14v7" /><path d="M9 18h6" />
                    </svg>
                 </div>
               </div>

               <!-- Image -->
               <a [routerLink]="['/product', product._id]" class="block relative overflow-hidden h-44 no-underline group/img">
                 <img [src]="productService.getImageUrl(product.imageUrl)" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                 
                 <!-- Out of stock overlay -->
                 <div *ngIf="(product.stock || 0) === 0" class="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span class="bg-white/90 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {{ lang.translate('product.stock_finished') }}
                    </span>
                 </div>
               </a>

               <!-- Info -->
               <div class="p-5">
                 <div class="flex items-center justify-between mb-2">
                    <p class="text-[10px] uppercase font-black tracking-[0.2em] text-gray-300">{{ lang.translateCategory(product.category) }}</p>
                    
                    <!-- Stock badge -->
                    <span *ngIf="(product.stock || 0) > 0" 
                          [class]="(product.stock || 0) < 5 ? 'text-terracotta' : 'text-green-500'" 
                          class="text-[9px] font-bold uppercase tracking-tighter">
                      {{ lang.translate('product.stock_left') }} {{ product.stock }}
                    </span>
                 </div>
                 <a [routerLink]="['/product', product._id]" class="text-sm font-bold text-gray-900 hover:text-primary line-clamp-2 block mb-4 no-underline h-10">{{product.name}}</a>
                 <div class="flex items-center justify-between gap-2">
                   <span class="text-lg font-black text-primary whitespace-nowrap">{{product.price | number}} MRU</span>
                   <button (click)="addToCart($event, product)" 
                           [disabled]="(product.stock || 0) === 0"
                           class="w-10 h-10 bg-terracotta text-white rounded-xl flex items-center justify-center hover:bg-terracotta-dark transition-all shadow-lg shadow-terracotta/30 border-none cursor-pointer active:scale-95 group/btn disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed">
                     <svg class="h-5 w-5 transition-transform group-hover/btn:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/>
                     </svg>
                   </button>
                 </div>
               </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  `
})
export class HomeComponent implements OnInit {
  lang = inject(LanguageService);
  allProducts = signal<Product[]>([]);
  selectedCategory = signal<string | null>(null);
  selectedGender = signal<string | null>(null);
  categories = CATEGORIES;
  loading = signal(true);

  productService = inject(ProductService);
  cartService = inject(CartService);
  notificationService = inject(NotificationService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  filterByGender(gender: string | null) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { gender },
      queryParamsHandling: 'merge'
    });
  }

  filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    const prods = this.allProducts();
    if (cat) {
      return prods.filter(p => p.category === cat);
    }
    // Only show featured products as "Nos Pépites" if no category is selected
    return prods.filter(p => p.isFeatured);
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory.set(params['category'] || null);
      this.selectedGender.set(params['gender'] || null);

      if (params['gender'] || params['category'] || this.router.url.includes('/products')) {
        setTimeout(() => {
          document.getElementById('products-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    });

    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory.set(category);
    document.getElementById('products-list')?.scrollIntoView({ behavior: 'smooth' });
  }

  addToCart(event: Event, product: Product) {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addItem(product, 1);
    this.notificationService.show(`${product.name}: ${this.lang.translate('msg.added_to_cart')}`);
  }

  resetAndScroll() {
    this.selectedCategory.set(null);
    this.selectedGender.set(null);
    this.router.navigate(['/products'], { queryParams: {} });
    setTimeout(() => {
      document.getElementById('products-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}
