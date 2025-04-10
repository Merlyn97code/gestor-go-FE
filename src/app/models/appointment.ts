import { Patient } from "./patients";

export interface Appointment {
    appointmentId?: number
    patient: Patient,
    appointmentDate?: Date,
    appointmentEnd: Date,
    appointmentStart: Date
}