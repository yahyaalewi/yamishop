import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private tokenKey = 'yamishop_token';

    constructor(private http: HttpClient) { }

    register(user: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, user);
    }

    verifyOtp(data: { phoneNumber: string, otp: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify-otp`, data).pipe(
            tap((res: any) => {
                if (res.token) {
                    this.setToken(res.token);
                }
            })
        );
    }

    login(credentials: { phoneNumber: string, password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials);
    }

    setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        return !!token; // Add expiry check logic here later
    }

    getUserRole(): string {
        const token = this.getToken();
        if (!token) return '';
        const decoded: any = jwtDecode(token);
        return decoded.role || '';
    }
}
