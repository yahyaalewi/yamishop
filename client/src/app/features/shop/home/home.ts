import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  products: any[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data: any) => this.products = data);
  }

  addToCart(product: any) {
    if (!this.authService.isAuthenticated()) {
      this.toastr.info('Veuillez vous connecter pour ajouter des produits au panier', 'Connexion requise');
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addToCart(product);
    this.toastr.success(`${product.name} ajouté au panier`);
    this.router.navigate(['/cart']);
  }
}
