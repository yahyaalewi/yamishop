import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome.component';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { HomeComponent } from './pages/home.component';
import { ProductDetailsComponent } from './pages/product-details.component';
import { CartComponent } from './pages/cart.component';
import { CheckoutComponent } from './pages/checkout.component';
import { ProfileComponent } from './pages/profile.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/dashboard.component';
import { AdminProductsComponent } from './pages/admin/product-management.component';
import { AdminOrdersComponent } from './pages/admin/order-management.component';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';
import { authGuard } from './guards/auth.guard';
import { clientGuard } from './guards/client.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent, canActivate: [clientGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'home', component: HomeComponent, canActivate: [clientGuard] },
  { path: 'products', component: HomeComponent, canActivate: [clientGuard] },
  { path: 'product/:id', component: ProductDetailsComponent, canActivate: [clientGuard] },
  { path: 'cart', component: CartComponent, canActivate: [clientGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard, clientGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard, clientGuard] },
  {
    path: 'admin',

    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'orders', component: AdminOrdersComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
