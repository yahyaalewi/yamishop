import { Component, OnInit, signal, computed, inject } from '@angular/core';
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
    <div class="p-6 max-w-7xl mx-auto">
      
      <!-- Reset Password Modal -->
      <div *ngIf="selectedUser()" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-300">
          <button (click)="selectedUser.set(null)" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors border-none cursor-pointer">
            <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary text-2xl">🔑</div>
            <h2 class="text-xl font-black text-gray-900">Réinitialiser le mot de passe</h2>
            <p class="text-sm text-gray-500">Pour : <b>{{selectedUser()?.name}}</b></p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nouveau Mot de Passe</label>
              <input type="password" [(ngModel)]="newPassword" 
                placeholder="Minimum 6 caractères"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm">
            </div>
            
            <button (click)="resetPassword()" [disabled]="newPassword.length < 6 || loading()"
              class="w-full bg-primary text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:grayscale cursor-pointer border-none mt-2">
              {{ loading() ? 'Chargement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">Gestion des Utilisateurs</h1>
          <p class="text-sm text-gray-500 font-medium">Consultez et gérez les comptes de vos clients.</p>
        </div>
        <div class="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 flex items-center gap-2">
          <span class="text-primary font-black text-lg">{{users().length}}</span>
          <span class="text-[10px] font-black text-primary/60 uppercase tracking-widest">Utilisateurs inscrits</span>
        </div>
      </div>

      <app-card>
        <!-- Toolbar -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1 relative">
            <svg class="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Rechercher par nom ou téléphone..." 
              class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium">
          </div>
          <select [(ngModel)]="roleFilter" class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-600 focus:ring-2 focus:ring-primary">
            <option value="all">Tous les rôles</option>
            <option value="user">Clients (User)</option>
            <option value="admin">Administrateurs</option>
          </select>
        </div>

        <!-- Users Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-600 font-black uppercase text-[10px] tracking-widest border-b border-gray-100">
              <tr>
                <th class="px-6 py-4">Utilisateur</th>
                <th class="px-6 py-4">Rôle</th>
                <th class="px-6 py-4">Date d'inscription</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="text-gray-900">
              <tr *ngFor="let user of filteredUsers()" class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                      {{user.name.charAt(0).toUpperCase()}}
                    </div>
                    <div>
                      <p class="font-black text-gray-900 leading-tight">{{user.name}}</p>
                      <p class="text-xs text-gray-400 font-bold mt-0.5">{{user.phone}}</p>
                      <p *ngIf="user.email" class="text-[10px] text-primary font-bold lowercase opacity-70">{{user.email}}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span [class]="user.role === 'admin' ? 'bg-terracotta text-white' : 'bg-green-100 text-green-700'"
                    class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {{user.role}}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-400 text-xs font-bold whitespace-nowrap">
                  {{user.createdAt | date:'dd MMM yyyy'}}
                </td>
                <td class="px-6 py-4 text-right">
                  <button (click)="openResetModal(user)" 
                    class="bg-white border-2 border-primary text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm group-hover:shadow-md">
                    Changer Password
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredUsers().length === 0">
                <td colspan="4" class="py-20 text-center">
                  <div class="text-gray-300 text-4xl mb-2">🔍</div>
                  <p class="text-gray-400 italic">Aucun utilisateur ne correspond à votre recherche.</p>
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
  searchTerm = signal('');
  roleFilter = signal('all');
  loading = signal(false);

  selectedUser = signal<any | null>(null);
  newPassword = '';

  filteredUsers = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const role = this.roleFilter();
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
  });

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
