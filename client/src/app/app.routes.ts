import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { HomeComponent } from './features/shop/home/home';
import { ProductDetailsComponent } from './features/shop/product-details/product-details';
import { OrderHistoryComponent } from './features/shop/order-history/order-history';
import { CartComponent } from './features/shop/cart/cart';
import { ProfileComponent } from './features/shop/profile/profile.component';

export const routes: Routes = [
    { path: '', redirectTo: '/shop', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent }, // Add AuthGuard later
    { path: 'shop', component: HomeComponent },
    { path: 'product/:id', component: ProductDetailsComponent },
    { path: 'orders', component: OrderHistoryComponent },
    { path: 'order-history', component: OrderHistoryComponent },
    { path: 'cart', component: CartComponent },
    { path: 'profile', component: ProfileComponent },
    { path: '**', redirectTo: '/shop' }
];
