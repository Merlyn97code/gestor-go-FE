import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { Patient, PatientData, Person } from '../models/patients';
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

  getAllPatientsByUserId(): Observable<Array<PatientData>> {
    return this.get<Array<PatientData>>('');
  }

  getPatientById(id: number): Observable<PatientData> {
    return this.getPath<PatientData>(id);
  }

  getPatientByName(name: string): Observable<Array<PatientData>> {
    return this.getQP('/search', {name});
  }
}
