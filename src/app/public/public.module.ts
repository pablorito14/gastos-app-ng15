import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { CardModule } from 'primeng/card';
import { AcercaDeComponent } from './acerca-de/acerca-de.component';
import { InicioComponent } from './inicio/inicio.component';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


@NgModule({
  declarations: [
    AcercaDeComponent,
    InicioComponent
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,

    CardModule,
    BlockUIModule,
  ProgressSpinnerModule,
  ]
})
export class PublicModule { }
