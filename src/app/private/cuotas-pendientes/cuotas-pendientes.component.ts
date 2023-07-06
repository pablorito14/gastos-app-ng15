import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuxiliaresService } from 'src/app/services/auxiliares.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { Tarjeta } from '../../interfaces/tarjeta.interface';
import { Subscription } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'app-cuotas-pendientes',
  templateUrl: './cuotas-pendientes.component.html',
  styles: [`
    .td{
      padding-top: .5rem !important;
      padding-bottom: .5rem !important;

      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  `]
})
export class CuotasPendientesComponent implements OnInit,OnDestroy {

  loading:boolean = true;

  cuotasPend:any[] = [];
  moment = moment;

  constructor(private _notificaciones:NotificacionesService,
              private _aux: AuxiliaresService) {
  }
  cuotasSubscription!:Subscription;
  // cuotas$:Observable<any> = this._aux.cuotasPendientes$;

  ngOnDestroy(): void {
    this.cuotasSubscription.unsubscribe();    
    // this.socketSubscription.unsubscribe();
  }

  socketSubscription!:Subscription;
  ngOnInit(): void {
    
    this.socketSubscription = this._aux.escucharSocket().subscribe();
    this.cargarDatos();
  }

  strCuotas = {
    '=1':'1 cuota',
    'other':'# cuotas'
  }

  cambiarTarjeta(t:any){

  }

  tarjetaSel:any;
  tarjetas:Tarjeta[] = [];
  cargarDatos(){

    this.cuotasSubscription = this._aux.getCacheCuotasPend().subscribe(resp => {
      if(resp.status === false){
        this._notificaciones.toastr('error',resp.msg,'');
        // this.loading = false;
        return;
      }

      
      resp.tarjetas.forEach((t:any) => {
        const tipo = (t.tipo == 'visa') ? 'VISA' : (t.tipo == 'amex') ? 'AMEX' : 'MASTER';
        t.descripcion = `${tipo} ${t.numero}`;        
      })

      this.loading = false;
      this.reload = false;
      this.tarjetas = resp.tarjetas;
      this.cuotasPend = resp.cuotasPend;
      
    })
  }

  reload:boolean = false;
  actualizar(){
    this.reload = true;
    this._aux.actualizarSocket();
    this._aux.updateAll();
  }

}
