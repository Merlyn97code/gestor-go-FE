import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Patient, Person } from '../models/patients';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientsService extends ApiService{

  constructor(http: HttpClient) {
    super(http);
    this.url += "patients";
   }

  createPatient(patient: Patient): Observable<any> {
    return this.post<any, any>('',patient);
  }
}
