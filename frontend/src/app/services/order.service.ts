import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Order {
  _id: string;
  user?: {
    _id: string;
    name: string;
    phone: string;
  };
  orderItems: any[];
  shippingAddress: any;
  paymentMethod: string;
  totalPrice: number;
  shippingPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  isConfirmed: boolean;
  confirmedAt?: Date;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/orders' 
    : 'https://yamishop-api.onrender.com/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<{data: Order[]}>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }
  
  getMyOrders(): Observable<Order[]> {
    return this.http.get<{data: Order[]}>(`${this.apiUrl}/myorders`).pipe(
      map(response => response.data)
    );
  }

  createOrder(order: any): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrderToPaid(id: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/pay`, {});
  }

  confirmOrder(id: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/confirm`, {});
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  downloadInvoice(id: string, lang: string = 'fr'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/invoice?lang=${lang}`, {
      responseType: 'blob'
    });
  }

  addReview(orderId: string, productId: string, rating: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/review`, { productId, rating });
  }
}
