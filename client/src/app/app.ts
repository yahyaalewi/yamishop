import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Yamishop';
  isLoggedIn: boolean = false;
  role: string = '';
  private routerSubscription?: Subscription;

  constructor(private router: Router) { }

  ngOnInit() {
    // Vérifier l'état initial
    this.checkLoginStatus();
    console.log('🔍 Initial login status:', this.isLoggedIn);

    // Vérifier à chaque changement de route
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLoginStatus();
        console.log('🔍 Login status after navigation:', this.isLoggedIn);
      });

    // Vérifier toutes les secondes (pour détecter les changements de localStorage)
    setInterval(() => {
      const oldStatus = this.isLoggedIn;
      this.checkLoginStatus();
      if (oldStatus !== this.isLoggedIn) {
        console.log('🔄 Login status changed:', this.isLoggedIn);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkLoginStatus() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;

    if (this.isLoggedIn) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.role = user.role;
        } catch (e) {
          console.error('Error parsing user', e);
          this.role = '';
        }
      }
    } else {
      this.role = '';
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  clearStorage() {
    console.log('🗑️ Clearing localStorage...');
    localStorage.clear();
    this.checkLoginStatus();
    alert('✅ LocalStorage cleared! Bottom nav should disappear now.');
  }
  navigateTo(path: string) {
    console.log('👉 Navigating to:', path);
    this.router.navigate([path]);
  }
}
