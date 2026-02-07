import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent implements OnInit {
  items: any[] = [];
  total = 0;
  shippingAddress = '';
  isSubmitting = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.items = this.cartService.getItems();
    this.calculateTotal();
  }

  calculateTotal() {
    this.total = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  updateQuantity(item: any, quantity: number) {
    if (quantity < 1) {
      this.removeItem(item);
    } else {
      item.quantity = quantity;
      this.calculateTotal();
      this.cartService.updateCart(this.items);
    }
  }

  removeItem(item: any) {
    this.items = this.items.filter(i => i._id !== item._id);
    this.cartService.updateCart(this.items);
    this.calculateTotal();
  }

  checkout() {
    if (this.items.length === 0) return;
    if (!this.shippingAddress) {
      this.toastr.warning('Veuillez entrer une adresse de livraison');
      return;
    }

    this.isSubmitting = true;

    const orderData = {
      products: this.items.map(i => ({ product: i._id, quantity: i.quantity })),
      totalAmount: this.total,
      shippingAddress: this.shippingAddress
    };

    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.toastr.success('Commande passée avec succès!');
        this.cartService.clearCart();
        this.isSubmitting = false;
        this.router.navigate(['/shop']);
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Erreur');
        this.isSubmitting = false;
      }
    });
  }
}
