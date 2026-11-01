import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/ui/card.component';
import { ButtonComponent } from '../../components/ui/button.component';
import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, FormsModule],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-inter m-0">Gestion des Produits</h1>
          <!-- Gender Filters (Scrollable on small mobile screens) -->
          <div class="flex bg-slate-100 p-1 rounded-xl gap-1 mt-2.5 w-full sm:w-fit overflow-x-auto">
            <button (click)="selectedGenderFilter.set(null)" 
                    [class]="!selectedGenderFilter() ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400 hover:text-slate-600'"
                    class="px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border-none cursor-pointer shrink-0">
              Tous
            </button>
            <button (click)="selectedGenderFilter.set('homme')" 
                    [class]="selectedGenderFilter() === 'homme' ? 'bg-white shadow-xs text-primary' : 'text-slate-400 hover:text-slate-600'"
                    class="px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center gap-1.5 shrink-0">
              <span class="text-xs">♂</span> Homme
            </button>
            <button (click)="selectedGenderFilter.set('femme')" 
                    [class]="selectedGenderFilter() === 'femme' ? 'bg-white shadow-xs text-pink-600' : 'text-slate-400 hover:text-slate-600'"
                    class="px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center gap-1.5 shrink-0">
              <span class="text-xs">♀</span> Femme
            </button>
          </div>
        </div>
        <div class="w-full sm:w-auto">
          <button (click)="showForm.set(true); currentProduct = null; resetForm()"
                  class="w-full sm:w-auto px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-light shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 border-none cursor-pointer active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nouveau Produit</span>
          </button>
        </div>
      </div>

      <!-- Add/Edit Form Overlay (Bottom sheet on mobile, centered modal on laptop) -->
      <div *ngIf="showForm()" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
        <div class="bg-white rounded-t-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-100 animate-in fade-in slide-in-from-bottom duration-300 overflow-hidden">
          
          <!-- Sticky Modal Header -->
          <div class="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
            <h2 class="text-lg sm:text-2xl font-black text-slate-900 tracking-tight m-0">{{ currentProduct ? 'Modifier le produit' : 'Nouveau Produit' }}</h2>
            <button (click)="showForm.set(false)" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-all border-none cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Scrollable Form Body -->
          <form id="productForm" (ngSubmit)="saveProduct()" class="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
              <div class="sm:col-span-2 md:col-span-1">
                <label class="block text-xs font-bold text-slate-700 mb-1">Nom du produit</label>
                <input type="text" name="name" [(ngModel)]="formData.name" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
                <select name="category" [(ngModel)]="formData.category" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none h-[42px] text-sm font-medium bg-white">
                  <option *ngFor="let cat of categories()" [value]="cat.name">{{ lang.translateCategory(cat.name, 'fr') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Sexe / Genre</label>
                <div class="flex bg-slate-100 p-1 rounded-xl gap-1 h-[42px]">
                  <button type="button" 
                          (click)="setGender('homme')"
                          [class]="formGender() === 'homme' ? 'bg-white shadow text-primary ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'"
                          class="flex-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all border-none cursor-pointer">
                    <span class="text-xs">♂</span> Homme
                  </button>
                  <button type="button" 
                          (click)="setGender('femme')"
                          [class]="formGender() === 'femme' ? 'bg-white shadow text-pink-600 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'"
                          class="flex-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all border-none cursor-pointer">
                    <span class="text-xs">♀</span> Femme
                  </button>
                  <button type="button" 
                          (click)="setGender('unisexe')"
                          [class]="formGender() === 'unisexe' ? 'bg-white shadow text-slate-900 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'"
                          class="flex-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all border-none cursor-pointer">
                    <span>Tous</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Prix (MRU)</label>
                <input type="number" name="price" [(ngModel)]="formData.price" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-bold">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Stock</label>
                <input type="number" name="stock" [(ngModel)]="formData.stock" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-bold">
              </div>
              <div class="col-span-2 md:col-span-1">
                <label class="block text-xs font-bold text-slate-700 mb-1">Frais de livraison (MRU)</label>
                <input type="number" name="shippingPrice" [(ngModel)]="formData.shippingPrice" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder="Ex: 150">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Étoiles (Note / 5)</label>
              <input type="number" step="0.1" min="0" max="5" name="rating" [(ngModel)]="formData.rating" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder="Ex: 4.5">
            </div>

            <!-- Photos Gallery -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-700 m-0">Photos du produit</label>
              <p class="text-[10px] text-slate-400 m-0">La première photo est l'image principale visible dans le catalogue.</p>

              <div class="flex flex-wrap gap-2.5 pt-1">
                <div *ngFor="let img of formData.images; let i = index"
                     class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 group bg-slate-50"
                     [class.border-primary]="i === 0"
                     [class.border-slate-200]="i !== 0">
                  <img [src]="getImageUrl(img)" class="w-full h-full object-cover">
                  <div *ngIf="i === 0" class="absolute bottom-0 left-0 right-0 bg-primary text-white text-[8px] font-black uppercase tracking-wider text-center py-0.5">
                    Principale
                  </div>
                  <button *ngIf="i !== 0" type="button" (click)="setMainImage(i)"
                          class="absolute bottom-0 left-0 right-0 bg-slate-900/80 text-white text-[8px] font-black py-0.5 text-center border-none cursor-pointer">
                    Définir
                  </button>
                  <button type="button" (click)="removeImage(i)"
                          class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center border-none cursor-pointer shadow-md text-xs font-black">
                    ✕
                  </button>
                </div>

                <div class="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                  <input type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden" id="productImage" #fileInput>
                  <label for="productImage"
                         class="w-full h-full rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                         [class.opacity-50]="uploading()" [class.pointer-events-none]="uploading()">
                    <svg *ngIf="!uploading()" class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    <svg *ngIf="uploading()" class="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide text-center leading-tight px-1">{{ uploading() ? '...' : '+ Photo' }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea name="description" [(ngModel)]="formData.description" rows="2" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium resize-none"></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Caractéristiques techniques (une par ligne)</label>
              <textarea name="featuresText" [(ngModel)]="formData.featuresText" rows="2" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium resize-none" placeholder="Ex: 100% Coton, Lavable en machine..."></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Couleurs disponibles</label>
                <input type="text" name="colorsText" [(ngModel)]="formData.colorsText" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder="Ex: Rouge, Bleu, Noir">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Tailles disponibles</label>
                <input type="text" name="sizesText" [(ngModel)]="formData.sizesText" class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium" placeholder="Ex: S, M, L, XL ou 38, 40">
              </div>
            </div>

            <div *ngIf="authService.isAdmin()" class="flex items-center gap-3 bg-primary/5 p-3.5 rounded-2xl border border-primary/10">
              <input type="checkbox" name="isFeatured" [(ngModel)]="formData.isFeatured" id="isFeatured" class="w-5 h-5 accent-primary cursor-pointer">
              <label for="isFeatured" class="text-xs font-bold text-slate-900 cursor-pointer flex flex-col">
                <span class="flex items-center gap-1.5">🌟 Mettre en avant (Nos Pépites)</span>
                <span class="text-[10px] text-slate-400 font-medium">Le produit apparaîtra en premier sur la page d'accueil</span>
              </label>
            </div>
          </form>

          <!-- Sticky Modal Footer (Always visible without having to scroll down!) -->
          <div class="p-3.5 sm:p-5 border-t border-slate-100 bg-white flex justify-end gap-2.5 shrink-0">
            <button type="button" (click)="showForm.set(false)" class="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent">
              Annuler
            </button>
            <button type="submit" form="productForm" [disabled]="saving() || uploading()" class="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-light shadow-md shadow-primary/20 transition-all border-none cursor-pointer flex items-center gap-2 disabled:opacity-50">
              <svg *ngIf="saving() || uploading()" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>{{ uploading() ? 'Attente image...' : (saving() ? 'Enregistrement...' : 'Enregistrer le produit') }}</span>
            </button>
          </div>

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
                  <button *ngIf="authService.isAdmin()" (click)="toggleFeatured(product)"
                          [title]="product.isFeatured ? 'Retirer de Nos Pépites' : 'Ajouter à Nos Pépites'"
                          class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 border cursor-pointer transition-all shadow-sm active:scale-95"
                          [class]="product.isFeatured ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'">
                    <span>{{ product.isFeatured ? '✨ PÉPITE' : '☆ NORMAL' }}</span>
                  </button>
                  <span *ngIf="!authService.isAdmin() && product.isFeatured" class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200">
                    ✨ PÉPITE
                  </span>
                  <span *ngIf="!authService.isAdmin() && !product.isFeatured" class="text-xs text-gray-400 font-medium">—</span>
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
                <div class="flex items-center gap-1">
                  <button (click)="toggleFeatured(product)"
                          class="px-2 py-1 rounded-lg text-[9px] font-black uppercase border cursor-pointer transition-all"
                          [class]="product.isFeatured ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'">
                    {{ product.isFeatured ? '✨ Pépite' : '☆ Normal' }}
                  </button>
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
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  lang = inject(LanguageService);
  
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  showCategoryModal = signal(false);
  newCategoryName = '';
  newCategoryImage = '';
  addingCategory = signal(false);
  editingCategoryId = signal<string | null>(null);
  uploadingCategoryImage = signal(false);

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
    rating: 0,
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
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        if (cats.length > 0 && !this.formData.category) {
          this.formData.category = cats[0].name;
        }
      },
      error: () => {}
    });
  }

  onCategoryImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadingCategoryImage.set(true);
      this.productService.uploadImage(file).subscribe({
        next: (res: any) => {
          console.log('Upload response:', res);
          // Handle both { url: '...' } and { data: '...' } or string responses
          const imageUrl = typeof res === 'string' ? res : (res.url || res.data || res.imageUrl);
          if (imageUrl) {
            this.newCategoryImage = imageUrl;
            this.notificationService.show('Image téléversée avec succès');
          } else {
            this.notificationService.show('Réponse d\'envoi invalide', 'error');
          }
          this.uploadingCategoryImage.set(false);
          event.target.value = '';
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.uploadingCategoryImage.set(false);
          const errorMsg = err.error?.message || err.message || 'Erreur lors du téléchargement de l\'image';
          this.notificationService.show(errorMsg, 'error');
          event.target.value = '';
        }
      });
    }
  }

  startEditCategory(category: Category) {
    if (category._id) {
      this.editingCategoryId.set(category._id);
      this.newCategoryName = category.name;
      this.newCategoryImage = category.image || '';
    }
  }

  cancelEditCategory() {
    this.editingCategoryId.set(null);
    this.newCategoryName = '';
    this.newCategoryImage = '';
  }

  saveCategory() {
    if (!this.newCategoryName || !this.newCategoryName.trim()) {
      this.notificationService.show('Veuillez entrer un nom de catégorie', 'error');
      return;
    }
    this.addingCategory.set(true);

    const editId = this.editingCategoryId();
    if (editId) {
      this.categoryService.updateCategory(editId, {
        name: this.newCategoryName.trim(),
        image: this.newCategoryImage.trim()
      }).subscribe({
        next: () => {
          this.addingCategory.set(false);
          this.cancelEditCategory();
          this.loadCategories();
          this.notificationService.show('Catégorie mise à jour avec succès');
        },
        error: (err) => {
          this.addingCategory.set(false);
          const msg = err.error?.message || 'Erreur lors de la mise à jour';
          this.notificationService.show(msg, 'error');
        }
      });
    } else {
      this.categoryService.createCategory({
        name: this.newCategoryName.trim(),
        image: this.newCategoryImage.trim()
      }).subscribe({
        next: () => {
          this.addingCategory.set(false);
          this.cancelEditCategory();
          this.loadCategories();
          this.notificationService.show('Catégorie ajoutée avec succès');
        },
        error: (err) => {
          this.addingCategory.set(false);
          const msg = err.error?.message || 'Erreur lors de la création de la catégorie';
          this.notificationService.show(msg, 'error');
        }
      });
    }
  }

  async removeCategory(id?: string) {
    if (!id) return;
    const confirmed = await this.notificationService.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?');
    if (confirmed) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
          this.notificationService.show('Catégorie supprimée');
        },
        error: (err) => {
          const msg = err.error?.message || 'Erreur lors de la suppression';
          this.notificationService.show(msg, 'error');
        }
      });
    }
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

  toggleFeatured(product: Product) {
    if (!this.authService.isAdmin()) {
      this.notificationService.show('Seul le Super Admin peut mettre en avant un produit', 'error');
      return;
    }
    const newStatus = !product.isFeatured;
    this.productService.updateProduct(product._id, { isFeatured: newStatus }).subscribe({
      next: () => {
        product.isFeatured = newStatus;
        this.products.update(prods => 
          prods.map(p => p._id === product._id ? { ...p, isFeatured: newStatus } : p)
        );
        const msg = newStatus 
          ? `"${product.name}" ajouté à Nos Pépites ! ✨` 
          : `"${product.name}" retiré de Nos Pépites.`;
        this.notificationService.show(msg);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Erreur lors du changement de statut Pépite';
        this.notificationService.show(errorMsg, 'error');
      }
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
      rating: 0,
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
      rating: product.rating || 0,
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
      rating: Number(this.formData.rating) || 0,
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
        error: (err: any) => {
          this.saving.set(false);
          const msg = err.error?.message || err.error?.error || 'Erreur lors de la mise à jour';
          this.notificationService.show(msg, 'error');
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
        error: (err: any) => {
          this.saving.set(false);
          const msg = err.error?.message || err.error?.error || 'Erreur lors de la création';
          this.notificationService.show(msg, 'error');
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

