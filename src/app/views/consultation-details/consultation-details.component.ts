import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-consultation-details',
  imports: [CommonModule, MatCardModule],
  templateUrl: './consultation-details.component.html',
  styleUrl: './consultation-details.component.scss'
})
export class ConsultationDetailsComponent {
  @Input() selectedConsultation: any;

}