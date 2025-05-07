import { Patient } from "./patients";

export interface MedicalConsultation {
    reasonOfConsultation?: string,
    details?: string,
    notes?: string,
    patient?: Patient
    createdAt?: Date
}