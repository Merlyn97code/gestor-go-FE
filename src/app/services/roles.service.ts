import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Roles } from '../models/roles';

@Injectable({
  providedIn: 'root'
})
export class RolesService extends ApiService {

  constructor(http: HttpClient) {
    super(http);
    this.url += 'roles';
   }

   getAllRoles(): Observable<Array<Roles>> {
    return this.get('');
   }

}
