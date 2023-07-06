import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from '../shared/error404/error404.component';
import { MainComponent } from '../shared/main/main.component';
import { AcercaDeComponent } from './acerca-de/acerca-de.component';
import { InicioComponent } from './inicio/inicio.component';

const routes: Routes = [
  { 
    path: '',
    component: MainComponent,
    children: [
      { path: 'home', component: InicioComponent },
      { path: 'acerca-de', component: AcercaDeComponent},
      { path: '404', component: Error404Component},
      { path: '**', redirectTo: '/public/404'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
