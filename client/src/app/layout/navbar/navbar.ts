import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  role = '';
  menuOpen = false;
  cartCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // Check auth on load
    this.refreshAuth();

    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    });

    // Quick hack: Refresh auth whenever router navigates (simulating state change)
    // In a real app, use an Observable in AuthService
    this.router.events.subscribe(() => {
      this.refreshAuth();
    });
  }

  refreshAuth() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.role = this.authService.getUserRole();
  }

  logout() {
    this.authService.logout();
    this.refreshAuth();
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
