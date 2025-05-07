import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  Renderer2,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientData, Gender } from '../../models/patients';
import { PatientsService } from '../../services/patients.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatCardModule
} from '@angular/material/card';
import {
  MatIconModule
} from '@angular/material/icon';
import {
  MatFormFieldModule
} from '@angular/material/form-field';
import {
  MatInputModule
} from '@angular/material/input';
import {
  MatListModule
} from '@angular/material/list';
import {
  MatButtonModule
} from '@angular/material/button';
import {
  MatDividerModule
} from '@angular/material/divider';
import { ConsultationDetailsComponent } from '../consultation-details/consultation-details.component';
import { ConsultationsService } from '../../services/consultations.service';
import { MedicalConsultation } from '../../models/medial-consultation';

@Component({
  selector: 'app-patient-details',
  standalone: true,
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss',
  imports: [
      CommonModule,
      MatCardModule,
      RouterModule,
      MatIconModule,
      MatFormFieldModule,
      MatInputModule,
      MatListModule,
      FormsModule,
      MatButtonModule,
      MatDividerModule,
      ConsultationDetailsComponent,
  ]
})
export class PatientDetailsComponent implements AfterViewInit, OnDestroy {
  patient!: PatientData;
  patientId!: number;
  showNewConsultation = false;
  newConsultation: MedicalConsultation = {patient: this.patient, details: '', notes: '', reasonOfConsultation: ''};
  selectedConsultation!: MedicalConsultation | null;
  currentDate!: Date;
  private clickInsideConsultationDetails = false;
  @ViewChild('consultationDetailsCard') consultationDetailsCard!: ElementRef;
  @ViewChild('consultationDetailsContainer') consultationDetailsContainer!: ElementRef;

  constructor(
      private route: ActivatedRoute,
      private patientService: PatientsService,
      private router: Router,
      private consultationService: ConsultationsService      
  ) { }

  ngOnInit(): void {
      this.route.params.subscribe(params => {
          this.patientId = +params['id'];
          this.patientService.getPatientById(this.patientId).subscribe(patientDetailsData => {
              this.patient = patientDetailsData;
              this.getConsultations();     
          });
      });
  }

  getConsultations() {
    this.consultationService.getAllConsultationByPatientId(this.patientId)
              .subscribe(consultations => {
                this.patient.consultations = consultations;                              
              }); 
  }

  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
  }

  viewAgenda(patient: PatientData) {
    if (patient) {
      this.router.navigate(['agenda', patient.patientId]);
    }      
  }

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

  toggleNewConsultation() {
      this.showNewConsultation = !this.showNewConsultation;
      this.selectedConsultation = null;
  }

  addConsultation() {  
      this.newConsultation.patient = {
        patientId: this.patientId
      }
      this.newConsultation.createdAt = this.currentDate;
      this.consultationService.createConsultation(this.newConsultation)
      .subscribe(consultationCreated => {        
        this.getConsultations();  
      });
      this.showNewConsultation = false;
      //this.newConsultation = { reason: '', details: '', notes: '' };
  }

  showConsultationDetails(consultation: any) {    
    this.clickInsideConsultationDetails = true; // Set to true when clicked inside
    this.selectedConsultation = consultation;
    this.showNewConsultation = false;
}

@HostListener('document:click', ['$event'])
closeConsultationDetailsOnClickOutside(event: MouseEvent) {
    if (this.selectedConsultation && this.consultationDetailsContainer && !this.clickInsideConsultationDetails && !this.consultationDetailsContainer.nativeElement.contains(event.target as Node)) {
        this.selectedConsultation = null;   
    }
    this.clickInsideConsultationDetails = false; // Reset the flag
}

getTodayDate() {
  this.currentDate = new Date();
  return this.currentDate;
}
}