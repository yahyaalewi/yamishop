import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/ui/card.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { ProductService, Product } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 font-inter">Gestion des Produits</h1>
          <div class="flex bg-gray-100 p-1 rounded-xl gap-1 mt-2 w-fit">
            <button (click)="selectedGenderFilter.set(null)" 
                    [class]="!selectedGenderFilter() ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'"
                    class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer">
              Tous
            </button>
            <button (click)="selectedGenderFilter.set('homme')" 
                    [class]="selectedGenderFilter() === 'homme' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'"
                    class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer flex items-center gap-2">
              <span class="text-xs">♂</span> Homme
            </button>
            <button (click)="selectedGenderFilter.set('femme')" 
                    [class]="selectedGenderFilter() === 'femme' ? 'bg-white shadow text-pink-600' : 'text-gray-400 hover:text-gray-600'"
                    class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer flex items-center gap-2">
              <span class="text-xs">♀</span> Femme
            </button>
          </div>
        </div>
        <app-button variant="primary" size="md" (onClick)="showForm.set(true); currentProduct = null; resetForm()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Produit
        </app-button>
      </div>

      <!-- Add/Edit Form Overlay -->
      <div *ngIf="showForm()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border border-gray-100 animate-in fade-in zoom-in duration-300">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ currentProduct ? 'Modifier le produit' : 'Nouveau Produit' }}</h2>
            <button (click)="showForm.set(false)" class="w-8 h-8 rounded-full bg-gray-100/50 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-all border-none cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form (ngSubmit)="saveProduct()" class="space-y-4">
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nom du produit</label>
                <input type="text" name="name" [(ngModel)]="formData.name" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
                <select name="category" [(ngModel)]="formData.category" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none h-[42px]">
                  <option value="Mode">Mode</option>
                  <option value="Électronique">Électronique</option>
                  <option value="Beauté">Beauté</option>
                  <option value="Maison">Maison</option>
                  <option value="Accessoires">Accessoires</option>
                  <option value="Chaussures">Chaussures</option>
                  <option value="Parfum">Parfum</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Sexe / Genre</label>
                <div class="flex bg-gray-100 p-1 rounded-xl gap-1 h-[42px]">
                  <button type="button" 
                          (click)="setGender('homme')"
                          [class]="formGender() === 'homme' ? 'bg-white shadow text-primary ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'"
                          class="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer">
                    <span class="text-xs">♂</span> Homme
                  </button>
                  <button type="button" 
                          (click)="setGender('femme')"
                          [class]="formGender() === 'femme' ? 'bg-white shadow text-pink-600 ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'"
                          class="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer">
                    <span class="text-xs">♀</span> Femme
                  </button>
                  <button type="button" 
                          (click)="setGender('unisexe')"
                          [class]="formGender() === 'unisexe' ? 'bg-white shadow text-gray-900 ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'"
                          class="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer">
                    <span class="text-xs">⚧</span> Tous
                  </button>
                </div>
              </div>
            </div>

            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Prix (MRU)</label>
                <input type="number" name="price" [(ngModel)]="formData.price" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                <input type="number" name="stock" [(ngModel)]="formData.stock" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Frais de livraison (MRU)</label>
                <input type="number" name="shippingPrice" [(ngModel)]="formData.shippingPrice" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="Ex: 150">
                <p class="text-[10px] text-gray-400 mt-1">Le prix le plus élevé sera appliqué si plusieurs produits</p>
              </div>
            </div>

            <!-- Main Image + Gallery -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-700">Photos du produit</label>
              <p class="text-[10px] text-gray-400 -mt-2">La première photo est l'image principale. Ajoutez-en plusieurs pour les différentes couleurs.</p>

              <!-- Uploaded images grid -->
              <div class="flex flex-wrap gap-3">
                <!-- Existing images as thumbnails -->
                <div *ngFor="let img of formData.images; let i = index"
                     class="relative w-24 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 group"
                     [class.border-primary]="i === 0"
                     [class.border-gray-200]="i !== 0">
                  <img [src]="getImageUrl(img)" class="w-full h-full object-cover">
                  <!-- Main badge -->
                  <div *ngIf="i === 0" class="absolute bottom-0 left-0 right-0 bg-primary text-white text-[8px] font-black uppercase tracking-widest text-center py-0.5">
                    Principale
                  </div>
                  <!-- Set as main button (only for non-first images) -->
                  <button *ngIf="i !== 0" type="button" (click)="setMainImage(i)"
                          class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] font-black py-0.5 text-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    Principale
                  </button>
                  <!-- Remove button -->
                  <button type="button" (click)="removeImage(i)"
                          class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-md text-xs font-black">
                    ✕
                  </button>
                </div>

                <!-- Add image button -->
                <div class="relative w-24 h-24 flex-shrink-0">
                  <input type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden" id="productImage" #fileInput>
                  <label for="productImage"
                         class="w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                         [class.opacity-50]="uploading()" [class.pointer-events-none]="uploading()">
                    <svg *ngIf="!uploading()" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    <svg *ngIf="uploading()" class="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wide text-center leading-tight px-1">{{ uploading() ? '...' : 'Ajouter' }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea name="description" [(ngModel)]="formData.description" rows="3" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Caractéristiques techniques (une par ligne)</label>
              <textarea name="featuresText" [(ngModel)]="formData.featuresText" rows="2" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Ex: Résistant à l'eau..."></textarea>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Couleurs disponibles</label>
                <input type="text" name="colorsText" [(ngModel)]="formData.colorsText" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="Ex: Rouge, Bleu, Noir">
                <p class="text-[10px] text-gray-400 mt-1">Séparées par des virgules</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Tailles disponibles</label>
                <input type="text" name="sizesText" [(ngModel)]="formData.sizesText" class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" placeholder="Ex: S, M, L, XL ou 38, 40">
                <p class="text-[10px] text-gray-400 mt-1">Séparées par des virgules</p>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <input type="checkbox" name="isFeatured" [(ngModel)]="formData.isFeatured" id="isFeatured" class="w-5 h-5 accent-primary cursor-pointer">
              <label for="isFeatured" class="text-sm font-bold text-gray-900 cursor-pointer flex flex-col">
                <span class="flex items-center gap-2">🌟 {{ lang.isRTL() ? 'تمييز المنتج (Pépites)' : 'Mettre en avant (Nos Pépites)' }}</span>
                <span class="text-[10px] text-gray-500 font-medium italic">{{ lang.isRTL() ? 'سيظهر المنتج في الصفحة الرئيسية بشكل افتراضي' : 'Le produit apparaîtra sur la page d\'accueil par défaut' }}</span>
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <app-button variant="outline" type="button" (onClick)="showForm.set(false)">
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </app-button>
              <app-button variant="primary" type="submit" [disabled]="saving() || uploading()">
                <svg *ngIf="saving() || uploading()" class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <svg *ngIf="!saving() && !uploading()" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ uploading() ? 'Attente image...' : (saving() ? 'Enregistrement...' : 'Enregistrer') }}
              </app-button>
            </div>
          </form>
        </div>
      </div>

      <app-card>
        <!-- Desktop Table -->
        <div class="overflow-x-auto hidden md:block">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-gray-50 text-gray-700 font-medium border-b border-gray-100">
              <tr>
                <th class="px-6 py-4">Produit</th>
                <th class="px-6 py-4">Catégorie</th>
                <th class="px-6 py-4">Genre</th>
                <th class="px-6 py-4">Prix</th>
                <th class="px-6 py-4">Livraison</th>
                <th class="px-6 py-4">Stock</th>
                <th class="px-6 py-4 text-center">Pépites</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of filteredAdminProducts()" class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <img [src]="getImageUrl(product.imageUrl)" [alt]="product.name" class="w-full h-full object-cover">
                  </div>
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-900">{{product.name}}</span>
                    <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 w-fit mt-1">
                      {{ lang.translateCategory(product.category, 'fr') }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                    <p class="text-[10px] uppercase font-black tracking-[0.2em] text-gray-300">{{ lang.translateCategory(product.category, 'fr') }}</p>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div [class]="product.gender?.toLowerCase() === 'femme' ? 'bg-pink-100/50 text-pink-600 border-pink-200' : product.gender?.toLowerCase() === 'homme' ? 'bg-blue-100/50 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-400 border-gray-100'" 
                         class="w-8 h-8 border rounded-full font-black flex items-center justify-center shadow-sm" [title]="product.gender || 'Unisexe'">
                      <span *ngIf="product.gender?.toLowerCase() === 'homme'" class="text-sm">♂</span>
                      <span *ngIf="product.gender?.toLowerCase() === 'femme'" class="text-sm">♀</span>
                      <span *ngIf="product.gender?.toLowerCase() === 'unisexe'" class="text-sm">⚧</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 font-bold text-primary">{{product.price | number}} MRU</td>
                <td class="px-6 py-4">
                  <span class="py-1 px-3 rounded-full text-xs font-bold" [class]="(product.shippingPrice || 0) > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'">
                    {{(product.shippingPrice || 0) | number}} MRU
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span [class]="product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'" class="py-1 px-3 rounded-full text-xs font-bold">
                    {{product.stock > 0 ? product.stock + ' en stock' : 'Rupture'}}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span *ngIf="product.isFeatured" class="bg-yellow-50 text-yellow-600 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1 shadow-sm border border-yellow-100">
                    <span class="text-xs">✨</span> OUI
                  </span>
                  <span *ngIf="!product.isFeatured" class="text-[10px] font-black uppercase tracking-widest text-gray-200">NON</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button (click)="editProduct(product)" class="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all border-none bg-transparent cursor-pointer">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button (click)="deleteProduct(product._id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border-none bg-transparent cursor-pointer">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Mobile List -->
        <div class="md:hidden space-y-4">
          <div *ngFor="let product of filteredAdminProducts()" class="border border-gray-100 rounded-2xl p-4 flex gap-4 bg-white shadow-sm">
            <div class="relative flex-shrink-0">
              <img [src]="getImageUrl(product.imageUrl)" [alt]="product.name" class="w-20 h-20 rounded-xl object-cover">
              <!-- Gender Badge on image -->
              <div *ngIf="product.gender?.toLowerCase() === 'homme'"
                   class="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs border border-white shadow-sm">
                ♂
              </div>
              <div *ngIf="product.gender?.toLowerCase() === 'femme'"
                   class="absolute -top-1 -right-1 w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs border border-white shadow-sm">
                ♀
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-900 truncate">{{product.name}}</h4>
              <p class="text-[10px] text-gray-400 uppercase font-black mb-1">{{ lang.translateCategory(product.category, 'fr') }}</p>
              <p class="font-bold text-primary text-sm">{{product.price | number}} MRU</p>
              <p *ngIf="(product.shippingPrice || 0) > 0" class="text-[10px] text-blue-600 font-bold">🚚 Livraison: {{product.shippingPrice | number}} MRU</p>
              <div class="flex items-center justify-between mt-3">
                <span [class]="product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'" class="py-1 px-3 rounded-full text-[10px] font-bold">
                  {{product.stock > 0 ? product.stock + ' en stock' : 'Rupture'}}
                </span>
                <div class="flex gap-2">
                  <button (click)="editProduct(product)" class="p-2 text-primary hover:bg-primary/5 rounded-full transition-all border-none bg-transparent cursor-pointer">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button (click)="deleteProduct(product._id)" class="p-2 text-terracotta hover:bg-terracotta/5 rounded-full transition-all border-none bg-transparent cursor-pointer">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </app-card>
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  authService = inject(AuthService);
  productService = inject(ProductService);
  notificationService = inject(NotificationService);
  lang = inject(LanguageService);
  
  products = signal<Product[]>([]);
  selectedGenderFilter = signal<string | null>(null);
  filteredAdminProducts = computed(() => {
    const prods = this.products();
    const gender = this.selectedGenderFilter();
    if (!gender) return prods;
    return prods.filter(p => p.gender?.toLowerCase()?.trim() === gender.toLowerCase().trim());
  });
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  formGender = signal<string>('unisexe'); // Dedicated reactive signal for gender
  currentProduct: Product | null = null;
  formData: any = {
    name: '',
    category: 'Mode',
    price: 0,
    stock: 0,
    shippingPrice: 0,
    imageUrl: '',
    images: [] as string[],
    description: '',
    featuresText: '',
    colorsText: '',
    sizesText: '',
    isFeatured: false
  };
  uploading = signal(false);

  getImageUrl(url: string) {
    return this.productService.getImageUrl(url);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploading.set(true);
      this.productService.uploadImage(file).subscribe({
        next: (res) => {
          // Append new URL to the gallery
          if (!Array.isArray(this.formData.images)) this.formData.images = [];
          this.formData.images = [...this.formData.images, res.url];
          // Keep imageUrl always pointing to first image
          this.formData.imageUrl = this.formData.images[0];
          this.uploading.set(false);
          this.notificationService.show('Photo ajoutée avec succès');
          event.target.value = '';
        },
        error: (err) => {
          this.uploading.set(false);
          const errorMsg = err.error?.message || 'Erreur lors du téléchargement';
          this.notificationService.show(errorMsg, 'error');
          event.target.value = '';
        }
      });
    }
  }

  removeImage(index: number) {
    this.formData.images = this.formData.images.filter((_: string, i: number) => i !== index);
    this.formData.imageUrl = this.formData.images[0] || '';
  }

  setMainImage(index: number) {
    const imgs: string[] = [...this.formData.images];
    const [selected] = imgs.splice(index, 1);
    imgs.unshift(selected);
    this.formData.images = imgs;
    this.formData.imageUrl = imgs[0];
  }

  constructor() {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        // Normalize gender for UI consistency
        const normalizedData = data.map(p => ({
          ...p,
          gender: (p.gender?.toLowerCase()?.trim() || 'unisexe') as any
        }));
        this.products.set(normalizedData);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  resetForm() {
    this.formGender.set('unisexe');
    this.formData = {
      name: '',
      category: 'Mode',
      price: 0,
      stock: 0,
      shippingPrice: 0,
      imageUrl: '',
      images: [] as string[],
      description: '',
      featuresText: '',
      colorsText: '',
      sizesText: '',
      isFeatured: false
    };
  }

  editProduct(product: Product) {
    this.currentProduct = product;
    const g = (product.gender || 'unisexe').toLowerCase().trim();
    this.formGender.set(g);
    // Build images array: use existing images[] or fall back to [imageUrl]
    const imgs: string[] = (product.images && product.images.length > 0)
      ? [...product.images]
      : (product.imageUrl ? [product.imageUrl] : []);
    this.formData = { 
      ...product,
      images: imgs,
      featuresText: product.features && Array.isArray(product.features) ? product.features.join('\n') : '',
      colorsText: product.colors && Array.isArray(product.colors) ? product.colors.join(', ') : '',
      sizesText: product.sizes && Array.isArray(product.sizes) ? product.sizes.join(', ') : ''
    };
    this.showForm.set(true);
  }

  setGender(gender: string) {
    this.formGender.set(gender); // Use signal — always reactive
  }

  saveProduct() {
    this.saving.set(true);
    if (!this.formData.images || this.formData.images.length === 0) {
      this.notificationService.show('Veuillez ajouter au moins une photo', 'error');
      this.saving.set(false);
      return;
    }

    const productData = { 
      ...this.formData,
      imageUrl: this.formData.images[0], // Always sync imageUrl from gallery
      images: this.formData.images,
      gender: this.formGender(),
      features: this.formData.featuresText ? this.formData.featuresText.split('\n').filter((f: string) => f.trim().length > 0) : [],
      colors: this.formData.colorsText ? this.formData.colorsText.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0) : [],
      sizes: this.formData.sizesText ? this.formData.sizesText.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : []
    };

    if (this.currentProduct) {
      this.productService.updateProduct(this.currentProduct._id, productData).subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.selectedGenderFilter.set(null); // Reset filter so updated product is visible
          this.loadProducts();
          this.notificationService.show('Produit mis à jour');
        },
        error: () => {
          this.saving.set(false);
          this.notificationService.show('Erreur lors de la mise à jour', 'error');
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.selectedGenderFilter.set(null); // Reset filter so new product is visible
          this.loadProducts();
          this.notificationService.show('Produit ajouté avec succès');
        },
        error: () => {
          this.saving.set(false);
          this.notificationService.show('Erreur lors de la création', 'error');
        }
      });
    }
  }

  async deleteProduct(id: string) {
    const confirmed = await this.notificationService.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.');
    
    if (confirmed) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
          this.notificationService.show('Produit supprimé');
        },
        error: (err) => this.notificationService.show('Erreur lors de la suppression', 'error')
      });
    }
  }
}

