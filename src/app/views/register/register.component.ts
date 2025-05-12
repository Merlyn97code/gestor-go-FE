import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { RolesService } from '../../services/roles.service';
import { RoleName, Roles } from '../../models/roles';
import { BusinessSchedule, Person, Register, Tenant } from '../../models/tenant-user';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    standalone: true,
    imports: [FormsModule, CommonModule, MatFormFieldModule,
        ReactiveFormsModule, MatInputModule, MatOptionModule, MatButtonModule,
        MatSelectModule, MatStepperModule, RouterModule, MatCheckboxModule],
})
export class RegisterComponent implements OnInit {
    roles: Array<Roles> = [];
    selectedRoleId: number = 0;
    isLinear = false;
    roleId: number = 0;
    private _formBuilder = inject(FormBuilder);
    private router = inject(Router);
    @ViewChild('stepper') stepper!: MatStepper;
    tenantForm = this._formBuilder.group({
        name: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        email: ['', [Validators.required, Validators.email]],
        address: ['', Validators.required],
    });

    person = this._formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', Validators.required]        
    });

    passwords = this._formBuilder.group({
        password: ['', Validators.required],
        validatePassword: ['', Validators.required],
    });

    daysOfWeek: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    scheduleForm = this._formBuilder.group({});
    timeOptions: string[] = this.generateTimeOptions();

    constructor(private registerService: RegisterService, private rolesService: RolesService) {
        this.daysOfWeek.forEach((day, index) => {
            this.scheduleForm.addControl('openTime' + index, this._formBuilder.control(null));
            this.scheduleForm.addControl('closeTime' + index, this._formBuilder.control(null));
            this.scheduleForm.addControl('breakStartTime' + index, this._formBuilder.control(null));
            this.scheduleForm.addControl('breakEndTime' + index, this._formBuilder.control(null));
            this.scheduleForm.addControl('specialSchedule' + index, this._formBuilder.control(null));
            this.scheduleForm.addControl('nonWorkingDay' + index, this._formBuilder.control(false));
        });
    }

    ngOnInit(): void {
        this.loadRoles();
        this.setTenantEmailIntoPersonEmail();
    }
    setTenantEmailIntoPersonEmail() {
        this.tenantForm.get('email')
        ?.valueChanges.subscribe(tenantEmail => {
            this.person.get('email')?.setValue(tenantEmail);
        });

        this.tenantForm.get('phone')
        ?.valueChanges.subscribe(tenantEmail => {
            this.person.get('phone')?.setValue(tenantEmail);
        });
    }

    loadRoles() {
        this.rolesService.getAllRoles()
            .subscribe(roles => {
                this.roles = roles;
                const adminRole = this.roles.find(role => role.name.toString() === RoleName.ADMIN.toString());
                if (adminRole) {
                    this.roleId = adminRole.roleId;
                    this.selectedRoleId = adminRole.roleId;
                }
            });
    }

    getRoleName(): string {
        const selectedRole = this.roles.find(role => role.roleId === this.selectedRoleId);
        return selectedRole ? selectedRole.name : '';
    }

    onSubmit() {
        if (this.passwords.valid) {
            let register: Register = {
                person: this.person.value as Person,
                tenant: this.tenantForm.value as Tenant,
                userEntity: {
                    username: this.person.get('email')?.value as string,
                    password: this.passwords.get('password')?.value as string,
                    roleId: this.roleId,
                    enabled: true
                },            };

                register.tenant = {
                    ...register.tenant,
                    businessSchedules: this.getBusinessSchedules()
                }

                this.registerService.registerNewTenant(register)
                .subscribe({
                  next: userTenant => {
                    if (userTenant && userTenant.token) {
                      localStorage.setItem('authToken', userTenant.token);
                      this.router.navigate(['/welcome']);
                    }
                  },
                  error: err => {
                    if (err.status === 400 && err.error.field) {
                      const fieldName = err.error.field;                                      
                      const form = err.error.form;
                      this.stepper.selectedIndex = err.error.step || 0;
                  
                      switch (form) {
                        case 'tenantForm':
                            if (this.tenantForm.get(fieldName)) {
                                this.tenantForm.get(fieldName)?.setErrors({
                                  serverError: err.error.message
                                });
                              }     
                            break;        
                      }                   
                    }
                  }
                  
                });
              
        } else {
            console.log('Formulario no válido');
        }
    }

    generateTimeOptions(): string[] {
        const times: string[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const hourString = hour.toString().padStart(2, '0');
                const minuteString = minute.toString().padStart(2, '0');
                times.push(`${hourString}:${minuteString}`);
            }
        }
        return times;
    }

    getBusinessSchedules(): BusinessSchedule[] {
        return this.daysOfWeek.map((day, index) => ({
            dayOfWeek: day,
            openTime: this.scheduleForm.get('openTime' + index)?.value,
            closeTime: this.scheduleForm.get('closeTime' + index)?.value,
            breakStartTime: this.scheduleForm.get('breakStartTime' + index)?.value,
            breakEndTime: this.scheduleForm.get('breakEndTime' + index)?.value,
            specialSchedule: this.scheduleForm.get('specialSchedule' + index)?.value,
            nonWorkingDay: this.scheduleForm.get('nonWorkingDay' + index)?.value,
        }));
    }
}