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
      ConsultationDetailsComponent
  ]
})
export class PatientDetailsComponent implements AfterViewInit, OnDestroy {
  patient!: PatientData;
  patientId!: number;
  showNewConsultation = false;
  newConsultation = { reason: '', details: '', notes: '' };
  selectedConsultation: any;
  private clickInsideConsultationDetails = false;
  @ViewChild('consultationDetailsCard') consultationDetailsCard!: ElementRef;
  @ViewChild('consultationDetailsContainer') consultationDetailsContainer!: ElementRef;

  constructor(
      private route: ActivatedRoute,
      private patientService: PatientsService,
      private router: Router,
      private renderer: Renderer2
  ) { }

  ngOnInit(): void {
      this.route.params.subscribe(params => {
          this.patientId = +params['id'];
          this.patientService.getPatientById(this.patientId).subscribe(patientDetailsData => {
              this.patient = patientDetailsData;

              // Mock de consultas
              this.patient.consultations = [
                  {
                      reason: 'Dolor de cabeza',
                      details: 'Dolor punzante en la sien derecha.',
                      notes: 'Recetar analgésico.',
                      date: new Date('2023-11-10T10:00:00')
                  },
                  {
                      reason: 'Control de rutina',
                      details: 'Revisión general y presión arterial.',
                      notes: 'Todo normal.',
                      date: new Date('2023-12-05T14:30:00')
                  },
                  {
                      reason: 'Lesión en tobillo',
                      details: 'Esguince leve durante el ejercicio.',
                      notes: 'Aplicar hielo y reposo.',
                      date: new Date('2024-01-15T09:15:00')
                  }
              ];
          });
      });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
  }

  viewAgenda(patient: PatientData) {
      this.router.navigate(['agenda', patient.patientId]);
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
  }

  addConsultation() {
      this.showNewConsultation = false;
      this.newConsultation = { reason: '', details: '', notes: '' };
  }

  showConsultationDetails(consultation: any) {
    this.clickInsideConsultationDetails = true; // Set to true when clicked inside
    this.selectedConsultation = consultation;
}

@HostListener('document:click', ['$event'])
closeConsultationDetailsOnClickOutside(event: MouseEvent) {
    if (this.selectedConsultation && this.consultationDetailsContainer && !this.clickInsideConsultationDetails && !this.consultationDetailsContainer.nativeElement.contains(event.target as Node)) {
        this.selectedConsultation = null;
    }
    this.clickInsideConsultationDetails = false; // Reset the flag
}
}