import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private items: any[] = [];
    private key = 'yamishop_cart';
    private cartSubject = new BehaviorSubject<any[]>([]);
    cart$ = this.cartSubject.asObservable();

    constructor() {
        const saved = localStorage.getItem(this.key);
        if (saved) {
            this.items = JSON.parse(saved);
        }
        this.cartSubject.next(this.items);
    }

    getItems() {
        return this.items;
    }

    addToCart(product: any) {
        const existing = this.items.find(i => i._id === product._id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.save();
    }

    updateCart(items: any[]) {
        this.items = items;
        this.save();
    }

    clearCart() {
        this.items = [];
        this.save();
    }

    private save() {
        localStorage.setItem(this.key, JSON.stringify(this.items));
        this.cartSubject.next(this.items);
    }
}
