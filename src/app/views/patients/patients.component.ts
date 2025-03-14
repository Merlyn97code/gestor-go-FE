import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-patients',
  imports: [CommonModule, FormsModule, MatCardModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
  standalone: true
})
export class PatientsComponent {
  patients!: Array<any>;
  selectedPatient: any = null;
  isModalOpen = false;
  isEdit = false;
  patientForm = { id: 0, name: '', age: 0, gender: '', medicalHistory: '' };
  searchQuery = '';
  
  patientsData = [
    { id: 1, name: 'Juan Pérez', age: 30, gender: 'Male', medicalHistory: 'Alergias', appointments: [{ date: '2023-06-15', description: 'Consulta general' }], documents: [{ name: 'Receta médica', url: 'http://example.com/receta' }] },
    { id: 2, name: 'María García', age: 25, gender: 'Female', medicalHistory: 'Dolor de cabeza', appointments: [{ date: '2023-07-10', description: 'Consulta de neurología' }], documents: [{ name: 'Examen de sangre', url: 'http://example.com/examen' }] }
  ];

  ngOnInit() {
    this.patients = this.patientsData;
  }

  searchPatients() {
    if (this.searchQuery) {
      this.patients = this.patientsData.filter(patient => patient.name.includes(this.searchQuery) || patient.id.toString().includes(this.searchQuery));
    }
  }

  resetSearch() {
    this.searchQuery = '';
    this.patients = this.patientsData;
  }

  viewPatientDetails(patient: any) {
    this.selectedPatient = patient;
  }

  scheduleAppointment() {
    alert(`Agendar cita para ${this.selectedPatient.name}`);
  }

  closeDetails() {
    this.selectedPatient = null;
  }

  editPatient(patient: any) {
    this.isModalOpen = true;
    this.isEdit = true;
    this.patientForm = { ...patient };
  }

  savePatient() {
    if (this.isEdit) {
      const index = this.patients.findIndex(patient => patient.id === this.patientForm.id);
      if (index > -1) {
        this.patients[index] = { ...this.patientForm };
      }
    } else {
      const newId = this.patients.length + 1;
      const newPatient = { ...this.patientForm, id: newId };
      this.patients.push(newPatient);
    }
    this.closeModal();
  }

  closeModal() {
    this.isModalOpen = false;
    this.patientForm = { id: 0, name: '', age: 0, gender: '', medicalHistory: '' };
  }

  deletePatient(id: number) {
    this.patients = this.patients.filter(patient => patient.id !== id);
  }
}
