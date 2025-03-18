import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Auth, Credentials } from '../models/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService extends ApiService{

  constructor(http: HttpClient) {
    super(http);
    this.url += 'auth';
   }

   login(credentials: Auth): Observable<Credentials> {
    return this.post<Auth, Credentials>('auth', credentials);
   }
}
