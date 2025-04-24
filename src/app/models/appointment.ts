import { Patient } from "./patients";

export interface Appointment {
    appointmentId?: number,
    fullName?: string,
    patient: Patient,
    appointmentDate?: Date,
    appointmentEnd: Date,
    appointmentStart: Date
}