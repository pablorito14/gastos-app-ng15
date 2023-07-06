import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ResumenesService } from 'src/app/services/resumenes.service';
import { take, Subscription } from 'rxjs';
import moment from 'moment';
import { AuxiliaresService } from 'src/app/services/auxiliares.service';
import { GastosService } from 'src/app/services/gastos.service';

@Component({
  selector: 'app-gastos-debito',
  templateUrl: './gastos-debito.component.html',
  styles: [`
    .debitos-column-width{
      width: 150px;
    }
    .debitos-column-action-width{
      width: 220px;
    }
  `]
})
export class GastosDebitoComponent implements OnInit,OnDestroy {
  loading: boolean = true;
  
  data:any;
  constructor(private _resumen:ResumenesService,
              private _gasto:GastosService,
              private _aux: AuxiliaresService,
              private _notificacion: NotificacionesService,
              private _confirmation:ConfirmationService,
              private pConfig: PrimeNGConfig) { 
                // if(localStorage.getItem('updateDebitos')){
                //   this._resumen.updateDebitos(); 
                //   localStorage.removeItem('updateDebitos')
                // }
               }
  
  
  ngOnDestroy(): void {
    this.debitosSuscription.unsubscribe();
    // this.socketSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.socketSubscription = this._resumen.escucharSocket().subscribe();
    this.obtenerDatos();
    
  }

  // debitos$ = this._resumen.debitos$;
  socketSubscription!:Subscription;
  debitosSuscription!:Subscription;
  obtenerDatos(update:boolean = false){
    // this._resumen.gerDebitos().subscribe((resp:any) => {


    this.debitosSuscription = this._resumen.getCacheDebitos().subscribe((resp:any) => {
      if(resp.status === false ){
        this._notificacion.toastr('error',resp.msg,'');
        this.loading = false;
        return;
      }

      if(resp.length == 0){
        this.loading = false;
        return;
      }
      
      this.allData = resp
      
      if(this.tarjetaSel){
        this.dataShow = this.allData.find(t => t._id == this.tarjetaSel);
        
      } else {
        this.dataShow = this.allData[0];
      }

      if(this.dataShow){
        let filtro = localStorage.getItem('filtro-debitos') || this.dataShow._id;
        let indice = JSON.parse(localStorage.getItem('filtro-debitos-periodo')!) || 0
        
        if(filtro){
          this.cambiarTarjeta(filtro,indice);
          // this.filtroResumen(indice);
        } else {
          this.mostrarDatos();
        }
        
      } else {
        this.loading = false;
      }
    })
  }

  dataShow:any;
  allData:any[] = [];
  tarjetaSel:any;
  // strResumenActual:string = '';
  resumenActual!:any;
  moment = moment;

  cambiarTarjeta(tarjeta:string,indice:number){

    localStorage.setItem('filtro-debitos',tarjeta);

    this.dataShow = this.allData.find((t:any) => t._id == tarjeta);
    this.resumenActual = null;
    if(indice){
      let newResumen = this.dataShow.resumenes.find((r:any) => r.indice == indice);
      this.resumenActual = newResumen;  
    }

    this.mostrarDatos();
  }

  mostrarDatos(){
    this.tarjetaSel = this.dataShow._id;

    let now = moment();
    
    this.dataShow.resumenes.forEach((r:any) => {
      if(!this.resumenActual && now.isBetween(r.inicio,r.cierre,undefined,'[)')){
        this.resumenActual = r;
        this.indicePeriodoActual = this.resumenActual.indice;
      } else if(this.resumenActual && this.resumenActual.mes == r.mes){
        this.resumenActual = r
      }
    });

    if(!this.resumenActual) {
      this.resumenActual = this.dataShow.resumenes[0];
    }
    this.reload = false;
    this.loading = false;
  }
  indicePeriodoActual!:number;

  
  prevResumen(indice:number){
    indice++;

    localStorage.setItem('filtro-debitos-periodo',JSON.stringify(indice));
    let newResumen = this.dataShow.resumenes.find((r:any) => r.indice == indice);
    this.resumenActual = newResumen;
  }
  nextResumen(indice:number){
    indice--;

    localStorage.setItem('filtro-debitos-periodo',JSON.stringify(indice));
    let newResumen = this.dataShow.resumenes.find((r:any) => r.indice == indice);
    this.resumenActual = newResumen;
  }

  confirm(id:string,event:Event) {
    // const resumen = this.resumenes.find((r:Resumen) => (r._id == id) )!
    // console.log(id,event.target);
    // this.eliminar(id);
    this._confirmation.confirm({
        target: event.target || undefined,
        message: `¿Confirmar eliminación de gasto?`,
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

    this._gasto.eliminarGasto(id).pipe(take(1)).subscribe(resp => {
      if(resp.status === false){
        this._notificacion.toastr('error',resp.msg,'')
        this.deletingID = undefined!
        return;
      }
      this._notificacion.toastr('success','Gasto eliminado','');
      this._aux.actualizarSocket();
      // this._resumen.updateCacheDebitos();
      // this._aux.updateCacheEstadisticasAndCotizaciones();
    })
  
  }

  reload:boolean = false;
  actualizar(){
    this.reload = true;
    this._aux.updateAll();
  }
}
