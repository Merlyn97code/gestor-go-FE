import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url: string = 'http://localhost:8080/';
  constructor(private http: HttpClient) { }

  post<T, R>(endpoint: string, body: T): Observable<R> {
    return this.http.post<R>(this.url, body);
  }

  
  // Método GET
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.url}${endpoint}`);
  }

  // Método PUT
  put<T>(endpoint: string, body: T): Observable<T> {
    return this.http.put<T>(`${this.url}${endpoint}`, body);
  }

  // Método PATCH
  patch<T>(endpoint: string, body: T): Observable<T> {
    return this.http.patch<T>(`${this.url}${endpoint}`, body);
  }
}
