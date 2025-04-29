import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BusinessServiceService extends ApiService{

  constructor(http: HttpClient) {
    super(http);
    this.url += 'business-service';
   }
}
