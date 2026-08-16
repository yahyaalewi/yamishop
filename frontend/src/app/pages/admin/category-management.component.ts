import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/ui/card.component';
import { CategoryService, Category } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, CardComponent, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight font-inter">Gestion des Catégories</h1>
          <p class="text-sm text-gray-500 font-medium mt-1">Créez, modifiez et organisez les catégories de produits de Yamishop.</p>
        </div>
        <button (click)="openAddModal()" 
                class="px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2 border-none cursor-pointer">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle Catégorie
        </button>
      </div>

      <!-- Toolbar Search -->
      <app-card class="mb-8">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="flex-1 relative w-full">
            <svg class="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" 
                   [(ngModel)]="searchQuery" 
                   placeholder="Rechercher une catégorie..." 
                   class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm font-medium transition-all">
          </div>
          <div class="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2 shrink-0">
            <span class="text-primary font-black text-lg">{{ filteredCategories().length }}</span>
            <span class="text-[10px] font-black text-primary/70 uppercase tracking-widest">Catégories au total</span>
          </div>
        </div>
      </app-card>

      <!-- Category List Grid -->
      <div *ngIf="loading()" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <div *ngIf="!loading() && filteredCategories().length === 0" class="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div class="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📁</div>
        <h3 class="text-lg font-bold text-gray-800">Aucune catégorie trouvée</h3>
        <p class="text-sm text-gray-500 mt-1">Commencez par ajouter votre première catégorie de produit.</p>
        <button (click)="openAddModal()" class="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl border-none cursor-pointer">
          Ajouter une catégorie
        </button>
      </div>

      <div *ngIf="!loading() && filteredCategories().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let cat of filteredCategories()" 
             class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center relative">
              <img *ngIf="cat.image" [src]="getImageUrl(cat.image)" [alt]="cat.name" class="w-full h-full object-cover">
              <span *ngIf="!cat.image" class="text-gray-400 text-xl font-black">{{ cat.name.charAt(0) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-gray-900 truncate m-0">{{ cat.name }}</h3>
              <p class="text-xs text-gray-400 font-medium mt-1">
                Traduite: {{ lang.translateCategory(cat.name, 'fr') }}
              </p>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button (click)="startEditCategory(cat)" 
                    class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors border-none cursor-pointer flex items-center gap-1.5">
              <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Modifier
            </button>
            <button (click)="removeCategory(cat._id)" 
                    class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors border-none cursor-pointer flex items-center gap-1.5">
              <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg p-6 border border-gray-100 animate-in fade-in zoom-in duration-300">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">
              {{ editingCategoryId() ? 'Modifier la Catégorie' : 'Nouvelle Catégorie' }}
            </h2>
            <button (click)="closeModal()" class="w-8 h-8 rounded-full bg-gray-100/50 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-all border-none cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nom de la catégorie *</label>
              <input type="text" 
                     [(ngModel)]="categoryName" 
                     placeholder="Ex: Mode, Électronique, Parfum..." 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm">
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Image de la catégorie</label>
              <div class="flex gap-2 items-center">
                <input type="text" 
                       [(ngModel)]="categoryImage" 
                       placeholder="URL de l'image" 
                       class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold">
                
                <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" class="hidden">
                <button type="button" 
                        (click)="fileInput.click()" 
                        class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border border-gray-200">
                  <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  <span>{{ uploadingImage() ? 'Téléversement...' : 'Photo' }}</span>
                </button>
              </div>
            </div>

            <!-- Image Preview -->
            <div *ngIf="categoryImage" class="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 min-w-0">
                <img [src]="getImageUrl(categoryImage)" class="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0">
                <span class="text-xs text-gray-500 font-medium truncate">{{ categoryImage }}</span>
              </div>
              <button (click)="categoryImage = ''" class="text-red-500 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded-lg border-none cursor-pointer shrink-0">
                Supprimer
              </button>
            </div>

            <div class="flex gap-3 justify-end pt-4">
              <button (click)="closeModal()" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all border-none cursor-pointer">
                Annuler
              </button>
              <button (click)="saveCategory()" 
                      [disabled]="submitting() || uploadingImage()" 
                      class="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all border-none cursor-pointer disabled:opacity-50">
                {{ submitting() ? 'Enregistrement...' : (editingCategoryId() ? 'Mettre à jour' : 'Créer') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoryManagementComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  public lang = inject(LanguageService);

  categories = signal<Category[]>([]);
  loading = signal<boolean>(true);
  searchQuery = '';

  showModal = signal<boolean>(false);
  editingCategoryId = signal<string | null>(null);
  categoryName = '';
  categoryImage = '';
  uploadingImage = signal<boolean>(false);
  submitting = signal<boolean>(false);

  filteredCategories = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.categories();
    return this.categories().filter(cat => 
      cat.name.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.show('Erreur lors du chargement des catégories', 'error');
        this.loading.set(false);
      }
    });
  }

  getImageUrl(src: string): string {
    return this.productService.getImageUrl(src);
  }

  openAddModal() {
    this.editingCategoryId.set(null);
    this.categoryName = '';
    this.categoryImage = '';
    this.showModal.set(true);
  }

  startEditCategory(category: Category) {
    if (!category._id) return;
    this.editingCategoryId.set(category._id);
    this.categoryName = category.name;
    this.categoryImage = category.image || '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCategoryId.set(null);
    this.categoryName = '';
    this.categoryImage = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadingImage.set(true);
      this.productService.uploadImage(file).subscribe({
        next: (res) => {
          const imageUrl = typeof res === 'string' ? res : (res.url || (res as any).imageUrl);
          if (imageUrl) {
            this.categoryImage = imageUrl;
            this.notificationService.show('Image téléversée avec succès');
          } else {
            this.notificationService.show('Réponse d\'envoi invalide', 'error');
          }
          this.uploadingImage.set(false);
          event.target.value = '';
        },
        error: (err) => {
          this.uploadingImage.set(false);
          const errorMsg = err.error?.message || err.message || 'Erreur lors du téléchargement de l\'image';
          this.notificationService.show(errorMsg, 'error');
          event.target.value = '';
        }
      });
    }
  }

  saveCategory() {
    if (!this.categoryName || !this.categoryName.trim()) {
      this.notificationService.show('Veuillez entrer un nom de catégorie', 'error');
      return;
    }

    this.submitting.set(true);
    const editId = this.editingCategoryId();

    if (editId) {
      this.categoryService.updateCategory(editId, {
        name: this.categoryName.trim(),
        image: this.categoryImage.trim()
      }).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.loadCategories();
          this.notificationService.show('Catégorie mise à jour avec succès');
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err.error?.message || 'Erreur lors de la mise à jour';
          this.notificationService.show(msg, 'error');
        }
      });
    } else {
      this.categoryService.createCategory({
        name: this.categoryName.trim(),
        image: this.categoryImage.trim()
      }).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.loadCategories();
          this.notificationService.show('Catégorie ajoutée avec succès');
        },
        error: (err) => {
          this.submitting.set(false);
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
}
