import { Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { AgendaComponent } from './views/agenda/agenda.component';
import { PatientsComponent } from './views/patients/patients.component';
import { RegisterComponent } from './views/register/register.component';
import { WelcomeComponent } from './views/welcome/welcome.component';
import { CreatePatientComponent } from './views/create-patient/create-patient.component';
import { PatientDetailsComponent } from './views/patient-details/patient-details.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "dashboard",
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'agenda/:id',
        component: AgendaComponent,
        canActivate: [authGuard]
    },    
    {
        path: 'agenda',
        component: AgendaComponent,
        canActivate: [authGuard]
    },    
    {
        path: 'pacientes',
        component: PatientsComponent,
        canActivate: [authGuard]
    },
    {
        path: "registrarse",
        component: RegisterComponent        
    },
    {
        path: 'welcome',
        component: WelcomeComponent,
        canActivate: [authGuard]
    },
    {
        path: 'patient',
        component: CreatePatientComponent,
        canActivate: [authGuard]
    },
    {
        path: 'patient-details/:id',
        component: PatientDetailsComponent,
        canActivate: [authGuard]
    }
];
