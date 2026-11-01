import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/ui/card.component';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, CardComponent, FormsModule],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto font-inter">
      
      <!-- Reset Password Modal -->
      <div *ngIf="selectedUser()" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
        <div class="bg-white rounded-t-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-md p-5 sm:p-7 relative animate-in fade-in slide-in-from-bottom duration-300 border border-slate-100">
          <button (click)="selectedUser.set(null)" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors border-none cursor-pointer">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div class="text-center mb-5">
            <div class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary text-2xl">🔑</div>
            <h2 class="text-lg sm:text-xl font-black text-slate-900 m-0">Réinitialiser le mot de passe</h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Pour : <b>{{selectedUser()?.name}}</b></p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nouveau Mot de Passe</label>
              <input type="password" [(ngModel)]="newPassword" 
                placeholder="Minimum 6 caractères"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm">
            </div>
            
            <button (click)="resetPassword()" [disabled]="newPassword.length < 6 || loading()"
              class="w-full bg-primary text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary-light transition-all disabled:opacity-50 disabled:grayscale cursor-pointer border-none mt-2">
              {{ loading() ? 'Chargement...' : 'Enregistrer le mot de passe' }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">Gestion des Utilisateurs</h1>
          <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">Consultez et gérez les comptes clients et administrateurs.</p>
        </div>
        <div class="bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 flex items-center gap-2 self-start sm:self-auto">
          <span class="text-primary font-black text-base">{{users().length}}</span>
          <span class="text-[10px] font-black text-primary/70 uppercase tracking-widest">Inscrits</span>
        </div>
      </div>

      <app-card>
        <!-- Toolbar -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <div class="flex-1 relative">
            <svg class="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Rechercher par nom ou téléphone..." 
              class="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs sm:text-sm font-medium">
          </div>
          <select [(ngModel)]="roleFilter" class="px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-primary shrink-0">
            <option value="all">Tous les rôles</option>
            <option value="user">Clients (User)</option>
            <option value="admin">Administrateurs</option>
          </select>
        </div>

        <!-- MOBILE USER CARDS (< 768px) -->
        <div class="md:hidden space-y-3">
          <div *ngFor="let user of filteredUsers" class="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col gap-2.5">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                  {{user.name.charAt(0).toUpperCase()}}
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-sm text-slate-900 leading-tight truncate m-0">{{user.name}}</p>
                  <a *ngIf="user.phone" [href]="'tel:' + user.phone" class="text-xs text-slate-400 font-semibold mt-0.5 inline-block no-underline">{{user.phone}}</a>
                </div>
              </div>
              <span [class]="user.role === 'admin' ? 'bg-terracotta text-white' : 'bg-emerald-100 text-emerald-800'"
                    class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0">
                {{user.role}}
              </span>
            </div>

            <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
              <span>Inscrit: {{user.createdAt | date:'dd MMM yyyy'}}</span>
              <button (click)="openResetModal(user)" 
                class="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none active:scale-95">
                Changer mot de passe
              </button>
            </div>
          </div>

          <div *ngIf="filteredUsers.length === 0" class="py-12 text-center text-slate-400 text-xs italic">
            Aucun utilisateur ne correspond à votre recherche.
          </div>
        </div>

        <!-- DESKTOP TABLE (>= 768px) -->
        <div class="overflow-x-auto hidden md:block">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
              <tr>
                <th class="px-6 py-4">Utilisateur</th>
                <th class="px-6 py-4">Rôle</th>
                <th class="px-6 py-4">Date d'inscription</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="text-slate-900 divide-y divide-slate-100">
              <tr *ngFor="let user of filteredUsers" class="hover:bg-slate-50/60 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                      {{user.name.charAt(0).toUpperCase()}}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900 leading-tight m-0">{{user.name}}</p>
                      <p class="text-xs text-slate-400 font-bold m-0 mt-0.5">{{user.phone}}</p>
                      <p *ngIf="user.email" class="text-[10px] text-primary font-bold lowercase opacity-70 m-0">{{user.email}}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span [class]="user.role === 'admin' ? 'bg-terracotta text-white' : 'bg-emerald-100 text-emerald-800'"
                    class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {{user.role}}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-400 text-xs font-bold whitespace-nowrap">
                  {{user.createdAt | date:'dd MMM yyyy'}}
                </td>
                <td class="px-6 py-4 text-right">
                  <button (click)="openResetModal(user)" 
                    class="bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold hover:border-primary hover:text-primary transition-all cursor-pointer shadow-xs active:scale-95">
                    Changer Password
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredUsers.length === 0">
                <td colspan="4" class="py-16 text-center">
                  <div class="text-slate-300 text-3xl mb-1">🔍</div>
                  <p class="text-slate-400 text-xs italic">Aucun utilisateur ne correspond à votre recherche.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  users = signal<any[]>([]);
  searchTerm = '';        // plain string for [(ngModel)]
  roleFilter = 'all';    // plain string for [(ngModel)]
  loading = signal(false);

  selectedUser = signal<any | null>(null);
  newPassword = '';

  get filteredUsers(): any[] {
    const search = this.searchTerm.toLowerCase().trim();
    const role = this.roleFilter;
    let result = this.users();

    if (search) {
      result = result.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.phone.includes(search) ||
        (u.email && u.email.toLowerCase().includes(search))
      );
    }

    if (role !== 'all') {
      result = result.filter(u => u.role === role);
    }

    return result;
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => this.notificationService.show('Erreur lors du chargement des utilisateurs', 'error')
    });
  }

  openResetModal(user: any) {
    this.newPassword = '';
    this.selectedUser.set(user);
  }

  resetPassword() {
    if (!this.selectedUser() || this.newPassword.length < 6) return;
    
    this.loading.set(true);
    this.authService.adminResetPassword(this.selectedUser()._id, this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.show(`Mot de passe de ${this.selectedUser().name} mis à jour ! ✅`);
        this.selectedUser.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.show('Erreur de réinitialisation', 'error');
      }
    });
  }
}
