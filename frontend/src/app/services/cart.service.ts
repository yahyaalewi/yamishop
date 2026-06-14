import { Injectable, signal } from '@angular/core';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  stock: number;
  color?: string;
  size?: string;
  shippingPrice: number;
}

function getInitialCart(): CartItem[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('yamishop_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
  }
  return [];
}

export const cartItems = signal<CartItem[]>(getInitialCart());
export const cartCount = signal(getInitialCart().reduce((n, i) => n + i.qty, 0));

@Injectable({
  providedIn: 'root'
})
export class CartService {
  addItem(product: any, qty: number, color?: string | null, size?: string | null, selectedImage?: string | null) {
    const items = cartItems();
    const existing = items.find(i => i.id === product._id && i.color === (color || undefined) && i.size === (size || undefined));
    const maxStock = product.stock || 0;
    
    if (existing) {
      cartItems.update(prev => prev.map(i => {
        if (i.id === product._id && i.color === (color || undefined) && i.size === (size || undefined)) {
          const newQty = Math.min(i.qty + qty, maxStock);
          return { ...i, qty: newQty };
        }
        return i;
      }));
    } else {
      const newItem: CartItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        image: selectedImage || product.imageUrl,   // ← use selected image if provided
        qty: Math.min(qty, maxStock),
        stock: maxStock,
        color: color || undefined,
        size: size || undefined,
        shippingPrice: product.shippingPrice || 0
      };
      cartItems.set([...items, newItem]);
    }
    
    this.syncCount();
  }

  updateQty(id: string, qty: number, color?: string, size?: string) {
    const items = cartItems();
    const item = items.find(i => i.id === id && i.color === color && i.size === size);
    if (!item) return;

    if (qty <= 0) {
      this.removeItem(id, color, size);
      return;
    }

    const newQty = Math.min(qty, item.stock || 999);
    cartItems.update(prev => prev.map(i => (i.id === id && i.color === color && i.size === size) ? { ...i, qty: newQty } : i));
    this.syncCount();
  }

  removeItem(id: string, color?: string, size?: string) {
    cartItems.update(prev => prev.filter(i => !(i.id === id && i.color === color && i.size === size)));
    this.syncCount();
  }

  clearCart() {
    cartItems.set([]);
    cartCount.set(0);
    this.syncCount();
  }

  syncCount() {
    cartCount.set(cartItems().reduce((n, i) => n + i.qty, 0));
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('yamishop_cart', JSON.stringify(cartItems()));
    }
  }
}
