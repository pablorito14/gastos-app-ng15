import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { switchMap, take, Subscription } from 'rxjs';
import { Cuota, Gasto } from 'src/app/interfaces/gasto-cuota.interface';
import { Resumen } from 'src/app/interfaces/resumen.interface';
import { GastosService } from 'src/app/services/gastos.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { environment } from 'src/environments/environment';
import { AuxiliaresService } from 'src/app/services/auxiliares.service';
import { CurrencyPipe, formatCurrency } from '@angular/common';

@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.component.html',
  styles: [
    `
    ::ng-deep .cuotas-table tr th,
    ::ng-deep .cuotas-table tr td{
      padding-top: .5rem !important;
      padding-bottom: .5rem !important;

    }
    ::ng-deep .p-column-title{
      font-weight: 500 !important;
    }

    ::ng-deep td,
    ::ng-deep th{
      font-size: 0.875rem !important
    }

    .column-actions{
      width:220px;
    }
    `
  ]
})
export class DetallesComponent implements OnInit, OnDestroy {

  loading:boolean = true;
  resumen!:Resumen;
  cuotas: Cuota[] = [];
  suscripciones: Gasto[] = [];
  
  moment = moment;
  
  montoPesos:number = 0;
  montoDolares:number = 0;
  montoEuros:number = 0;

  imp_rg4815:number = environment.imp_rg4815;
  imp_pais:number = environment.imp_pais;
  imp_catar:number = environment.imp_catar;

  imp_d_rg4815:number = 0;
  imp_d_pais:number = 0;
  imp_d_catar:number = 0;

  imp_e_rg4815:number = 0;
  imp_e_pais:number = 0;
  imp_e_catar:number = 0;

  str_imp_rg4815:string = '';
  str_imp_pais:string = '';
  str_imp_catar:string = '';

  subtotal:number = 0;
  montoTotal:number = 0;
  
  cotizacion:number = 0;
  cotizacion_euro:number = 0;
  
  constructor(private aRoute:ActivatedRoute,
              private router:Router,
              private _aux: AuxiliaresService,
              private _confirmation: ConfirmationService,
              private _gastos:GastosService,
              private _notificacion:NotificacionesService) {  }

  socketSubscription!:Subscription;
  detallesSubscription!:Subscription;

  ngOnInit(): void {
    this.socketSubscription = this._aux.escucharSocket().subscribe();
    this.obtenerDatos();

  }

  ngOnDestroy(): void {
    this.detallesSubscription.unsubscribe();  
    this._gastos.clearCacheDetalles();
    // this.socketSubscription.unsubscribe();  
  }

  borrar_localstorage_cotizaciones(){
    localStorage.removeItem('last_update');
    localStorage.removeItem('cotizaciones_d');
    localStorage.removeItem('cotizaciones_e')
  }

  strCotizacion:string = '';
  // detallesSubscription!:Subscription;
  obtenerDatos(){
    
    this.detallesSubscription = this.aRoute.params.pipe(
      switchMap(({resumen}) => this._gastos.getCacheDetalles(resumen))
    ).subscribe((resp:any) => {
      if(resp.status === false ){
        if(resp.code == 'localstorage'){
          // this.ngOnInit();

          
        } else if(resp.msg){
          this._notificacion.toastr('error',resp.msg,'');
          if(resp.msg == 'Resumen no encontrado'){
            this.router.navigateByUrl('/user/resumenes-credito')
          }
        } 
        return;
      }
      // console.log(resp)
      this.resumen = resp.resumen;
      
      this.strCotizacion = resp.strCotizacion;
      this.cotizacion = resp.cotizacion_d; 

      this.cotizacion_euro = resp.cotizacion_e;
      
      this.montoPesos = this.resumen.montoPesos!;
      this.montoDolares = this.resumen.montoDolares!;
      this.montoEuros = this.resumen.montoEuros!;

      if(this.resumen.montoDolares){
        this.imp_d_rg4815 = (this.resumen.montoDolares*this.imp_rg4815);
        this.imp_d_pais = (this.resumen.montoDolares*this.imp_pais);

      }

      if(this.resumen.montoEuros){
        this.imp_e_rg4815 = (this.resumen.montoEuros*this.imp_rg4815);
        this.imp_e_pais = (this.resumen.montoEuros*this.imp_pais);

      }

      if((this.montoDolares + this.montoEuros) >= 300){
        this.imp_d_catar = this.resumen.montoDolares! * this.imp_catar;
        this.imp_e_catar = this.resumen.montoEuros! * this.imp_catar;
      }
      
      const currencyPipe = new CurrencyPipe('es-AR');
      
      this.str_imp_rg4815 = '--';
      if(this.imp_d_rg4815 > 0 || this.imp_e_rg4815 > 0){
        this.str_imp_rg4815 = `${currencyPipe.transform(this.imp_d_rg4815,'U$D')} / ${currencyPipe.transform(this.imp_e_rg4815,'€')}`;
      }

      this.str_imp_pais = '--';
      if(this.imp_d_pais > 0 || this.imp_e_pais > 0){
        this.str_imp_pais = `${currencyPipe.transform(this.imp_d_pais,'U$D')} / ${currencyPipe.transform(this.imp_e_pais,'€')}`;
      }

      this.str_imp_catar = '--';
      if(this.imp_d_catar > 0 || this.imp_e_catar > 0){
        this.str_imp_catar = `${currencyPipe.transform(this.imp_d_catar,'U$D')} / ${currencyPipe.transform(this.imp_e_catar,'€')}`;
      }


      this.montoTotal = this.montoPesos + 
                        (this.montoDolares+this.imp_d_rg4815+this.imp_d_pais+this.imp_d_catar)*this.cotizacion +
                        (this.montoEuros+this.imp_e_rg4815+this.imp_e_pais+this.imp_e_catar)*this.cotizacion_euro; 
      // this.suscripciones = data.suscripciones;   
      // console.log(this.cotizacion);
      
      this.cuotas = this.resumen.cuotas!;
      this.reload = false;
      this.loading = false; 

    })

  }

  confirm(id:string,event:Event) {
    // const resumen = this.resumenes.find((r:Resumen) => (r._id == id) )!
    
    this._confirmation.confirm({
        target: event.target || undefined,
        message: `¿Confirmar eliminación de gasto? También se eliminaran todas sus cuotas si existen`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Eliminar',
        rejectLabel: 'Cancelar',
        accept: () => {
          this.eliminar(id);
        },
        reject: () => {
            //reject action
        }
    });
}

  deletingID!:string;
  eliminar(id:string){
    this.deletingID = id;
    this._gastos.eliminarGasto(id).pipe(take(1)).subscribe(resp => {
      if(resp.status === false){
        this._notificacion.toastr('error',resp.msg,'');
        this.deletingID = undefined!;
        return;
      }

      this._notificacion.toastr('success','Consumo eliminado','');
      // this.actualizarCache();
      this._aux.actualizarSocket();
      this.obtenerDatos();
      
    })
  }

  // actualizarCache(){
  //   this._resumen.updateCacheResumenes();
  //   this._aux.updateCacheCuotasPend();
  //   this._aux.updateCacheEstadisticasAndCotizaciones();
  // }

  reload:boolean = false;
  actualizar(){
    this.reload = true;
    this._aux.actualizarSocket();
    this._aux.updateAll();
    // this.obtenerDatos();
  }

}
