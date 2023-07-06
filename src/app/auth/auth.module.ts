import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { ActivarComponent } from './activar/activar.component';
import { RecuperarPasswordComponent } from './recuperar-password/recuperar-password.component';
import { ResetearPasswordComponent } from './resetear-password/resetear-password.component';
import { MainAuthComponent } from './main-auth/main-auth.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimePagesModule } from '../prime-ng/prime-pages.module';
import { PrimeAuthModule } from '../prime-ng/prime-auth.module';


@NgModule({
  declarations: [
    LoginComponent,
    RegistroComponent,
    ActivarComponent,
    RecuperarPasswordComponent,
    ResetearPasswordComponent,
    MainAuthComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimePagesModule,
    PrimeAuthModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
