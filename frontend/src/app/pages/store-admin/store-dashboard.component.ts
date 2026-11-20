import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreService, Store, StoreStats } from '../../services/store.service';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto pb-12">

      <!-- ======================================================== -->
      <!-- TOP NAVIGATION BAR & TABS SELECTOR                       -->
      <!-- ======================================================== -->
      <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Store Identity & Greeting -->
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl sm:text-2xl font-black shrink-0 shadow-md shadow-emerald-500/20 overflow-hidden border border-emerald-400/20">
            <img *ngIf="store()?.logo" [src]="getImageUrl(store()!.logo!)" [alt]="store()?.name" class="w-full h-full object-cover">
            <span *ngIf="!store()?.logo">{{ store()?.name?.charAt(0)?.toUpperCase() || '🏪' }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-lg sm:text-xl font-extrabold text-slate-900 m-0 truncate">{{ store()?.name || 'Ma Boutique' }}</h1>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
            <p class="text-xs text-slate-400 font-medium m-0 mt-0.5 truncate">
              Bonjour, <span class="text-slate-700 font-semibold">{{ adminName() }}</span> 👋
            </p>
          </div>
        </div>

        <!-- Navigation Tabs (Dashboard vs Profile) -->
        <div class="flex items-center gap-2 self-stretch md:self-auto">
          <div class="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 flex-1 md:flex-initial">
            <button (click)="activeTab.set('dashboard')"
              [ngClass]="activeTab() === 'dashboard' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900 font-bold'"
              class="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs transition-all border-none cursor-pointer flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <span>Tableau de Bord</span>
            </button>

            <button (click)="activeTab.set('profile')"
              [ngClass]="activeTab() === 'profile' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900 font-bold'"
              class="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs transition-all border-none cursor-pointer flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Profil Boutique</span>
            </button>
          </div>

          <!-- Public Store Link -->
          <a *ngIf="store()?._id" 
             [routerLink]="['/store', store()?._id]" 
             target="_blank"
             class="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold border border-emerald-200/80 transition-colors no-underline flex items-center gap-1.5 shrink-0"
             title="Voir ma boutique en ligne">
            <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            <span class="hidden sm:inline">Vitrine</span>
          </a>
        </div>

      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 1: DASHBOARD OVERVIEW (KPIS & ACTIVITÉ)              -->
      <!-- ======================================================== -->
      <div *ngIf="!loading() && activeTab() === 'dashboard'" class="space-y-6 animate-in fade-in duration-300">

        <!-- Quick Action Bar -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 class="text-base sm:text-lg font-black text-slate-900 m-0">Aperçu des performances</h2>
            <p class="text-xs text-slate-400 font-medium m-0 mt-0.5">Statistiques consolidées de votre boutique en temps réel</p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <a routerLink="/store-admin/products"
              class="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-light transition-all shadow-md shadow-primary/25 no-underline inline-flex items-center gap-2 active:scale-95">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
              <span>+ Nouveau Produit</span>
            </a>

            <a routerLink="/store-admin/orders"
              class="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 transition-all no-underline inline-flex items-center gap-2 shadow-2xs active:scale-95">
              <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <span>Commandes</span>
              <span *ngIf="stats()?.pendingOrders" class="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black">
                {{ stats()!.pendingOrders }}
              </span>
            </a>
          </div>
        </div>

        <!-- 4 KPI Cards Grid -->
        <div *ngIf="stats()" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">

          <!-- Chiffre d'Affaires -->
          <div class="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-md flex items-center justify-between group">
            <div class="min-w-0">
              <p class="text-[10px] font-black text-emerald-100 uppercase tracking-widest m-0">Chiffre d'Affaires</p>
              <p class="text-2xl sm:text-3xl font-black text-white mt-1.5 mb-0">
                {{ stats()!.revenue | number:'1.0-0' }} <span class="text-xs font-bold text-emerald-200">MRU</span>
              </p>
              <p class="text-[10px] text-emerald-100/80 mt-1 mb-0 font-medium">Revenu total des ventes</p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center text-2xl shrink-0 shadow-inner">
              💰
            </div>
          </div>

          <!-- Total Commandes -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between group">
            <div class="min-w-0">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Commandes</p>
              <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 mb-0">{{ stats()!.totalOrders }}</p>
              <a routerLink="/store-admin/orders" class="text-xs font-bold text-primary hover:underline no-underline mt-1 inline-block">Voir le suivi →</a>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0">
              🛒
            </div>
          </div>

          <!-- Produits en Ligne -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between group">
            <div class="min-w-0">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Catalogue</p>
              <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 mb-0">{{ stats()!.totalProducts }}</p>
              <a routerLink="/store-admin/products" class="text-xs font-bold text-primary hover:underline no-underline mt-1 inline-block">Gérer stock →</a>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0">
              📦
            </div>
          </div>

          <!-- Clients Uniques -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between group">
            <div class="min-w-0">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Acheteurs</p>
              <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 mb-0">{{ stats()!.totalCustomers }}</p>
              <p class="text-[10px] text-slate-400 mt-1 mb-0 font-medium">Clients uniques</p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shrink-0">
              👥
            </div>
          </div>

        </div>

        <!-- 2 Columns: Order Statuses & Top Products -->
        <div *ngIf="stats()" class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          
          <!-- Column 1: Order Status Breakdown -->
          <div class="space-y-4">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
              <span>📋</span>
              <span>Traitement des Commandes</span>
            </h3>

            <!-- Pending Orders Card -->
            <div class="bg-white rounded-2xl p-5 border border-orange-200/80 shadow-xs flex items-center gap-4 bg-gradient-to-r from-orange-50/40 to-white">
              <div class="w-13 h-13 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl shrink-0">
                ⏳
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-black uppercase text-slate-600 tracking-wider">En attente de livraison</span>
                  <span class="text-2xl font-black text-orange-600">{{ stats()!.pendingOrders }}</span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5 mb-2 line-clamp-1">Commandes en attente de préparation pour le livreur.</p>
                <a routerLink="/store-admin/orders"
                  class="text-xs font-bold text-orange-600 hover:text-orange-700 no-underline inline-flex items-center gap-1">
                  <span>Accéder aux commandes à traiter</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            <!-- Delivered Orders Card -->
            <div class="bg-white rounded-2xl p-5 border border-teal-200/80 shadow-xs flex items-center gap-4 bg-gradient-to-r from-teal-50/40 to-white">
              <div class="w-13 h-13 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center text-2xl shrink-0">
                ✅
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-black uppercase text-slate-600 tracking-wider">Commandes livrées</span>
                  <span class="text-2xl font-black text-teal-600">{{ stats()!.deliveredOrders }}</span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5 mb-0">Livrées avec succès auprès de vos clients.</p>
              </div>
            </div>
          </div>

          <!-- Column 2: Top Selling Products -->
          <div class="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                <span>🔥</span>
                <span>Produits les plus vendus</span>
              </h3>
              <a routerLink="/store-admin/products" class="text-xs font-bold text-primary hover:underline no-underline">Voir tout →</a>
            </div>

            <div *ngIf="stats()!.topProducts.length" class="space-y-2.5 flex-1">
              <div *ngFor="let p of stats()!.topProducts; let i = index" class="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 flex items-center gap-3 transition-colors">
                <span class="w-6 h-6 rounded-lg bg-primary text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {{ i + 1 }}
                </span>
                <img [src]="getImageUrl(p.imageUrl)" [alt]="p.name" class="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-white">
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-slate-900 truncate m-0">{{ p.name }}</p>
                  <p class="text-xs font-black text-primary mt-0.5 m-0">{{ p.price | number }} MRU</p>
                </div>
              </div>
            </div>

            <div *ngIf="!stats()!.topProducts.length" class="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <span class="text-3xl mb-2">🏷️</span>
              <p class="text-xs font-bold text-slate-600 m-0">Aucun produit vendu pour le moment</p>
              <p class="text-[11px] text-slate-400 mt-1 max-w-xs m-0">Dès que vos clients commanderont, vos articles les plus populaires apparaîtront ici.</p>
            </div>
          </div>

        </div>

      </div>

      <!-- ======================================================== -->
      <!-- TAB 2: STORE PROFILE (INFORMATIONS & CONFIGURATION)      -->
      <!-- ======================================================== -->
      <div *ngIf="!loading() && activeTab() === 'profile'" class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Header Profile Title -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 class="text-base sm:text-lg font-black text-slate-900 m-0">Profil de la Boutique</h2>
            <p class="text-xs text-slate-400 font-medium m-0 mt-0.5">Consultez et modifiez les informations officielles de votre boutique</p>
          </div>

          <div class="flex items-center gap-2">
            <button *ngIf="!isEditingProfile" (click)="startEditingProfile()"
              class="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-light transition-all shadow-md shadow-primary/25 border-none cursor-pointer inline-flex items-center gap-2 active:scale-95">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span>Modifier les informations</span>
            </button>
          </div>
        </div>

        <!-- Store Public Link Card (Shareable) -->
        <div class="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 rounded-2xl p-4 sm:p-6 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center text-xl shrink-0 shadow-xs border border-emerald-100">
              🔗
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase text-emerald-800 tracking-wider m-0">Lien Public de votre Boutique</p>
              <p class="text-xs font-mono text-slate-600 mt-1 m-0 truncate select-all">{{ publicStoreUrl() }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5 m-0">Partagez ce lien directement sur vos réseaux sociaux (WhatsApp, Facebook, TikTok)</p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button (click)="copyStoreUrl()"
              class="flex-1 sm:flex-initial px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1.5 active:scale-95">
              <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              <span>Copier le lien</span>
            </button>
            <a *ngIf="store()?._id" [routerLink]="['/store', store()?._id]" target="_blank"
              class="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all no-underline inline-flex items-center justify-center gap-1.5 shadow-xs shadow-emerald-600/30 active:scale-95">
              <span>Ouvrir ↗</span>
            </a>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- VIEW MODE (Affichage structuré du profil)     -->
        <!-- ============================================ -->
        <div *ngIf="!isEditingProfile" class="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          
          <!-- Identity Card (Left column) -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-100 border-2 border-slate-200 overflow-hidden shadow-md flex items-center justify-center text-4xl mb-4 shrink-0">
              <img *ngIf="store()?.logo" [src]="getImageUrl(store()!.logo!)" [alt]="store()?.name" class="w-full h-full object-cover">
              <span *ngIf="!store()?.logo">{{ store()?.name?.charAt(0)?.toUpperCase() || '🏪' }}</span>
            </div>

            <h3 class="text-lg font-black text-slate-900 m-0">{{ store()?.name }}</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed m-0">
              {{ store()?.description || 'Aucune description renseignée pour cette boutique.' }}
            </p>

            <div class="w-full pt-5 mt-5 border-t border-slate-100 flex flex-col gap-2.5 text-left">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400 font-medium">Statut :</span>
                <span class="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Vérifiée & Active</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400 font-medium">Membre depuis :</span>
                <span class="font-bold text-slate-700">{{ (store()?.createdAt | date:'mediumDate') || 'Récemment' }}</span>
              </div>
            </div>
          </div>

          <!-- Store Contact & Details (Right 2 cols) -->
          <div class="lg:col-span-2 space-y-5">
            
            <!-- Contact Info Box -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 m-0">
                <span>📍</span>
                <span>Coordonnées Commerciales</span>
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <!-- Phone -->
                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base shrink-0">
                    📞
                  </div>
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">Téléphone de contact</p>
                    <p class="text-xs font-bold text-slate-900 mt-1 m-0 truncate">{{ store()?.phone || 'Non renseigné' }}</p>
                  </div>
                </div>

                <!-- Email -->
                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-base shrink-0">
                    ✉️
                  </div>
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">Email commercial</p>
                    <p class="text-xs font-bold text-slate-900 mt-1 m-0 truncate">{{ store()?.email || 'Non renseigné' }}</p>
                  </div>
                </div>

                <!-- Address -->
                <div class="sm:col-span-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-base shrink-0">
                    🏢
                  </div>
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">Adresse / Localisation</p>
                    <p class="text-xs font-bold text-slate-900 mt-1 m-0">{{ store()?.address || 'Nouakchott, Mauritanie' }}</p>
                  </div>
                </div>

              </div>
            </div>

            <!-- Admin Account Card -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 m-0">
                <span>👤</span>
                <span>Compte Gérant de la Boutique</span>
              </h4>

              <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex-wrap gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {{ initials() }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-900 m-0 truncate">{{ adminName() }}</p>
                    <p class="text-[10px] text-primary font-bold uppercase tracking-wider m-0 mt-0.5">Administrateur Boutique</p>
                  </div>
                </div>
                <span class="text-xs font-semibold text-slate-500">
                  {{ currentUserPhone() }}
                </span>
              </div>
            </div>

          </div>

        </div>

        <!-- ============================================ -->
        <!-- EDIT MODE (Formulaire de modification)       -->
        <!-- ============================================ -->
        <div *ngIf="isEditingProfile" class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm animate-in fade-in duration-300">
          <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h3 class="text-base font-extrabold text-slate-900 m-0">Modifier les informations de la boutique</h3>
              <p class="text-xs text-slate-400 mt-0.5 m-0">Ces informations seront visibles par les clients sur la page publique de votre boutique.</p>
            </div>
          </div>

          <form (ngSubmit)="saveProfile()" class="space-y-4">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <!-- Store Name -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Nom de la boutique *</label>
                <input type="text" [(ngModel)]="editForm.name" name="name" required
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-slate-900 transition-all">
              </div>

              <!-- Store Phone -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Téléphone de contact</label>
                <input type="text" [(ngModel)]="editForm.phone" name="phone" placeholder="4X XX XX XX"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-slate-900 transition-all">
              </div>

              <!-- Store Email -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Email commercial</label>
                <input type="email" [(ngModel)]="editForm.email" name="email" placeholder="contact@maboutique.com"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-slate-900 transition-all">
              </div>

              <!-- Store Address -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Adresse / Emplacement</label>
                <input type="text" [(ngModel)]="editForm.address" name="address" placeholder="Tevragh-Zeina, Nouakchott"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-slate-900 transition-all">
              </div>

            </div>

            <!-- Store Description -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Description de la boutique</label>
              <textarea [(ngModel)]="editForm.description" name="description" rows="3" placeholder="Présentez votre boutique, vos produits et vos spécialités..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-xs font-medium text-slate-900 transition-all"></textarea>
            </div>

            <!-- Logo URL -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Image / Logo (URL ou chemin)</label>
              <input type="text" [(ngModel)]="editForm.logo" name="logo" placeholder="https://... ou /uploads/..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-slate-900 transition-all">
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" (click)="cancelEditingProfile()"
                class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border-none cursor-pointer transition-colors">
                Annuler
              </button>

              <button type="submit" [disabled]="savingProfile"
                class="px-6 py-2.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl border-none cursor-pointer shadow-md shadow-primary/25 transition-all inline-flex items-center gap-2 disabled:opacity-50">
                <svg *ngIf="savingProfile" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                <span>{{ savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications' }}</span>
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  `
})
export class StoreDashboardComponent implements OnInit {
  private storeService = inject(StoreService);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  store = signal<Store | null>(null);
  stats = signal<StoreStats | null>(null);
  loading = signal<boolean>(true);

  // Tabs state: 'dashboard' | 'profile'
  activeTab = signal<'dashboard' | 'profile'>('dashboard');

  // Edit Profile Form State
  isEditingProfile = false;
  savingProfile = false;
  editForm: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    logo: string;
  } = {
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    logo: ''
  };

  adminName = computed(() => this.authService.currentUser()?.name || 'Administrateur');
  currentUserPhone = computed(() => this.authService.currentUser()?.phone || '');
  initials = computed(() => {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  });

  publicStoreUrl = computed(() => {
    const id = this.store()?._id;
    if (!id) return '';
    return `${window.location.origin}/#/store/${id}`;
  });

  ngOnInit() {
    // Check if ?tab=profile was requested in query params
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'profile') {
        this.activeTab.set('profile');
      }
    });

    this.loadStoreData();
  }

  loadStoreData() {
    this.loading.set(true);
    this.storeService.getMyStore().subscribe({
      next: (st) => {
        this.store.set(st);
        this.syncEditForm(st);
        this.storeService.getMyStoreStats().subscribe({
          next: (stStats) => {
            this.stats.set(stStats);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => {
        this.notificationService.show('Erreur lors du chargement de la boutique', 'error');
        this.loading.set(false);
      }
    });
  }

  syncEditForm(st: Store) {
    this.editForm = {
      name: st.name || '',
      description: st.description || '',
      phone: st.phone || '',
      email: st.email || '',
      address: st.address || '',
      logo: st.logo || ''
    };
  }

  startEditingProfile() {
    if (this.store()) {
      this.syncEditForm(this.store()!);
    }
    this.isEditingProfile = true;
  }

  cancelEditingProfile() {
    this.isEditingProfile = false;
  }

  saveProfile() {
    if (!this.editForm.name.trim()) {
      this.notificationService.show('Le nom de la boutique est obligatoire', 'error');
      return;
    }

    this.savingProfile = true;
    this.storeService.updateMyStore(this.editForm).subscribe({
      next: (updated) => {
        this.savingProfile = false;
        this.store.set(updated);
        this.syncEditForm(updated);
        this.isEditingProfile = false;
        this.notificationService.show('Profil de la boutique mis à jour avec succès !');
      },
      error: (err) => {
        this.savingProfile = false;
        this.notificationService.show(err.error?.message || 'Erreur lors de la mise à jour', 'error');
      }
    });
  }

  copyStoreUrl() {
    const url = this.publicStoreUrl();
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.notificationService.show('Lien de la boutique copié dans le presse-papier !');
      });
    }
  }

  getImageUrl(src: string): string {
    return this.productService.getImageUrl(src);
  }

  async logout() {
    const confirmed = await this.notificationService.confirm('Êtes-vous sûr de vouloir quitter votre espace boutique ?');
    if (!confirmed) return;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
