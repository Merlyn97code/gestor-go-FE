import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { PatientsService } from '../../services/patients.service';
import { Gender, PatientData } from '../../models/patients';
import { PatientDetailsComponent } from '../patient-details/patient-details.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-patients',
  imports: [CommonModule, FormsModule, MatCardModule,
    MatButtonModule,
    MatIconModule,
  RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
  standalone: true
})
export class PatientsComponent {

  patients!: Array<PatientData>;
  selectedPatient!: PatientData;
  isModalOpen = false;
  isEdit = false;
  patientForm = { id: 0, name: '', age: 0, gender: '', medicalHistory: '' };
  searchQuery = '';
  
  constructor(private patientsService: PatientsService, private router: Router){}
  ngOnInit() {

    this.patientsService
    .getAllPatientsByUserId()
    .subscribe(patients => {
      this.patients = patients;
    });
  }

  searchPatients() {
    if (this.searchQuery) {
      //this.patients = this.patientsData.filter(patient => patient.name.includes(this.searchQuery) || patient.id.toString().includes(this.searchQuery));
    }
  }

  resetSearch() {
    this.searchQuery = '';
    //this.patients = this.patientsData;
  }

  viewPatientDetails(patient: PatientData) {    
    this.router.navigate(['patient-details', patient.patientId]);
  }

  scheduleAppointment() {
    //alert(`Agendar cita para ${this.selectedPatient.name}`);
  }

  closeDetails() {
    //this.selectedPatient = null;
  }

  editPatient(patient: any) {
    this.isModalOpen = true;
    this.isEdit = true;
    this.patientForm = { ...patient };
  }

  savePatient() {
    /*
    if (this.isEdit) {
      const index = this.patients.findIndex(patient => patient.id === this.patientForm.id);
      if (index > -1) {
        //this.patients[index] = { ...this.patientForm };
      }
    } else {
      const newId = this.patients.length + 1;
      const newPatient = { ...this.patientForm, id: newId };
      //this.patients.push(newPatient);
    }
    this.closeModal();
    */
  }

  closeModal() {
    this.isModalOpen = false;
    this.patientForm = { id: 0, name: '', age: 0, gender: '', medicalHistory: '' };
  }

  deletePatient(id: number) {
    //this.patients = this.patients.filter(patient => patient.id !== id);
  }


  getFullName(patient: PatientData) {
      const first = patient?.person.firstName ? patient?.person.firstName : '';
      const last = patient?.person.lastName ? patient?.person.lastName : '';
      const mother = patient?.person.motherLastName ? patient?.person.motherLastName : '';
    
      let fullName = '';
    
      if (first) {
        fullName += first;
      }
    
      if (last) {
        if (fullName) {
          fullName += ' ';
        }
        fullName += last;
      }
    
      if (mother) {
        if (fullName) {
          fullName += ' ';
        }
        fullName += mother;
      }
    
      return fullName;
    }

    // En tu componente TypeScript:
getGenderDisplay(gender: Gender): string {
  switch (gender) {
    case 'male':
      return 'Masculino';
    case 'female':
      return 'Femenino';
    case 'other':
      return 'Otro';
    default:
      return '';
  }
}
}
