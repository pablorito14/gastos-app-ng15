import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivateRoutingModule } from './private-routing.module';
import { PrimePrivateModule } from '../prime-ng/prime-private.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { CategoriasComponent } from './categorias/categorias.component';
import { CuotasPendientesComponent } from './cuotas-pendientes/cuotas-pendientes.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';
import { GastoComponent } from './gasto/gasto.component';
import { DetallesComponent } from './resumen-cuenta/credito/detalles/detalles.component';
import { ResumenComponent } from './resumen-cuenta/credito/listado/resumen.component';
import { GastosDebitoComponent } from './resumen-cuenta/debito/gastos-debito/gastos-debito.component';
import { TarjetaComponent } from './tarjeta/tarjeta.component';
import { FormatoStringPipe } from '../pipes/formato-string.pipe';
import { FiltrarResumenesPipe } from '../pipes/filtrar-resumenes.pipe';
import { FiltarCuotasPipe } from '../pipes/filtar-cuotas.pipe';
import { TarjetaPipe } from '../pipes/tarjeta.pipe';
import { TarjetasPipe } from '../pipes/tarjetas.pipe';


@NgModule({
  declarations: [
    CategoriasComponent,
    CuotasPendientesComponent,
    EstadisticasComponent,
    GastoComponent,
    DetallesComponent,
    ResumenComponent,
    GastosDebitoComponent,
    TarjetaComponent,

    FormatoStringPipe,
    FiltrarResumenesPipe,
    FiltarCuotasPipe,
    TarjetaPipe,
    TarjetasPipe

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // SocketIoModule.forRoot(config),
    PrimePrivateModule,
    PrivateRoutingModule,
    NgChartsModule,
  ]
})
export class PrivateModule { }
