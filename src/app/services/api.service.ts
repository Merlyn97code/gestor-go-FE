import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Importa el archivo de entorno

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url: string = 'http://localhost:8080/';
  constructor(private http: HttpClient) { }

  post<T, R>(endpoint: string, body: T): Observable<R> {    
    return this.http.post<R>(this.url + endpoint, body);
  }

  
  // Método GET
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.url}${endpoint}`);
  }

  getPath<T>(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  getQP<T>(endpoint: string, queryParams?: { [key: string]: any }): Observable<T> {
    let params = new HttpParams();

    if (queryParams) {
      for (const key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
          const value = queryParams[key];
          if (Array.isArray(value)) {
            // Si el valor es un array, agrega cada elemento como un parámetro separado (común para filtros)
            value.forEach(v => params = params.append(key, v));
          } else if (value !== null && value !== undefined) {
            params = params.set(key, value);
          }
        }
      }
    }

    return this.http.get<T>(`${this.url}${endpoint}`, { params });
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
