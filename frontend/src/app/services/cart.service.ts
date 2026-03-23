import { Injectable, signal } from '@angular/core';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  color?: string;
  size?: string;
}

export const cartCount = signal(0);
export const cartItems = signal<CartItem[]>([]);

@Injectable({
  providedIn: 'root'
})
export class CartService {
  addItem(product: any, qty: number, color?: string | null, size?: string | null) {
    const items = cartItems();
    // Unique check should now include color and size if they exist
    const existing = items.find(i => i.id === product._id && i.color === (color || undefined) && i.size === (size || undefined));
    
    if (existing) {
      cartItems.update(prev => prev.map(i => (i.id === product._id && i.color === (color || undefined) && i.size === (size || undefined)) ? { ...i, qty: i.qty + qty } : i));
    } else {
      const newItem: CartItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        qty: qty,
        color: color || undefined,
        size: size || undefined
      };
      cartItems.set([...items, newItem]);
    }
    
    this.syncCount();
  }

  updateQty(id: string, qty: number, color?: string, size?: string) {
    if (qty <= 0) {
      this.removeItem(id, color, size);
      return;
    }
    cartItems.update(prev => prev.map(i => (i.id === id && i.color === color && i.size === size) ? { ...i, qty } : i));
    this.syncCount();
  }

  removeItem(id: string, color?: string, size?: string) {
    cartItems.update(prev => prev.filter(i => !(i.id === id && i.color === color && i.size === size)));
    this.syncCount();
  }

  clearCart() {
    cartItems.set([]);
    cartCount.set(0);
  }

  syncCount() {
    cartCount.set(cartItems().reduce((n, i) => n + i.qty, 0));
  }
}
