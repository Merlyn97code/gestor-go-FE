import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Appointment } from '../models/appointment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService extends ApiService{

  constructor(http: HttpClient) {
    super(http);
    this.url += "appointment";
   }

   saveAppointment(body: Appointment): Observable<any> {
    return this.post<any, any>('',body);
   }

   getAllAppointment():Observable<Array<Appointment>> {
    return this.get<Array<Appointment>>('');
   }
}
