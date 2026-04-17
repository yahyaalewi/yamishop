import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  imageUrl: string;
  images?: string[];
  features?: string[];
  colors?: string[];
  sizes?: string[];
  stock: number;
  gender?: 'homme' | 'femme' | 'unisexe';
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
  shippingPrice?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/products' 
    : 'https://yamishop-api.onrender.com/api/products';

  constructor(private http: HttpClient) { }

  getImageUrl(imageSource: any): string {
    // If no source is provided at all
    if (!imageSource) return 'https://via.placeholder.com/800x800.png?text=Bient%C3%B4t+Disponible';

    // Sometimes the whole product object is passed instead of just the URL
    const url = typeof imageSource === 'string' ? imageSource : (imageSource.imageUrl || imageSource.image);

    if (!url) return 'https://via.placeholder.com/800x800.png?text=Bient%C3%B4t+Disponible';

    // If it's already an absolute URL (e.g., Unsplash), return it as is
    if (url.startsWith('http')) return url;

    // If it's a base64 string
    if (url.startsWith('data:image')) return url;

    // Standardize the relative path
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    // Point to Render in production, localhost in dev
    const backendBase = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://yamishop-api.onrender.com';

    return `${backendBase}${cleanPath}`;
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<{ data: Product[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<{ data: Product }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createProduct(product: Partial<Product>): Observable<any> {
    return this.http.post(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const uploadUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api/uploads' 
      : 'https://yamishop-api.onrender.com/api/uploads';
    return this.http.post<{ url: string }>(uploadUrl, formData);
  }
}
