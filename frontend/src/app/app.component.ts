import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationComponent } from './components/ui/notification.component';
import { ConfirmModalComponent } from './components/ui/confirm-modal.component';
import { MobileNavComponent } from './components/layout/mobile-nav.component';
import { HeaderComponent } from './components/layout/header.component';
import { FooterComponent } from './components/layout/footer.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent, ConfirmModalComponent, MobileNavComponent, HeaderComponent, FooterComponent, CommonModule],
  template: `
    <app-notifications></app-notifications>
    <app-confirm-modal></app-confirm-modal>
    
    <!-- Stable Global Header -->
    <app-header *ngIf="showNavigation()"></app-header>
    
    <main [class.pt-16]="showNavigation()" [class.pb-16]="showNavigation()" class="min-h-screen flex flex-col bg-gray-50 md:pb-0">
      <div class="flex-grow">
        <router-outlet></router-outlet>
      </div>
      <app-footer *ngIf="showNavigation()"></app-footer>
    </main>
    
    <!-- Stable Bottom Navigation for Mobile -->
    <app-mobile-nav *ngIf="showNavigation()"></app-mobile-nav>
  `
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    )
  );

  showNavigation = computed(() => {
    this.currentUrl(); 
    const isAdmin = this.authService.isAdmin();
    if (isAdmin) return false;
    
    const url = this.router.url;
    // Hide ONLY on welcome and splash screen, show on login/register for stability
    return url !== '/' && url !== '/welcome';
  });
}

