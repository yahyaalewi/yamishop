import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: any;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService,
    private location: Location,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe({
        next: (data) => this.product = data,
        error: () => {
          this.toastr.error('Produit introuvable');
          this.goBack();
        }
      });
    }
  }

  addToCart() {
    if (this.product && this.product.stock > 0) {
      if (!this.authService.isAuthenticated()) {
        this.toastr.info('Veuillez vous connecter pour ajouter des produits au panier', 'Connexion requise');
        this.router.navigate(['/login']);
        return;
      }
      this.cartService.addToCart(this.product);
      this.toastr.success(`${this.product.name} ajouté au panier`);
      this.router.navigate(['/cart']);
    } else {
      this.toastr.info('Veuillez vous connecter pour ajouter au panier');
      this.router.navigate(['/login']);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
