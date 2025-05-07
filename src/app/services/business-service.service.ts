import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { BusinessService } from '../models/business-service';

@Injectable({
  providedIn: 'root'
})
export class BusinessServiceService extends ApiService{

  constructor(http: HttpClient) {
    super(http);
    this.url += 'business-service';
   }

   getAllServices() {
    return this.get<Array<BusinessService>>('');
   }
}
