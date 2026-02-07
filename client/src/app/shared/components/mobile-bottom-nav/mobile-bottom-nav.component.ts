import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-mobile-bottom-nav',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './mobile-bottom-nav.component.html',
    styleUrls: ['./mobile-bottom-nav.component.scss']
})
export class MobileBottomNavComponent implements OnInit {
    currentRoute: string = '';
    userRole: string = 'Client';

    constructor(public router: Router) { } // Changed to public

    ngOnInit() {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            this.userRole = userData.role || 'Client';
        }

        this.currentRoute = this.router.url;
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: any) => {
                this.currentRoute = event.url;
            });
    }

    isActive(route: string): boolean {
        return this.currentRoute.includes(route);
    }

    get isAdmin(): boolean {
        return this.userRole === 'Manager';
    }

    get isClient(): boolean {
        return this.userRole === 'Client';
    }

    navigateToDashboard() {
        this.router.navigate(['/dashboard']);
    }

    navigateToProducts() {
        this.router.navigate(['/dashboard'], { fragment: 'products' });
    }

    navigateToOrders() {
        this.router.navigate(['/dashboard'], { fragment: 'orders' });
    }

    get cartItemsCount(): number {
        return 0;
    }

    get pendingOrdersCount(): number {
        return 0;
    }
}
