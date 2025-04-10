import { Component, Input } from '@angular/core';
import { PatientData } from '../../models/patients';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientsService } from '../../services/patients.service';

@Component({
  selector: 'app-patient-details',
  imports: [CommonModule, MatCardModule, RouterModule],
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss',
  standalone: true
})
export class PatientDetailsComponent {

  patient!: PatientData;
  patientId!: number;

  constructor(private route: ActivatedRoute, private patientService: PatientsService, private router: Router) {}


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];  // Convierte a número
      console.log('Patient ID:', this.patientId);
      this.patientService.getPatientById(this.patientId)
      .subscribe(patientDetailsData => {
        console.log('====================================');
        console.log("patient details ", patientDetailsData);
        console.log('====================================');
        this.patient = patientDetailsData;
      });
    });
  }

  viewAgenda(patient: PatientData) {    
    this.router.navigate(['agenda', patient.patientId]);
  }

}
