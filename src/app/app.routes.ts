import { Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { AgendaComponent } from './views/agenda/agenda.component';
import { PatientsComponent } from './views/patients/patients.component';

export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "dashboard",
        component: DashboardComponent
    },
    {
        path: 'agenda',
        component: AgendaComponent
    },
    {
        path: 'pacientes',
        component: PatientsComponent
    }
];
