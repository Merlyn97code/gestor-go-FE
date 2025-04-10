import { Tenant, User } from "./tenant-user";

export interface Person {
  personId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string | null;
  updatedAt: string | null;
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
  }