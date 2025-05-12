import { BusinessService } from "./business-service";
import { Patient } from "./patients";

export interface PatientServiceEntity {
    reasonOfConsultation?: string,
    details?: string,
    notes?: string,
    patient?: Patient
    createdAt?: Date
    services: BusinessService[];
}