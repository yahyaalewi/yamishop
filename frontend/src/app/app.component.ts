import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationComponent } from './components/ui/notification.component';
import { ConfirmModalComponent } from './components/ui/confirm-modal.component';
import { MobileNavComponent } from './components/layout/mobile-nav.component';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent, ConfirmModalComponent, MobileNavComponent, CommonModule],
  template: `
    <app-notifications></app-notifications>
    <app-confirm-modal></app-confirm-modal>
    <router-outlet></router-outlet>
    <app-mobile-nav *ngIf="showMobileNav()"></app-mobile-nav>
  `
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  // Track URL changes to hide/show mobile nav
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    )
  );

  showMobileNav = computed(() => {
    // Access currentUrl and auth user signal to make this computed signal reactive
    this.currentUrl(); 
    const user = this.authService.currentUser();
    const isAdmin = this.authService.isAdmin();
    
    // Hide navigation for admins (restricted to dashboard)
    if (isAdmin) return false;
    
    // ONLY hide navigation on the very first splash screen (root path)
    const url = this.router.url;
    return url !== '/' && url !== '/welcome';
  });
}

