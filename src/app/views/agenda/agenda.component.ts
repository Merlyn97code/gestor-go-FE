import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MontViewComponent } from '../../components/mont-view/mont-view.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppintmentModalComponent } from '../appontment-modal/appointment-modal.component';


@Component({
  selector: 'app-agenda',
  imports: [    FormsModule, CommonModule, MontViewComponent, MatFormFieldModule, MatAutocompleteModule, 
    ReactiveFormsModule, MatInputModule, MatIconModule, MatOptionModule, MatButtonModule, MatDialogModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
  standalone: true
})
export class AgendaComponent implements OnInit {  medicos = [{ name: 'Dr. Juan Pérez' }, { name: 'Dr. Ana García' }];
pacientes = [{ name: 'Carlos Martínez' }, { name: 'Luisa Rodríguez' }];
especialidades = [{ name: 'Cardiología' }, { name: 'Pediatría' }];

selectedMedico!: string;
selectedPaciente!: string;
selectedEspecialidad!: string;

appointments = [
  { time: '10:00 AM', paciente: 'Carlos Martínez', motivo: 'Consulta general' },
  { time: '11:00 AM', paciente: 'Luisa Rodríguez', motivo: 'Chequeo rutinario' }
];

selectedAppointment: any = null;
filteredPacientes: Observable<any> | undefined;
pacienteControl = new FormControl('');
appointmentForm!: FormGroup;
isModalOpen = false; // Variable para controlar la visibilidad del modal

constructor(public dialog: MatDialog) {}

ngOnInit() {
  this.filteredPacientes = this.pacienteControl.valueChanges.pipe(
    startWith(''),
    map(value => value ? this._filter(value, this.pacientes) : [])
  );

  this.appointmentForm = new FormGroup({
    time: new FormControl(''),
    notes: new FormControl('')
  });
}

private _filter(value: string, list: any[]): any[] {
  const filterValue = value.toLowerCase();
  return list.filter(item => item.name.toLowerCase().includes(filterValue));
}

openAppointmentModal() {
  const dialogRef = this.dialog.open(AppintmentModalComponent, {
    width: '400px',
    data: this.appointmentForm.value
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.appointments.push(result);
    }
  });
}

selectAppointment(appointment: any) {
  this.selectedAppointment = appointment;
}

editAppointment(appointment: any) {
  console.log('Editar cita', appointment);
}

deleteAppointment(appointment: any) {
  this.appointments = this.appointments.filter(a => a !== appointment);
}

onPacienteSelected(event: any) {
  console.log('Paciente seleccionado:', event.option.value);
}


closeAppointmentModal() {
  this.isModalOpen = false;
}

}
