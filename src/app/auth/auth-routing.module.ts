import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from '../shared/main/main.component';
import { AcercaDeComponent } from '../public/acerca-de/acerca-de.component';
import { ActivarComponent } from './activar/activar.component';
import { LoginComponent } from './login/login.component';
import { MainAuthComponent } from './main-auth/main-auth.component';
import { RecuperarPasswordComponent } from './recuperar-password/recuperar-password.component';
import { RegistroComponent } from './registro/registro.component';
import { ResetearPasswordComponent } from './resetear-password/resetear-password.component';


const routes: Routes = [
  {
    path: '',
      component: MainComponent,
      children: [
        { path: 'acerca-de', component: AcercaDeComponent },
        { path: '',
          component: MainAuthComponent,
          children: [
            { path: 'login',component: LoginComponent }, // HECHO
            { path: 'registro', component: RegistroComponent }, // HECHO
            { path: 'activar-cuenta/:id', component: ActivarComponent }, // HECHO
            { path: 'password-olvidada', component: RecuperarPasswordComponent }, // HECHO
            { path: 'resetear-password/:id', component: ResetearPasswordComponent},
            { path: '**',redirectTo: 'login' }
          ]
        }
      ]
    }
    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
