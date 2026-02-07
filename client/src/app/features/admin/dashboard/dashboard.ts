import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  products: any[] = [];
  orders: any[] = [];
  isSubmitting = false;
  productForm: FormGroup;
  showForm = false;
  editingId: string | null = null;
  activeTab = 'overview'; // 'overview' | 'products' | 'orders'
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  baseUrl = environment.apiUrl.replace('/api', '');
  mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }


  get totalRevenue(): number {
    return this.orders.reduce((acc, order) => acc + order.totalAmount, 0);
  }

  get pendingOrdersCount(): number {
    return this.orders.filter(o => o.status === 'Pending').length;
  }

  get lowStockCount(): number {
    return this.products.filter(p => p.stock < 5).length;
  }

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      image: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrders();
  }

  loadProducts() {
    this.productService.getProducts().subscribe((data: any) => this.products = data);
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe((data: any) => this.orders = data);
  }

  onSubmitProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toastr.error('Formulaire invalide. Veuillez vérifier tous les champs (notamment l\'image).');
      return;
    }

    this.isSubmitting = true;

    const request = this.editingId
      ? this.productService.updateProduct(this.editingId, this.productForm.value)
      : this.productService.createProduct(this.productForm.value);

    request.subscribe({
      next: () => {
        this.toastr.success(this.editingId ? 'Produit mis à jour' : 'Produit ajouté');
        this.resetForm();
        this.loadProducts();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Une erreur est survenue');
        this.isSubmitting = false;
      }
    });
  }

  deleteProduct(id: string) {
    if (confirm('Êtes-vous sûr?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.toastr.success('Produit supprimé');
        this.loadProducts();
      });
    }
  }

  editProduct(product: any) {
    this.editingId = product._id;
    this.productForm.patchValue(product);
    this.showForm = true;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Upload immediately to get URL
      this.productService.uploadImage(file).subscribe({
        next: (response) => {
          // Assuming response.filePath is "/uploads/filename.jpg"
          // We need to store the full URL or relative path depending on how we display it.
          // Storing relative path is flexible, but display needs the base URL.
          // Let's store full URL in DB for simplicity in this context so other clients work easily? 
          // Or just relative path and use a pipe/helper.
          // The server is returning `/uploads/filename`.
          // Let's construct the full URL to save in DB so `img src` works everywhere without changes.
          const fullUrl = `${this.baseUrl}${response.filePath}`;
          this.productForm.patchValue({ image: fullUrl });
          this.imagePreview = fullUrl;
          this.toastr.success('Image téléchargée avec succès');
        },
        error: (err) => {
          this.toastr.error('Erreur lors du téléchargement de l\'image');
          console.error(err);
        }
      });
    }
  }

  resetForm() {
    this.editingId = null;
    this.productForm.reset();
    this.showForm = false;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  updateOrderStatus(id: string, status: string) {
    this.orderService.updateOrderStatus(id, status).subscribe(() => {
      this.toastr.success('Statut mis à jour');
      this.loadOrders();
    });
  }
}
