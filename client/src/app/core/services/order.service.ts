import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    createOrder(order: any): Observable<any> {
        return this.http.post(this.apiUrl, order);
    }

    getMyOrders(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/my-orders`);
    }

    getAllOrders(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    updateOrderStatus(id: string, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/status`, { status });
    }

    // Alias for compatibility
    getOrders(): Observable<any[]> {
        return this.getAllOrders();
    }
}
