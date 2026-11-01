import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../components/ui/card.component';
import { OrderService, Order } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-fade-in font-inter max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div class="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Supervision Globale
          </div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight m-0">Tableau de Bord</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Vue d'ensemble des performances, des ventes et des commandes de YamiShop.</p>
        </div>
        <div class="relative z-10 flex items-center gap-2.5">
          <a routerLink="/admin/orders" class="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/25 hover:bg-primary-light transition-all flex items-center gap-2 no-underline">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            Toutes les commandes
          </a>
        </div>
      </div>

      <!-- KPI Cards Grid (2 cols on mobile, 3 on tablet, 6 on xl desktop) -->
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 xl:gap-6">
        
        <!-- Revenus Total -->
        <div class="col-span-2 sm:col-span-1 xl:col-span-2 bg-gradient-to-br from-primary to-primary-dark text-white p-5 rounded-2xl sm:rounded-[2rem] shadow-md flex flex-col justify-between min-h-[140px] sm:min-h-[160px] relative overflow-hidden group">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div class="flex items-start justify-between relative z-10">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center shadow-inner">
               <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span class="text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">Confirmé</span>
          </div>
          <div class="relative z-10 mt-3">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Revenus Total</p>
            <p class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ revenue() | number }} <span class="text-xs sm:text-sm font-bold text-slate-200">MRU</span></p>
          </div>
        </div>

        <!-- Panier Moyen -->
        <div class="col-span-2 sm:col-span-1 xl:col-span-2 bg-white p-5 rounded-2xl sm:rounded-[2rem] border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[140px] sm:min-h-[160px] relative overflow-hidden group">
          <div class="flex items-start justify-between relative z-10">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shadow-inner">
               <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Moyenne</span>
          </div>
          <div class="relative z-10 mt-3">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Panier Moyen</p>
            <p class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{{ averageOrderValue() | number:'1.0-0' }} <span class="text-xs sm:text-sm text-slate-500 font-bold">MRU</span></p>
          </div>
        </div>

        <!-- En Attente -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-orange-200/80 shadow-xs flex flex-col justify-between min-h-[130px] sm:min-h-[160px] bg-gradient-to-br from-orange-50/40 to-white">
          <div class="relative z-10 flex items-center justify-between">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
               <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div class="relative z-10 mt-2">
            <p class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">En Attente</p>
            <p class="text-2xl font-black text-orange-600 tracking-tight">{{ pendingOrdersCount() }}</p>
          </div>
        </div>

        <!-- Confirmées -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-teal-200/80 shadow-xs flex flex-col justify-between min-h-[130px] sm:min-h-[160px] bg-gradient-to-br from-teal-50/40 to-white">
          <div class="relative z-10 flex items-center justify-between">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shadow-inner">
               <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div class="relative z-10 mt-2">
            <p class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Confirmées</p>
            <p class="text-2xl font-black text-teal-600 tracking-tight">{{ confirmedOrdersCount() }} <span class="text-xs text-slate-400 font-bold">/ {{ orders().length }}</span></p>
          </div>
        </div>

      </div>

      <!-- Secondary KPIs Row -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4 xl:gap-6">
         <!-- Ce Mois -->
         <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div class="min-w-0">
              <p class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Ce Mois-ci</p>
              <p class="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{{ monthOrdersCount() }} <span class="text-xs font-semibold text-slate-400">commandes</span></p>
            </div>
         </div>
         <!-- Clients -->
         <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div class="min-w-0">
              <p class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Clients Uniques</p>
              <p class="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{{ uniqueClients() }} <span class="text-xs font-semibold text-slate-400">clients</span></p>
            </div>
         </div>
      </div>

      <!-- Graph & Top Products Row -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        
        <!-- Graph (7 Jours) -->
        <div class="xl:col-span-2 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200/80 shadow-xs flex flex-col relative overflow-hidden min-h-[340px] sm:min-h-[400px]">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 relative z-10 gap-2">
            <div>
              <h2 class="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 m-0">
                <span class="w-2 h-5 bg-primary rounded-full"></span>
                Performance (7 Jours)
              </h2>
              <p class="text-xs text-slate-400 mt-1 pl-4">Évolution quotidienne des ventes confirmées</p>
            </div>
            <div class="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start sm:self-auto text-right">
              <span class="text-[9px] font-black uppercase tracking-wider text-slate-400">Total Période: </span>
              <span class="text-sm font-black text-primary">{{ recentChartTotal() | number }} MRU</span>
            </div>
          </div>

          <div class="flex-grow flex items-end gap-2 sm:gap-4 md:gap-6 relative z-10 pb-2">
            <!-- Grid Lines -->
            <div class="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none opacity-25">
               <div class="w-full border-b border-slate-300 border-dashed flex-1"></div>
               <div class="w-full border-b border-slate-300 border-dashed flex-1"></div>
               <div class="w-full border-b border-slate-300 border-dashed flex-1"></div>
               <div class="w-full border-b border-slate-300 border-solid flex-1"></div>
            </div>

            <!-- Bars -->
            <div *ngFor="let col of recentChartData()" class="flex-1 flex flex-col items-center justify-end h-full gap-2 group/bar relative z-10">
              <!-- Value tag -->
              <span class="text-[9px] sm:text-[10px] font-extrabold text-slate-600 whitespace-nowrap mb-1">
                {{ col.revenue > 0 ? ((col.revenue / 1000).toFixed(col.revenue >= 1000 ? 1 : 0) + 'k') : '0' }}
              </span>
              
              <div class="w-full max-w-[2.5rem] sm:max-w-[3.5rem] relative flex items-end h-[160px] sm:h-[220px] rounded-t-xl overflow-hidden bg-slate-100/60">
                 <div class="w-full bg-gradient-to-t from-primary to-primary-light rounded-t-xl hover:opacity-90 transition-all duration-500 relative shadow-sm"
                      [style.height]="col.heightPercentage">
                    <div class="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-xl"></div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Axis Labels -->
          <div class="flex justify-between items-center px-0 pt-3 relative z-10 border-t border-slate-100">
            <div *ngFor="let col of recentChartData()" class="flex-1 text-center text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {{col.label}}
            </div>
          </div>
        </div>

        <!-- Top Selling Products -->
        <div class="xl:col-span-1 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200/80 shadow-xs flex flex-col min-h-[340px] sm:min-h-[400px]">
          <h2 class="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 mb-4 sm:mb-6">
            <span class="w-2 h-5 bg-terracotta rounded-full"></span>
            Top Produits
          </h2>
          
          <div class="flex-grow overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
             <div *ngFor="let prod of topProducts(); let i = index" class="flex items-center gap-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 p-2.5 sm:p-3 rounded-xl transition-all">
                <div class="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
                  <div class="absolute top-0 left-0 bg-slate-900 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-br-lg z-10">
                    #{{i + 1}}
                  </div>
                  <img [src]="prod.image" class="w-full h-full object-cover">
                </div>
                <div class="min-w-0 flex-grow">
                  <p class="text-xs sm:text-sm font-bold text-slate-900 truncate m-0" [title]="prod.name">{{prod.name}}</p>
                  <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                    {{prod.qty}} ventes
                  </p>
                </div>
                <div class="text-right shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-100">
                  <p class="text-xs sm:text-sm font-black text-terracotta m-0">{{(prod.rev / 1000).toFixed(1)}}k</p>
                  <p class="text-[8px] text-slate-400 font-bold uppercase tracking-widest m-0">MRU</p>
                </div>
             </div>

             <!-- Empty state -->
             <div *ngIf="topProducts().length === 0" class="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                 <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                   <svg class="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                 </div>
                 <p class="text-xs font-medium">Pas de données disponibles</p>
             </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders Section -->
      <div class="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-base sm:text-xl font-black text-slate-900 flex items-center gap-2 m-0">
            <span class="w-2 h-5 bg-slate-900 rounded-full"></span>
            Commandes Récentes
          </h2>
          <a routerLink="/admin/orders" class="text-primary text-xs sm:text-sm font-bold hover:underline no-underline">Voir tout →</a>
        </div>
        
        <div *ngIf="orders().length > 0; else noOrders">
          
          <!-- MOBILE VIEW: Dedicated Touch-friendly Cards (< 768px) -->
          <div class="md:hidden divide-y divide-slate-100 p-2 space-y-2">
            <div *ngFor="let order of orders().slice(0, 8)" class="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col gap-2.5">
              
              <!-- Row 1: ID, status, date -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="font-black text-xs text-slate-900">#{{order._id.substring(order._id.length-6).toUpperCase()}}</span>
                  <span [class]="getStatusClass(order)" class="py-0.5 px-2 rounded-full text-[9px] font-black uppercase tracking-wider">
                    {{ order.isConfirmed ? 'Confirmée' : 'En Attente' }}
                  </span>
                </div>
                <span class="text-[10px] text-slate-400 font-medium">{{order.createdAt | date:'shortDate'}} {{order.createdAt | date:'shortTime'}}</span>
              </div>

              <!-- Row 2: Customer & Price -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {{ (order.user?.name || 'C').charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-bold text-xs text-slate-800 truncate">{{order.user?.name || 'Client Supprimé'}}</span>
                </div>
                <span class="font-black text-primary text-sm whitespace-nowrap">{{order.totalPrice | number}} MRU</span>
              </div>

              <!-- Row 3: Action Buttons (Touch Friendly & Always Visible) -->
              <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/50">
                <button *ngIf="!order.isConfirmed" 
                        (click)="confirmOrder(order._id)"
                        class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 active:scale-95">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                  <span>Confirmer</span>
                </button>
                <button (click)="deleteOrder(order._id)"
                        class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 active:scale-95">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  <span>Supprimer</span>
                </button>
              </div>

            </div>
          </div>

          <!-- DESKTOP VIEW: Full Table (>= 768px) -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50/80 text-slate-500 font-black text-[10px] uppercase tracking-widest whitespace-nowrap border-b border-slate-100">
                <tr>
                  <th class="px-6 py-4">ID Commande</th>
                  <th class="px-6 py-4">Client</th>
                  <th class="px-6 py-4 text-center">Date & Heure</th>
                  <th class="px-6 py-4 text-center">Montant Total</th>
                  <th class="px-6 py-4 text-center">Statut</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let order of orders().slice(0, 8)" class="hover:bg-slate-50/60 transition-colors group">
                  <td class="px-6 py-4 font-black text-slate-900">#{{order._id.substring(order._id.length-6).toUpperCase()}}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {{ (order.user?.name || 'C').charAt(0).toUpperCase() }}
                      </div>
                      <span class="font-bold text-slate-900">{{order.user?.name || 'Client Supprimé'}}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-800 text-xs">{{order.createdAt | date:'shortDate'}}</span>
                      <span class="text-[10px] text-slate-400 font-medium">{{order.createdAt | date:'shortTime'}}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="font-black text-primary text-sm">{{order.totalPrice | number}} <span class="text-xs text-slate-400">MRU</span></span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span [class]="getStatusClass(order)" class="py-1 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full" [class.bg-primary]="order.isConfirmed" [class.bg-terracotta]="!order.isConfirmed" [class.animate-pulse]="!order.isConfirmed"></span>
                      {{ order.isConfirmed ? 'Confirmée' : 'En Attente' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button *ngIf="!order.isConfirmed" 
                        (click)="confirmOrder(order._id)"
                        title="Confirmer"
                        class="text-emerald-700 hover:text-white hover:bg-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl cursor-pointer transition-all active:scale-95 border border-emerald-200">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button (click)="deleteOrder(order._id)"
                        title="Supprimer"
                        class="text-red-600 hover:text-white hover:bg-red-500 font-bold bg-red-50 p-2 rounded-xl cursor-pointer transition-all active:scale-95 border border-red-200">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        <ng-template #noOrders>
          <div class="py-16 text-center flex flex-col items-center bg-slate-50/50">
            <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xs mb-3">
               <svg class="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p class="font-bold text-slate-800 text-base">Aucune commande</p>
            <p class="text-slate-400 text-xs mt-0.5">Les nouvelles commandes apparaîtront ici.</p>
          </div>
        </ng-template>
      </div>
      
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  orderService = inject(OrderService);
  productService = inject(ProductService);

  orders = signal<Order[]>([]);

  // Top KPIs
  confirmedOrdersCount = computed(() => this.orders().filter(o => o.isConfirmed).length);
  pendingOrdersCount = computed(() => this.orders().filter(o => !o.isConfirmed).length);

  revenue = computed(() => 
    this.orders()
      .filter(o => o.isConfirmed)
      .reduce((sum, o) => sum + o.totalPrice, 0)
  );

  averageOrderValue = computed(() => {
    const count = this.confirmedOrdersCount();
    return count > 0 ? this.revenue() / count : 0;
  });

  monthOrdersCount = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return this.orders().filter(o => {
      const d = new Date(o.createdAt);
      return o.isConfirmed && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  });

  uniqueClients = computed(() => {
    const clients = new Set(this.orders().map(o => o.user?._id).filter(id => !!id));
    return clients.size;
  });

  // Chart Data (Last 7 Days)
  recentChartData = computed(() => {
    const data: {date: Date, label: string, revenue: number, heightPercentage: string}[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for(let i=6; i>=0; i--) {
      const d = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      data.push({ 
        date: d, 
        label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        revenue: 0,
        heightPercentage: '0%'
      });
    }

    const confirmedOrders = this.orders().filter(o => o.isConfirmed);
    confirmedOrders.forEach(o => {
      const d = new Date(o.createdAt);
      d.setHours(0,0,0,0);
      const diffTime = Math.abs(today.getTime() - d.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if(diffDays <= 6) {
        const idx = 6 - diffDays;
        if(data[idx]) data[idx].revenue += o.totalPrice;
      }
    });

    const maxRev = Math.max(...data.map(d => d.revenue), 100);
    return data.map(d => ({
       ...d,
       heightPercentage: Math.max(5, Math.min(100, Math.round((d.revenue / maxRev) * 100))) + '%'
    }));
  });

  recentChartTotal = computed(() => {
    return this.recentChartData().reduce((sum, item) => sum + item.revenue, 0);
  });

  // Top 5 Products
  topProducts = computed(() => {
    const productStats = new Map<string, {name: string, image: string, qty: number, rev: number}>();
    
    this.orders().filter(o => o.isConfirmed).forEach(o => {
      o.orderItems.forEach(item => {
        const id = item.product || item.name;
        const qty = item.qty || item.quantity || 1;
        const rev = item.price * qty;
        
        if(productStats.has(id)) {
           const stat = productStats.get(id)!;
           stat.qty += qty;
           stat.rev += rev;
        } else {
           const imgUrl = item.image ? this.productService.getImageUrl(item.image) : '';
           productStats.set(id, { name: item.name, image: imgUrl, qty, rev });
        }
      });
    });

    return Array.from(productStats.values())
      .sort((a,b) => b.qty - a.qty)
      .slice(0, 5);
  });

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        // Sort by createdAt descending
        this.orders.set(data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      error: (err) => console.error('Failed to load orders', err)
    });
  }

  confirmOrder(id: string) {
    if (confirm('Confirmer cette commande ? Elle sera ajoutée aux statistiques et comptée comme chiffre d\'affaires.')) {
      this.orderService.confirmOrder(id).subscribe({
        next: () => this.loadOrders(),
        error: (err) => alert('Erreur lors de la confirmation.')
      });
    }
  }

  deleteOrder(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible et retirera le montant des analyses.')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => this.loadOrders(),
        error: (err) => alert('Erreur lors de la suppression.')
      });
    }
  }

  getStatusClass(order: Order) {
    if (order.isConfirmed) return 'bg-primary/10 text-primary border border-primary/20';
    return 'bg-terracotta/10 text-terracotta border border-terracotta/20';
  }
}
