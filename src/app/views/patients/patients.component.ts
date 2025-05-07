import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { PatientsService } from '../../services/patients.service';
import { Gender, Patient, PatientData } from '../../models/patients';
import { PatientDetailsComponent } from '../patient-details/patient-details.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, filter, Observable, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-patients',
  imports: [CommonModule, FormsModule, MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,    
    MatAutocompleteModule,
  ],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
  standalone: true
})
export class PatientsComponent {
  selectedPatient: Patient | null = null; // Cambiado a un solo paciente
  patients!:Array<PatientData>;  
  isModalOpen = false;
  isEdit = false;
  patientForm = { id: 0, name: '', age: 0, gender: '', medicalHistory: '' };  
  searchQuery = new FormControl('');
  searchResults$!: Observable<Array<PatientData>> | undefined;
  constructor(private patientsService: PatientsService, private router: Router){}
  ngOnInit() {

    this.patientsService
    .getAllPatientsByUserId()
    .subscribe(patients => {
      this.patients = patients;
    });


    this.searchResults$ = this.searchQuery.valueChanges.pipe(
      startWith(''), // Emitir un valor inicial (vacío) al suscribirse
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          // Si el término es vacío o tiene menos de 2 caracteres,
          // llama a getAllPatientsByUserId y envuélvelo en un Observable
          return this.patientsService.getAllPatientsByUserId();
        } else {
          // Si el término tiene 2 o más caracteres, realiza la búsqueda por nombre
          return this.patientsService.getPatientByName(term);
        }
      })
    );
    this.searchResults$.subscribe(results => {
      this.patients = results;
    });

    // También podrías cargar todos los pacientes al inicializar el componente
    this.loadAllPatients();
  }
  loadAllPatients(): void {
    this.patientsService.getAllPatientsByUserId().subscribe(patients => {
      this.patients = patients;
    });
  }

  searchPatients() {
    if (this.searchQuery) {
      //this.patients = this.patientsData.filter(patient => patient.name.includes(this.searchQuery) || patient.id.toString().includes(this.searchQuery));
    }
  }

  resetSearch() {    
    
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
     if (patient && patient.person) {
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
     return '';
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
