import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  _id?: string;
  name: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/categories'
    : 'https://yamishop-api.onrender.com/api/categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  createCategory(category: { name: string; image?: string }): Observable<Category> {
    // The global authInterceptor automatically attaches the Bearer token
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(id: string, category: { name?: string; image?: string }): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
