import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { RegisterService } from '../../services/register.service';
import { RolesService } from '../../services/roles.service';
import {MatSelectModule} from '@angular/material/select';
import { RoleName, Roles } from '../../models/roles';
import {MatStepperModule} from '@angular/material/stepper';
import { Person, Register, Tenant } from '../../models/tenant-user';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatAutocompleteModule, 
    ReactiveFormsModule, MatInputModule, MatIconModule, MatOptionModule, MatButtonModule, MatDialogModule, 
    MatSelectModule,MatStepperModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  standalone: true,
})
export class RegisterComponent implements OnInit{    
    roles: Array<Roles> = [];
    selectedRoleId: number = 0; 
    isLinear = false;
    roleId: number = 0;
    private _formBuilder = inject(FormBuilder);
    private router = inject(Router);
    tenantForm = this._formBuilder.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      whatsAppNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
    });

    person = this._formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', Validators.required],
        address: ['']
      }
    );
    passwords = this._formBuilder.group({
      password: ['', Validators.required],
      validatePassword: ['', Validators.required],
    });
    constructor(private registerService: RegisterService, private rolesService: RolesService) {
    }
  ngOnInit(): void {
    this.loadRoles();
  }
  loadRoles() {
    this.rolesService.getAllRoles()
      .subscribe(roles => {
        this.roles = roles;
        const adminRole = this.roles.find(role => role.name.toString() === RoleName.ADMIN.toString());

        if (adminRole) {
          this.roleId = adminRole.roleId;          
          // Asigna el id del rol y deshabilita el select si es necesario
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
          user: {
            username: this.person.get('email')?.value as string,
            password: this.passwords.get('password')?.value as string,
            roleId: this.roleId,
            enabled: true
          }      
        }

        this.registerService.registerNewTenant(register)
        .subscribe(userTenant => {
          if (userTenant) {
            this.router.navigate(['/welcome']);
          }          
        });
        
      } else {
        console.log('Formulario no válido');
      }
    }
}
