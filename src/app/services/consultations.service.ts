import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { PatientServiceEntity } from '../models/medial-consultation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultationsService extends ApiService{

  constructor(http: HttpClient) {  
    super(http);
    this.url += 'consultations/';
   }

   createConsultation(medicalConsultation: PatientServiceEntity): Observable<PatientServiceEntity> {
    return this.post<PatientServiceEntity, PatientServiceEntity>(`patients/${medicalConsultation.patient?.patientId}/consultations`, medicalConsultation);
   }

   getAllConsultationByPatientId(patientId: number) {
    return this.get<Array<PatientServiceEntity>>(`patient/${patientId}`)
   }
}
