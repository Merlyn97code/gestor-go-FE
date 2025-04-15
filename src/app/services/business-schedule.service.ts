import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { BusinessSchedule } from '../models/tenant-user';

@Injectable({
  providedIn: 'root'
})
export class BusinessScheduleService extends ApiService {

  constructor(http: HttpClient) {
    super(http);
    this.url += "api/schedules";
   }

   retrieveBusinessSchedule(): Observable<Array<BusinessSchedule>> {
    return this.get('');
   }
}
