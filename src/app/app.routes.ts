import { Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { AgendaComponent } from './views/agenda/agenda.component';
import { PatientsComponent } from './views/patients/patients.component';
import { RegisterComponent } from './views/register/register.component';
import { WelcomeComponent } from './views/welcome/welcome.component';

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
    },
    {
        path: "registrarse",
        component: RegisterComponent
    },
    {
        path: 'welcome',
        component: WelcomeComponent
    }
];
