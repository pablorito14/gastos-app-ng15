import { Component, OnInit, OnDestroy } from '@angular/core';
import { Resumen } from 'src/app/interfaces/resumen.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { Tarjeta } from 'src/app/interfaces/tarjeta.interface';
import { ResumenesService } from 'src/app/services/resumenes.service';
import * as moment from 'moment';
import { take, Subscription } from 'rxjs';
import { AuxiliaresService } from 'src/app/services/auxiliares.service';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styles: [
    `
    
     ::ng-deep .p-accordion-header-link{
      padding: 1rem !important;
      /* padding-left: 1rem !important; */
      font-size: 1.5rem !important;
      font-weight: 700 !important;
      /* margin-bottom: 0.5rem !important; */
      border-top-right-radius: 1.5rem !important;
      border-top-left-radius: 1.5rem !important;
      border-bottom-right-radius: 1.5rem !important;
      border-bottom-left-radius: 1.5rem !important;
     } 

     ::ng-deep .p-accordion .p-accordion-content{
      padding: 1rem !important;
      border-bottom-right-radius: 1.5rem !important;
      border-bottom-left-radius: 1.5rem !important;
     }

     ::ng-deep .p-accordion .p-accordion-tab{
      border-top-right-radius: 1.5rem !important;
      border-top-left-radius: 1.5rem !important;
      border-bottom-left-radius: 1.5rem !important;
      border-bottom-right-radius: 1.5rem !important;
     }

     ::ng-deep .formulario-card .p-card-body{
      /* padding-bottom: 1rem !important; */
      padding: 0 !important;
      /* padding-top: 0 !important; */
     }

     ::ng-deep .formulario-card .p-card-content{
      padding: 0 !important;
     }
    `
  ]
})
export class ResumenComponent implements OnInit,OnDestroy {
  view:string = 'resumenes';
  
  resumenForm: FormGroup = this.fb.group({
    tarjeta: ['',Validators.required],
    inicio: ['',Validators.required],
    cierre: ['',Validators.required],
    vencimiento: ['',Validators.required]
  });

  
  filtrarTarjeta:string = '';
  moment = moment;
  accion: string = 'agregar';
  loading: boolean = true;
  process: boolean = false;
  mostrarFormulario:number = -1;
  open = false;
  resumenes!:any[];
  tarjetas:Tarjeta[] = [];
  resumenSel:Resumen | undefined;

  toggleFormulario:boolean = false; 
  
  constructor(private _resumen:ResumenesService,
              private _confirmation: ConfirmationService,
              private _notificacion: NotificacionesService,
              private _aux:AuxiliaresService,
              private fb:FormBuilder) {

    this.resumenForm.get('tarjeta')?.valueChanges.subscribe(tar => {
      let resumen = this.resumenes.find(r => r.tarjeta._id == tar)
      if(resumen && !this.resumenSel){
        this.resumenForm.get('inicio')?.setValue(moment(resumen.cierre).toDate());
      }
    })

    
  }
  
  resumenesSubscription!:Subscription;
  // resumenes$:Observable<any> = this._resumen.resumes$;

  ngOnDestroy(): void {
    this.resumenesSubscription.unsubscribe();
    // this.socketSubscription.unsubscribe();
  }

  socketSubscription!:Subscription;
  ngOnInit(): void {
    // this.pConfig.ripple = true;

    this.socketSubscription = this._resumen.escucharSocket().subscribe()

    let filtro = localStorage.getItem('filtro-resumenes');
    if(filtro){
      this.filtrarTarjeta = filtro;
    }
    
    this.resumenes = [];
    this.obtenerDatos();

  }


  obtenerDatos(){
    
    this.resumenesSubscription = this._resumen.getCacheResumenes().subscribe((data:any) => {
      this.loading = false;
      this.reload = false;
      if(data.status === false){
        this._notificacion.toastr('error',data.msg,'');
        return;
      }
      
      this.resumenes = data.resumenes;
      this.tarjetas = data.tarjetas.filter((t:any) => !t.debito);
      
    })
  }

  // tarjetasActivas(){
  //   return this.tarjetas.filter(t => t.estado == 'active');
  // }

  validarCampo(campo:string){
    return this.resumenForm.controls[campo]?.errors
          && this.resumenForm.controls[campo]?.touched;
  }

  resetear(){

    if(this.resumenForm.dirty){
      this._notificacion.swalConfirm().then(respuesta => {

        if(respuesta){
          this.limpiar();
        }
      });
    } else {
      this.limpiar();
    }

    
  }

  limpiar(){
    this.accion = 'agregar';
    this.resumenForm.reset({})
    this.resumenSel = undefined;
  }

  guardar(){

    if(this.resumenForm.invalid){
      this.resumenForm.markAllAsTouched();
      return;
    }
    console.log(this.resumenForm.value);
    

    this.process = true;

    let $resumen = undefined;
    if(this.resumenSel){
      $resumen = this._resumen.updateResumen(this.resumenSel._id,this.resumenForm.value);
    } else {
      $resumen = this._resumen.agregarResumen(this.resumenForm.value)
    }

    $resumen.pipe(take(1)).subscribe(resp => {
      this.process = false;
        if(resp.status === false){
          this._notificacion.toastr('error',resp.msg,'');
          return;
        }

        this.resumenForm.reset({});
        this.toggleFormulario = false;
        this._notificacion.toastr('success',resp,'');

        // this.actualizarCache();
        this._resumen.actualizarSocket();
        // this.obtenerDatos();
        if(this.resumenSel){
          this.resumenSel = undefined;
          this.accion = 'agregar';
        }
    })
  }

  // actualizarCache(){
  //   this._resumen.updateCacheResumenes();
  //   this._aux.updateCacheCuotasPend();
  //   this._aux.updateCacheEstadisticasAndCotizaciones();
  // }

  
  buscarResumen(id:string){
    this.resumenSel = this.resumenes.find((r:Resumen) => (r._id == id) )
    
    if(this.resumenSel){
      this.resumenForm.reset({
        tarjeta: String(this.resumenSel.tarjeta._id),
        inicio: new Date(this.resumenSel.inicio),
        cierre: new Date(this.resumenSel.cierre),
        vencimiento: new Date(this.resumenSel.vencimiento)
      })
      this.accion = 'actualizar'
      this.irArriba();
      
      // this.mostrarFormulario = 0;
      this.toggleFormulario = true;
      // this.resumenForm.markAsDirty();
      
    }
  }

  irArriba() {
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  confirm(id:string,event:Event) {
    
    this._confirmation.confirm({
        target: event.target || undefined,
        message: `¿Confirmar eliminación de resumen?`,
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
    let ultimo:boolean = false;
    const resumen = this.resumenes.find((r:Resumen) => (r._id == id) )!
    // console.log(resumen);
    
    const resumenes = this.resumenes.filter((r:Resumen) => r.tarjeta._id == resumen.tarjeta._id);
    // console.log(resumenes);

    if(resumen == resumenes[0]){
      // console.log('ultimo resumen');
      ultimo = true;
    }
    
    this._resumen.deleteResumen(id,ultimo).pipe(take(1)).subscribe(resp => {
      
      if(resp.status === false){
        this._notificacion.toastr('error',resp.msg,'');
        this.deletingID = undefined!;
        return;
      }

      if(ultimo === true){
        let filtro = localStorage.getItem('filtro-estadisticas') || '';
        if(filtro == resumen.tarjeta._id){
          localStorage.removeItem('filtro-estadisticas');
        }
      }

      this._notificacion.toastr('success','Resumen eliminado','');
      this._resumen.actualizarSocket();
      // this.actualizarCache();
      // this.obtenerDatos();
      
    })
  }

  guardarFiltro(){
    if(this.filtrarTarjeta){
      localStorage.setItem('filtro-resumenes',this.filtrarTarjeta);
    } else {
      localStorage.removeItem('filtro-resumenes');
    }
  }

  reload:boolean = false;
  actualizar(){
    this.reload = true;
    this._aux.updateAll();
    // this._resumen.actualizarSocket();
  }
  
}
