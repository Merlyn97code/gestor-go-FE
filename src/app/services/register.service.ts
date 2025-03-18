import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Register } from '../models/tenant-user';

@Injectable({
  providedIn: 'root'
})
export class RegisterService extends ApiService{

  
  constructor(http: HttpClient) { 
    super(http);
    this.url += 'register-tenant-user';
  }

  registerNewTenant(tenantUser: Register): Observable<Register> {

    return this.post<Register, Register>('',tenantUser);
  }


}
