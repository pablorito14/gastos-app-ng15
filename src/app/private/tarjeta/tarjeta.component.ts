import { Component, OnDestroy, OnInit } from '@angular/core';
import { TarjetasService } from 'src/app/services/tarjetas.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Tarjeta } from 'src/app/interfaces/tarjeta.interface';
import { ConfirmationService } from 'primeng/api';
import { NotificacionesService } from '../../services/notificaciones.service';
import { take, Subscription } from 'rxjs';
import { AuxiliaresService } from 'src/app/services/auxiliares.service';
import { ResumenesService } from 'src/app/services/resumenes.service';

enum TipoTarjeta{
  visa = 'VISA',
  mastercard = 'Mastercard',
  amex = 'American Express'
}

@Component({
  selector: 'app-tarjeta',
  templateUrl: './tarjeta.component.html',
  styles: [
    `
    .tabla-tarjetas th,
    .tabla-tarjetas td{
      padding-top: .5rem;
      padding-bottom: .5rem;
     } 
    `
  ]
})
export class TarjetaComponent implements OnInit,OnDestroy {

  view:string = 'tarjetas';

  accion:string = 'agregar';
  loading:boolean = true;
  process:boolean = false;
  
  tarjetaForm:FormGroup = this.fb.group({ 
      banco: ['',Validators.required],
      numero: [,[Validators.required,Validators.pattern('[0-9][0-9][0-9][0-9]')]],
      tipo: ['', Validators.required] 
  })

  bancos!:any[];

  tipos:any[] = [
    { tipo: 'visa', descripcion: 'VISA'},
    { tipo: 'visa_deb', descripcion: 'VISA Débito'},
    { tipo: 'mastercard_deb', descripcion: 'Mastercard Débito'},
    { tipo: 'mastercard', descripcion: 'Mastercard'},
    { tipo: 'amex', descripcion: 'American Express'},
  ]

  tarjetas!:any[];
  tarjetaSel!:Tarjeta | undefined;

  constructor(private _tarjeta:TarjetasService,
              private _confirmation: ConfirmationService,
              private _notificacion: NotificacionesService,
              private fb:FormBuilder,
              private _aux:AuxiliaresService,
              private _resumenes:ResumenesService) { }
  ngOnDestroy(): void {
    this.tarjetasSubscription.unsubscribe();
    // this.socketSubscription.unsubscribe();
  }


  socketSubscription!:Subscription;

  ngOnInit(): void { 
    console.log();
    
    // this._tarjeta.conectarSocket();
    // this._tarjeta.escucharSocket().subscribe();
    this.socketSubscription = this._tarjeta.escucharSocket().subscribe()
    this.obtenerTarjetas();
  }

  tarjetasSubscription!: Subscription;
  obtenerTarjetas(){
    this.bancos = this._aux.getBancos();
    this.tarjetasSubscription = this._tarjeta.getCacheTarjetas().subscribe(
      data => {
        if(data.status === false){
          this._notificacion.toastr('error',data.msg,'');
          return;
        }
        this.tarjetas = data.filter((x:any) => x.numero != '');
        this.loading = false;
        this.reload = false;
        
      }
    )
  }

  validarCampo(campo:string){
    // console.log(campo,this.tarjetaForm.controls[campo]?.errors);
    
    return this.tarjetaForm.controls[campo]?.errors
          && this.tarjetaForm.controls[campo]?.touched;
  }

  resetear(){
    if(this.tarjetaForm.dirty){
      this._notificacion.swalConfirm().then(respuesta => {
        if(respuesta){
          this.limpiar();
        }
      })
    } else {
      this.limpiar();
    }

    // this.accion = 'agregar';
    // this.tarjetaSel = undefined;
  }

  limpiar(){
    this.accion = 'agregar';
    this.tarjetaForm.reset({});
    this.tarjetaSel = undefined;
  }

  guardar(){

    if(this.tarjetaForm.invalid){
      this.tarjetaForm.markAllAsTouched();
      return;
    }

    const { banco,numero,tipo } = this.tarjetaForm.value;

    let debito = tipo == 'visa_deb' || tipo == 'mastercard_deb';
    let bodyTarjeta = {
      banco,numero,tipo,debito
    }

    // console.log(this.tarjetaForm.value);
    // console.log(bodyTarjeta);
    
    
    let tipoObj = this.tipos.find((t:any) => t.tipo == tipo)

    this.process = true;

    let $tarjeta = undefined;
    if(this.tarjetaSel){
      $tarjeta = this._tarjeta.updateTarjeta(this.tarjetaSel._id,bodyTarjeta);
    } else {
      $tarjeta = this._tarjeta.addTarjeta(bodyTarjeta);
    }


    $tarjeta.pipe(take(1)).subscribe(resp => {
      this.process = false;

      if(resp.status === false){
        this._notificacion.toastr('error',resp.msg,'');
        return;
      }

      this.tarjetaForm.reset({});
      this._notificacion.toastr('success',`Tarjeta ${tipoObj.descripcion} ${numero} guardada`,'')
      
      
      // this.actualizarCache(bodyTarjeta.debito);
      this._tarjeta.actualizarSocket();
      // this.obtenerTarjetas();
      if(this.tarjetaSel){
        this.tarjetaSel = undefined;
        this.accion = 'agregar';
      }

    })
    
  }

  buscarTarjeta(id:string){
    
    this.tarjetaSel = this.tarjetas.find((t:Tarjeta) => (t._id == id) )
    
    if(this.tarjetaSel){
      this.tarjetaForm.reset({
        banco: this.tarjetaSel.banco,
        numero: this.tarjetaSel.numero,
        tipo: this.tarjetaSel.tipo
      })
      this.accion = 'actualizar'
      // this.tarjetaForm.markAsDirty();
      this.irArriba();
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
    // console.log(id);
    
    const tarjeta = this.tarjetas.find((t:Tarjeta) => t._id == id)
    console.log(tarjeta);
    
    this._confirmation.confirm({
        target: event.target || undefined,
        message: `¿La tarjeta ${tarjeta.numero} esta vencida?`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Si',
        rejectLabel: 'No',
        accept: () => {
          this.eliminar(tarjeta);
        },
        reject: () => {
            //reject action
        }
    });
  }

  deletingID!:string;
  
  eliminar(tarjeta:Tarjeta){
    this.deletingID = tarjeta._id;

    
    
    this._tarjeta.expiredTarjeta(tarjeta._id!).pipe(take(1)).subscribe(resp => {
      if(resp.status === false){
        this._notificacion.toastr('error',resp.msg,'');
        return;
      }

      this._notificacion.toastr('success',resp,'');
      this.deletingID = undefined!;  
      this._tarjeta.actualizarSocket();
      // this.actualizarCache(tarjeta.debito);
      // this.obtenerTarjetas();
    })
    
  }

  // actualizarCache(debito:boolean){

  //   this._tarjeta.updateCacheTarjetas();
  //   this._aux.updateCacheEstadisticasAndCotizaciones();
  //   if(debito){
  //     this._resumenes.updateCacheDebitos();
  //   } else {
  //     this._resumenes.updateCacheResumenes()
  //   }

  //   if(this.tarjetaSel){
  //     this._aux.updateCacheCuotasPend();
  //   }
  // }

  reload:boolean = false;
  actualizar(){
    // this._tarjeta.actualizarSocket();
    this.reload = true;
    this._aux.updateAll();
  }
  

}
