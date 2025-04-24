import { Tenant, User } from "./tenant-user";

export interface Person {
  personId?: number;
  firstName: string;
  lastName: string;
  motherLastName?: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string | null;
  updatedAt: string | null;
  gender: Gender;
}

  export interface Patient {
    patientId?: number;
    person?: Person;
  }
  

  export interface PatientData {
    patientId: number;
    tenant: Tenant;
    person: Person;
    users: User[];
    createdAt: string;
    updatedAt: string;
    consultations: any[];
  }

  export enum Gender {
    male = 'male',
    female = 'female',
    other = 'other',
  }