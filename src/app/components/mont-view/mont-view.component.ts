import { CommonModule } from '@angular/common';
import { Component, Input, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-mont-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatCardModule],
  templateUrl: './mont-view.component.html',
  styleUrls: ['./mont-view.component.scss']
})
export class MontViewComponent {
  @Input() appointments: any[] = [];
  selected: Date | null = null;


    // Manejar la selección de la fecha
    onDateSelected(date: Date | null): void {
      this.selected = date;
    }
}
