import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { AuthData } from './authData.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private isAuthenticated = false;
    private token: string;
    private authStatusListener = new Subject<boolean>();
    private tokenTimer: any;
    private userId: string;

    constructor(private httpClient: HttpClient, private router: Router) {}

    createUser(email: string, password: string) {
        const authData = new AuthData(email, password);
        this.httpClient.post(`${environment.URL}/signup`, authData)
            .subscribe(response => {
                // console.log(response);
                this.router.navigate(['/login']);
            }, error => {
                this.authStatusListener.next(false);
            });
    }

    login(email: string, password: string) {
        const authData = new AuthData(email, password);
        this.httpClient.post<{ token: string, expiresIn: number, userId: string }>(`${environment.URL}/login`, authData)
            .subscribe(response => {
                this.token = response.token;
                if(this.token) {
                    const expiresIn = response.expiresIn;
                    this.setAuthTimer(expiresIn);
                    this.authStatusListener.next(true);
                    this.isAuthenticated = true;
                    this.userId = response.userId;
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expiresIn * 1000);
                    this.saveToken(this.token, expirationDate, this.userId);
                    this.router.navigate(['/']);
                }
            }, error => {
                this.authStatusListener.next(false);
            });
    }

    logout() {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearData();
        this.userId = null;
        this.router.navigate(['/']);
    }

    getToken() {
        return this.token;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getAuthentication() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.userId;
    }

    autoAuthenticate() {
        const authInfo = this.getAuthData();
        if (authInfo) {
            const now = new Date();
            const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
            if (expiresIn > 0) {
                this.token = authInfo.token;
                this.isAuthenticated = true;
                this.userId = authInfo.userId;
                this.authStatusListener.next(true);
                this.setAuthTimer(expiresIn / 1000);
            }
        }
    }

    private saveToken(token: string, expirationDate: Date, userId: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId);
    }

    private clearData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userId');
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const userId = localStorage.getItem('userId');
        if (!token || !expirationDate) {
            return;
        }

        return {
            token,
            expirationDate: new Date(expirationDate),
            userId:userId
        }
    }

    private setAuthTimer(expiresIn: number) {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, expiresIn * 1000);
    }
}
