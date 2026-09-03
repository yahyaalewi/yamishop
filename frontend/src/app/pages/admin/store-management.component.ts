import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/ui/card.component';
import { StoreService, Store, StoreStats, CreateStorePayload } from '../../services/store.service';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-store-management',
  standalone: true,
  imports: [CommonModule, CardComponent, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight font-inter">Gestion des Boutiques</h1>
          <p class="text-sm text-gray-500 font-medium mt-1">Créez, gérez et supervisez toutes les boutiques de Yamishop.</p>
        </div>
        <button (click)="openAddModal()"
                class="px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2 border-none cursor-pointer">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une boutique
        </button>
      </div>

      <!-- Toolbar -->
      <app-card class="mb-8">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
          <!-- Search -->
          <div class="flex-1 relative w-full">
            <svg class="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text"
                   [(ngModel)]="searchQuery"
                   placeholder="Rechercher une boutique..."
                   class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium transition-all">
          </div>

          <!-- Status filter -->
          <div class="flex items-center gap-2 shrink-0">
            <button (click)="filterStatus = 'all'"
                    [class]="filterStatus === 'all' ? 'px-4 py-2 bg-primary text-white rounded-xl text-xs font-black border-none cursor-pointer' : 'px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-black border-none cursor-pointer hover:bg-gray-200'">
              Toutes
            </button>
            <button (click)="filterStatus = 'active'"
                    [class]="filterStatus === 'active' ? 'px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black border-none cursor-pointer' : 'px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-black border-none cursor-pointer hover:bg-gray-200'">
              Actives
            </button>
            <button (click)="filterStatus = 'inactive'"
                    [class]="filterStatus === 'inactive' ? 'px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black border-none cursor-pointer' : 'px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-black border-none cursor-pointer hover:bg-gray-200'">
              Inactives
            </button>
          </div>

          <!-- Count -->
          <div class="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2 shrink-0">
            <span class="text-primary font-black text-lg">{{ filteredStores().length }}</span>
            <span class="text-[10px] font-black text-primary/70 uppercase tracking-widest">Boutiques au total</span>
          </div>
        </div>
      </app-card>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading() && filteredStores().length === 0" class="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div class="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🏪</div>
        <h3 class="text-lg font-bold text-gray-800">Aucune boutique trouvée</h3>
        <p class="text-sm text-gray-500 mt-1">Commencez par créer votre première boutique.</p>
        <button (click)="openAddModal()" class="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl border-none cursor-pointer">
          Ajouter une boutique
        </button>
      </div>

      <!-- Table -->
      <div *ngIf="!loading() && filteredStores().length > 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Boutique</th>
                <th class="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Contact</th>
                <th class="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Adresse</th>
                <th class="text-center px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                <th class="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let store of paginatedStores()"
                  class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                <!-- Logo + Name -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                      <img *ngIf="store.logo" [src]="getImageUrl(store.logo)" [alt]="store.name" class="w-full h-full object-cover">
                      <span *ngIf="!store.logo" class="text-gray-400 text-xl font-black">{{ store.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                      <p class="font-bold text-gray-900">{{ store.name }}</p>
                      <p class="text-xs text-gray-400 mt-0.5 line-clamp-1">{{ store.description || '—' }}</p>
                    </div>
                  </div>
                </td>
                <!-- Contact -->
                <td class="px-6 py-4 hidden md:table-cell">
                  <p class="font-medium text-gray-700 text-xs">{{ store.email || '—' }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ store.phone || '—' }}</p>
                </td>
                <!-- Address -->
                <td class="px-6 py-4 hidden lg:table-cell">
                  <p class="text-xs text-gray-500 max-w-[180px] line-clamp-2">{{ store.address || '—' }}</p>
                </td>
                <!-- Status -->
                <td class="px-6 py-4 text-center">
                  <button (click)="toggleStatus(store)"
                          [class]="store.status === 'active'
                            ? 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-black border-none cursor-pointer hover:bg-emerald-100 transition-colors'
                            : 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[11px] font-black border-none cursor-pointer hover:bg-red-100 transition-colors'">
                    <span class="w-2 h-2 rounded-full" [class]="store.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'"></span>
                    {{ store.status === 'active' ? 'Actif' : 'Inactif' }}
                  </button>
                </td>
                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Stats -->
                    <button (click)="openStatsModal(store)"
                            class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border-none cursor-pointer"
                            title="Voir les statistiques">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </button>
                    <!-- Reset password -->
                    <button (click)="openResetPasswordModal(store)"
                            class="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors border-none cursor-pointer"
                            title="Réinitialiser le mot de passe">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                      </svg>
                    </button>
                    <!-- Edit -->
                    <button (click)="openEditModal(store)"
                            class="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors border-none cursor-pointer"
                            title="Modifier">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <!-- Delete -->
                    <button (click)="removeStore(store._id!)"
                            class="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border-none cursor-pointer"
                            title="Supprimer">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages() > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p class="text-xs text-gray-500 font-medium">
            Page {{ currentPage() }} sur {{ totalPages() }} — {{ filteredStores().length }} boutiques
          </p>
          <div class="flex items-center gap-2">
            <button (click)="prevPage()"
                    [disabled]="currentPage() === 1"
                    class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border-none cursor-pointer hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Précédent
            </button>
            <button *ngFor="let p of pageNumbers()"
                    (click)="goToPage(p)"
                    [class]="p === currentPage()
                      ? 'px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold border-none cursor-pointer'
                      : 'px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border-none cursor-pointer hover:bg-gray-200'">
              {{ p }}
            </button>
            <button (click)="nextPage()"
                    [disabled]="currentPage() === totalPages()"
                    class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border-none cursor-pointer hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Suivant →
            </button>
          </div>
        </div>
      </div>

      <!-- ─── ADD / EDIT MODAL ─────────────────────────────────────────────── -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-2xl p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">
              {{ editingStoreId() ? 'Modifier la Boutique' : 'Nouvelle Boutique' }}
            </h2>
            <button (click)="closeModal()" class="w-8 h-8 rounded-full bg-gray-100/50 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-all border-none cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Section: Infos boutique -->
            <p class="text-[10px] font-black text-primary uppercase tracking-widest">Informations de la Boutique</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nom de la boutique *</label>
                <input type="text" [(ngModel)]="form.name" placeholder="Ex: YamiMode, TechZone..."
                       class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm">
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email</label>
                <input type="email" [(ngModel)]="form.email" placeholder="contact@boutique.com"
                       class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Téléphone</label>
                <input type="text" [(ngModel)]="form.phone" placeholder="Ex: +222 XX XX XX XX"
                       class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Statut</label>
                <select [(ngModel)]="form.status"
                        class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-bold">
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Adresse</label>
              <input type="text" [(ngModel)]="form.address" placeholder="Ex: Rue principale, Nouakchott"
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Description</label>
              <textarea [(ngModel)]="form.description" placeholder="Description de la boutique..." rows="2"
                        class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium resize-none"></textarea>
            </div>

            <!-- Logo upload -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Logo</label>
              <div class="flex gap-2 items-center">
                <input type="text" [(ngModel)]="form.logo" placeholder="URL du logo"
                       class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold">
                <input type="file" #logoInput (change)="onLogoSelected($event)" accept="image/*" class="hidden">
                <button type="button" (click)="logoInput.click()"
                        class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border border-gray-200">
                  <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  <span>{{ uploadingLogo() ? 'Upload...' : 'Photo' }}</span>
                </button>
              </div>
              <!-- Logo preview -->
              <div *ngIf="form.logo" class="mt-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                  <img [src]="getImageUrl(form.logo)" class="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0">
                  <span class="text-xs text-gray-500 font-medium truncate">{{ form.logo }}</span>
                </div>
                <button (click)="form.logo = ''" class="text-red-500 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded-lg border-none cursor-pointer shrink-0">Retirer</button>
              </div>
            </div>

            <!-- Section: Admin account (shown only for create) -->
            <div *ngIf="!editingStoreId()" class="pt-4 border-t border-gray-100 space-y-4">
              <p class="text-[10px] font-black text-primary uppercase tracking-widest">Compte Administrateur de Boutique</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nom de l'administrateur</label>
                  <input type="text" [(ngModel)]="form.adminName" placeholder="Ex: Ahmed Ould Sidi"
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Téléphone de connexion *</label>
                  <input type="text" [(ngModel)]="form.adminPhone" placeholder="Ex: +22236123456"
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email admin</label>
                  <input type="email" [(ngModel)]="form.adminEmail" placeholder="admin@boutique.com"
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Mot de passe *</label>
                  <input type="password" [(ngModel)]="form.adminPassword" placeholder="Mot de passe sécurisé"
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 justify-end pt-4">
              <button (click)="closeModal()" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all border-none cursor-pointer">
                Annuler
              </button>
              <button (click)="saveStore()"
                      [disabled]="submitting() || uploadingLogo()"
                      class="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all border-none cursor-pointer disabled:opacity-50">
                {{ submitting() ? 'Enregistrement...' : (editingStoreId() ? 'Mettre à jour' : 'Créer la boutique') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── STATS MODAL ──────────────────────────────────────────────────── -->
      <div *ngIf="showStatsModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-2xl p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-2xl font-black text-gray-900 tracking-tight">Statistiques</h2>
              <p class="text-sm text-gray-400 font-medium mt-1">{{ selectedStore()?.name }}</p>
            </div>
            <button (click)="closeStatsModal()" class="w-8 h-8 rounded-full bg-gray-100/50 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-all border-none cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div *ngIf="loadingStats()" class="flex justify-center items-center py-10">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>

          <div *ngIf="!loadingStats() && storeStats()" class="space-y-6">
            <!-- KPI Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                <p class="text-2xl font-black text-blue-600">{{ storeStats()!.totalProducts }}</p>
                <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Produits</p>
              </div>
              <div class="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
                <p class="text-2xl font-black text-purple-600">{{ storeStats()!.totalOrders }}</p>
                <p class="text-[10px] font-black text-purple-400 uppercase tracking-widest mt-1">Commandes</p>
              </div>
              <div class="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
                <p class="text-2xl font-black text-emerald-600">{{ storeStats()!.revenue | number:'1.0-0' }} MRU</p>
                <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Chiffre d'affaires</p>
              </div>
              <div class="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100">
                <p class="text-2xl font-black text-amber-600">{{ storeStats()!.totalCustomers }}</p>
                <p class="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-1">Clients</p>
              </div>
            </div>

            <!-- Orders breakdown -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex items-center gap-4">
                <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <p class="text-xl font-black text-orange-600">{{ storeStats()!.pendingOrders }}</p>
                  <p class="text-[10px] font-black text-orange-400 uppercase tracking-widest">En attente</p>
                </div>
              </div>
              <div class="bg-teal-50 rounded-2xl p-4 border border-teal-100 flex items-center gap-4">
                <div class="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <p class="text-xl font-black text-teal-600">{{ storeStats()!.deliveredOrders }}</p>
                  <p class="text-[10px] font-black text-teal-400 uppercase tracking-widest">Livrées</p>
                </div>
              </div>
            </div>

            <!-- Top products -->
            <div *ngIf="storeStats()!.topProducts?.length">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Produits les plus vendus</p>
              <div class="space-y-2">
                <div *ngFor="let p of storeStats()!.topProducts; let i = index"
                     class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span class="w-6 h-6 rounded-lg bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">{{ i + 1 }}</span>
                  <img [src]="getImageUrl(p.imageUrl)" [alt]="p.name" class="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0">
                  <p class="text-sm font-bold text-gray-800 flex-1 truncate">{{ p.name }}</p>
                  <p class="text-sm font-black text-primary shrink-0">{{ p.price }} MRU</p>
                </div>
              </div>
            </div>
            <p *ngIf="!storeStats()!.topProducts?.length" class="text-sm text-gray-400 text-center py-4">Aucune vente enregistrée.</p>
          </div>
        </div>
      </div>

      <!-- ─── RESET PASSWORD MODAL ─────────────────────────────────────────── -->
      <div *ngIf="showResetModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md p-6 border border-gray-100">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-black text-gray-900 tracking-tight">Réinitialiser le mot de passe</h2>
            <button (click)="closeResetModal()" class="w-8 h-8 rounded-full bg-gray-100/50 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-all border-none cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <p class="text-sm text-gray-500 mb-4">Définir un nouveau mot de passe pour l'administrateur de <strong>{{ selectedStore()?.name }}</strong>.</p>
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nouveau mot de passe *</label>
            <input type="password" [(ngModel)]="newPassword" placeholder="Minimum 6 caractères"
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm">
          </div>
          <div class="flex gap-3 justify-end pt-4">
            <button (click)="closeResetModal()" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all border-none cursor-pointer">
              Annuler
            </button>
            <button (click)="doResetPassword()"
                    [disabled]="submitting()"
                    class="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all border-none cursor-pointer disabled:opacity-50">
              {{ submitting() ? 'En cours...' : 'Réinitialiser' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class StoreManagementComponent implements OnInit {
  private storeService = inject(StoreService);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);

  stores = signal<Store[]>([]);
  loading = signal<boolean>(true);
  searchQuery = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  // Pagination
  currentPage = signal<number>(1);
  readonly pageSize = 10;

  // Add/Edit modal
  showModal = signal<boolean>(false);
  editingStoreId = signal<string | null>(null);
  submitting = signal<boolean>(false);
  uploadingLogo = signal<boolean>(false);
  form: CreateStorePayload & { adminName?: string; adminEmail?: string; adminPhone?: string; adminPassword?: string } = this.emptyForm();

  // Stats modal
  showStatsModal = signal<boolean>(false);
  selectedStore = signal<Store | null>(null);
  storeStats = signal<StoreStats | null>(null);
  loadingStats = signal<boolean>(false);

  // Reset password modal
  showResetModal = signal<boolean>(false);
  newPassword = '';

  filteredStores = computed(() => {
    let list = this.stores();
    const q = this.searchQuery.toLowerCase().trim();
    if (q) list = list.filter(s => s.name.toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q) || (s.phone || '').includes(q));
    if (this.filterStatus !== 'all') list = list.filter(s => s.status === this.filterStatus);
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredStores().length / this.pageSize)));

  paginatedStores = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredStores().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  ngOnInit() {
    this.loadStores();
  }

  loadStores() {
    this.loading.set(true);
    this.storeService.getStores().subscribe({
      next: (stores) => {
        this.stores.set(stores);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Erreur lors du chargement des boutiques', 'error');
        this.loading.set(false);
      }
    });
  }

  getImageUrl(src: string): string {
    return this.productService.getImageUrl(src);
  }

  emptyForm(): CreateStorePayload & { adminName?: string; adminEmail?: string; adminPhone?: string; adminPassword?: string } {
    return { name: '', logo: '', description: '', address: '', phone: '', email: '', status: 'active', adminName: '', adminEmail: '', adminPhone: '', adminPassword: '' };
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  goToPage(p: number) { this.currentPage.set(p); }
  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  // ── Add/Edit modal ────────────────────────────────────────────────────────
  openAddModal() {
    this.editingStoreId.set(null);
    this.form = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(store: Store) {
    if (!store._id) return;
    this.editingStoreId.set(store._id);
    this.form = {
      name: store.name,
      logo: store.logo || '',
      description: store.description || '',
      address: store.address || '',
      phone: store.phone || '',
      email: store.email || '',
      status: store.status,
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingStoreId.set(null);
    this.form = this.emptyForm();
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadingLogo.set(true);
      this.productService.uploadImage(file).subscribe({
        next: (res: any) => {
          const url = typeof res === 'string' ? res : (res.url || res.imageUrl);
          if (url) {
            this.form.logo = url;
            this.notificationService.show('Logo téléversé avec succès');
          } else {
            this.notificationService.show('Réponse d\'envoi invalide', 'error');
          }
          this.uploadingLogo.set(false);
          event.target.value = '';
        },
        error: (err: any) => {
          this.uploadingLogo.set(false);
          this.notificationService.show(err.error?.message || 'Erreur lors du téléchargement', 'error');
          event.target.value = '';
        }
      });
    }
  }

  saveStore() {
    if (!this.form.name || !this.form.name.trim()) {
      this.notificationService.show('Veuillez entrer un nom de boutique', 'error');
      return;
    }

    this.submitting.set(true);
    const editId = this.editingStoreId();

    if (editId) {
      this.storeService.updateStore(editId, {
        name: this.form.name.trim(),
        logo: this.form.logo || '',
        description: this.form.description || '',
        address: this.form.address || '',
        phone: this.form.phone || '',
        email: this.form.email || '',
        status: this.form.status,
      }).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.loadStores();
          this.notificationService.show('Boutique mise à jour avec succès');
        },
        error: (err: any) => {
          this.submitting.set(false);
          this.notificationService.show(err.error?.message || 'Erreur lors de la mise à jour', 'error');
        }
      });
    } else {
      this.storeService.createStore(this.form).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.loadStores();
          this.notificationService.show('Boutique créée avec succès');
        },
        error: (err: any) => {
          this.submitting.set(false);
          this.notificationService.show(err.error?.message || 'Erreur lors de la création', 'error');
        }
      });
    }
  }

  async removeStore(id: string) {
    const confirmed = await this.notificationService.confirm('Êtes-vous sûr de vouloir supprimer cette boutique ? Le compte administrateur sera également supprimé.');
    if (confirmed) {
      this.storeService.deleteStore(id).subscribe({
        next: () => {
          this.loadStores();
          this.notificationService.show('Boutique supprimée avec succès');
        },
        error: (err: any) => {
          this.notificationService.show(err.error?.message || 'Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  toggleStatus(store: Store) {
    if (!store._id) return;
    this.storeService.toggleStoreStatus(store._id).subscribe({
      next: (updated) => {
        this.stores.update(list => list.map(s => s._id === updated._id ? updated : s));
        this.notificationService.show(`Boutique ${updated.status === 'active' ? 'activée' : 'désactivée'}`);
      },
      error: (err: any) => {
        this.notificationService.show(err.error?.message || 'Erreur lors du changement de statut', 'error');
      }
    });
  }

  // ── Stats modal ───────────────────────────────────────────────────────────
  openStatsModal(store: Store) {
    this.selectedStore.set(store);
    this.storeStats.set(null);
    this.loadingStats.set(true);
    this.showStatsModal.set(true);
    this.storeService.getStoreStats(store._id!).subscribe({
      next: (stats) => {
        this.storeStats.set(stats);
        this.loadingStats.set(false);
      },
      error: () => {
        this.loadingStats.set(false);
        this.notificationService.show('Erreur lors du chargement des statistiques', 'error');
      }
    });
  }

  closeStatsModal() {
    this.showStatsModal.set(false);
    this.selectedStore.set(null);
    this.storeStats.set(null);
  }

  // ── Reset password modal ──────────────────────────────────────────────────
  openResetPasswordModal(store: Store) {
    this.selectedStore.set(store);
    this.newPassword = '';
    this.showResetModal.set(true);
  }

  closeResetModal() {
    this.showResetModal.set(false);
    this.selectedStore.set(null);
    this.newPassword = '';
  }

  doResetPassword() {
    const store = this.selectedStore();
    if (!store?._id) return;
    if (!this.newPassword || this.newPassword.length < 6) {
      this.notificationService.show('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }
    this.submitting.set(true);
    this.storeService.resetStoreAdminPassword(store._id, this.newPassword).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeResetModal();
        this.notificationService.show('Mot de passe réinitialisé avec succès');
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.notificationService.show(err.error?.message || 'Erreur lors de la réinitialisation', 'error');
      }
    });
  }
}
