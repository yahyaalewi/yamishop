import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Store {
  _id?: string;
  name: string;
  logo?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  adminUser?: string;
  createdAt?: string;
}

export interface StoreStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  revenue: number;
  totalCustomers: number;
  topProducts: { _id: string; name: string; imageUrl: string; price: number }[];
}

export interface CreateStorePayload {
  name: string;
  logo?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive';
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;
  adminPassword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/stores'
    : 'https://yamishop-api.onrender.com/api/stores';

  constructor(private http: HttpClient) {}

  // NOTE: Auth token is automatically attached by the global authInterceptor

  getPublicStores(): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.apiUrl}/public`);
  }

  getStores(): Observable<Store[]> {
    return this.http.get<Store[]>(this.apiUrl);
  }

  getStoreById(id: string): Observable<Store> {
    return this.http.get<Store>(`${this.apiUrl}/${id}`);
  }

  createStore(payload: CreateStorePayload): Observable<{ store: Store; adminUser: any }> {
    return this.http.post<{ store: Store; adminUser: any }>(this.apiUrl, payload);
  }

  updateStore(id: string, payload: Partial<CreateStorePayload>): Observable<Store> {
    return this.http.put<Store>(`${this.apiUrl}/${id}`, payload);
  }

  deleteStore(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  toggleStoreStatus(id: string): Observable<Store> {
    return this.http.patch<Store>(`${this.apiUrl}/${id}/status`, {});
  }

  getStoreStats(id: string): Observable<StoreStats> {
    return this.http.get<StoreStats>(`${this.apiUrl}/${id}/stats`);
  }

  resetStoreAdminPassword(id: string, newPassword: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/${id}/reset-password`,
      { newPassword }
    );
  }

  getMyStore(): Observable<Store> {
    return this.http.get<Store>(`${this.apiUrl}/me`);
  }

  getMyStoreStats(): Observable<StoreStats> {
    return this.http.get<StoreStats>(`${this.apiUrl}/my-stats`);
  }
}
