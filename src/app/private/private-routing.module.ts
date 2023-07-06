import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalirGuard } from '../guards/salir.guard';
import { ValidarTokenGuard } from '../guards/validar-token.guard';
import { AcercaDeComponent } from '../public/acerca-de/acerca-de.component';
import { Error404Component } from '../shared/error404/error404.component';
import { MainComponent } from '../shared/main/main.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { CuotasPendientesComponent } from './cuotas-pendientes/cuotas-pendientes.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';
import { GastoComponent } from './gasto/gasto.component';
import { DetallesComponent } from './resumen-cuenta/credito/detalles/detalles.component';
import { ResumenComponent } from './resumen-cuenta/credito/listado/resumen.component';
import { GastosDebitoComponent } from './resumen-cuenta/debito/gastos-debito/gastos-debito.component';
import { TarjetaComponent } from './tarjeta/tarjeta.component';
import { GetCotizacionesGuard } from '../guards/get-cotizaciones.guard';

const routes: Routes = [
  { 
    path: '', 
    component: MainComponent,
    // canActivateChild: [ValidarTokenGuard],
    canActivate:[ValidarTokenGuard],
    canLoad:[ValidarTokenGuard] ,
    // resolve: {cotizaciones: CotizacionesResolver},
    // runGuardsAndResolvers: 'always',
    children: [
      { 
        path: 'estadisticas', component: EstadisticasComponent,
        // title: 'Estadisitcas',
        canActivate:[GetCotizacionesGuard],
        canLoad:[GetCotizacionesGuard] 
      },
      { 
        path: 'gastos', component: GastoComponent, 
        canDeactivate: [SalirGuard]
        // canActivate:[ValidarTokenGuard],
        // canLoad:[ValidarTokenGuard] 
      },
      { 
        path: 'gastos/:id', component: GastoComponent, 
        canDeactivate: [SalirGuard]
        // canActivate:[ValidarTokenGuard],
        // canLoad:[ValidarTokenGuard] 
      },
      { 
        path: 'gastos/cat/:cat', component: GastoComponent, 
        canDeactivate: [SalirGuard]
        // canActivate:[ValidarTokenGuard],
        // canLoad:[ValidarTokenGuard] 
      },
      { 
        path: 'tarjetas', component: TarjetaComponent, 
        canDeactivate: [SalirGuard]
        // canActivate:[ValidarTokenGuard],
        // canLoad:[ValidarTokenGuard]
      },
      { 
        path: 'resumenes-debito', component: GastosDebitoComponent, 
        // canActivate:[ValidarTokenGuard],
        // canLoad:[ValidarTokenGuard]
      },

      { 
        path: 'resumenes-credito', component: ResumenComponent, 
        canDeactivate:[SalirGuard]
        // canActivate:[ValidarTokenGuard],
        // canLoad:[ValidarTokenGuard]
      },
      
      { 
        path: 'detalles-resumen/:resumen', component: DetallesComponent, 
        canActivate:[GetCotizacionesGuard],
        canLoad:[GetCotizacionesGuard] 
      },
      { 
        path: 'categorias', component: CategoriasComponent, 
        canDeactivate: [SalirGuard]
        // canActivate:[ValidarTokenGuard],
        // canLoad:[ValidarTokenGuard]
      },
      // { path: '', component: InicioComponent,canActivate:[ValidarTokenGuard],canLoad:[ValidarTokenGuard] },
      { 
        path: 'cuotas-pendientes', component: CuotasPendientesComponent,
        // canActivate:[ValidarTokenGuard],
        // canLoad:[ValidarTokenGuard] 
      },
      {
        path: 'acerca-de',component:AcercaDeComponent,
      },
      
      { path: '404', component: Error404Component },
      { path: '', redirectTo: '/user/estadisticas', pathMatch: 'full'},
      { path: '**', redirectTo: '/user/404' }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivateRoutingModule { }
