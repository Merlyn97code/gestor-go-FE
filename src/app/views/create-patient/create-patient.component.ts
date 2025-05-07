import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PatientsService } from '../../services/patients.service';
import { Patient, Person } from '../../models/patients';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-create-patient',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule
  ],
  templateUrl: './create-patient.component.html',
  styleUrl: './create-patient.component.scss'
})
export class CreatePatientComponent {

  patientForm: FormGroup;

  constructor(private fb: FormBuilder, private patientService: PatientsService, private router: Router) {
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      motherLastName: [''],
      phone: ['', Validators.required],
      email: ['', [Validators.email]],
      address: [''],
      gender: ['', Validators.required],
      birthday: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.patientForm.valid) {
      let patient: Patient = {
        person: this.patientForm.value as Person
      }
      this.patientService
      .createPatient(patient)
      .subscribe(() => {
        this.router.navigate(['/pacientes']);
      });
    }
  }
}
