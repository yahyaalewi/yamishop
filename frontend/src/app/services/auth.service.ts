import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  // Dynamic URL based on environment
  private apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/users' 
    : 'https://yamishop-api.onrender.com/api/users';
  
  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('yamishop_user');
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  login(phone: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { phone, password }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('yamishop_user', JSON.stringify(res));
          this.currentUser.set(res);
        }
      })
    );
  }

  verifyOtp(userId: string, otpCode: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/verify-otp`, { userId, otpCode }).pipe(
      tap(user => {
        if (user && user.token) {
          localStorage.setItem('yamishop_user', JSON.stringify(user));
          this.currentUser.set(user);
        }
      })
    );
  }

  register(name: string, phone: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, { name, phone, password }).pipe(
      tap(user => {
        if (user && user.token) {
          localStorage.setItem('yamishop_user', JSON.stringify(user));
          this.currentUser.set(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('yamishop_user');
    this.currentUser.set(null);
  }

  isAdmin(): boolean {
    return !!this.currentUser() && this.currentUser()!.role === 'admin';
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data).pipe(
      tap(user => {
        if (user) {
          const updatedUser = { ...this.currentUser()!, ...user };
          localStorage.setItem('yamishop_user', JSON.stringify(updatedUser));
          this.currentUser.set(updatedUser);
        }
      })
    );
  }
}
