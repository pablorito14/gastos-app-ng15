import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Tarjeta } from 'src/app/interfaces/tarjeta.interface';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { TarjetasService } from 'src/app/services/tarjetas.service';
import { GastosService } from '../../services/gastos.service';
import { ActivatedRoute } from '@angular/router';
import { AuxiliaresService } from 'src/app/services/auxiliares.service';
import { Observable, take, zip, Subscription } from 'rxjs';

@Component({
  selector: 'app-gasto',
  templateUrl: './gasto.component.html',
  styles: [
    `
    ::ng-deep .input-monto .p-inputtext{
      border-top-left-radius: 1rem !important;
      border-bottom-left-radius: 1rem !important;
    }

    `
  ]
})
export class GastoComponent implements OnInit, OnDestroy {

  view:string = 'nuevo_gasto'

  accion:string = 'agregar';
  id:string | null = '';

  gastoForm: FormGroup = this.fb.group({
    descripcion: ['',Validators.required],
    monto: [,Validators.required],
    tarjeta: ['',Validators.required],
    fecha: [moment().toDate(),Validators.required],
    moneda: ['$',Validators.required],
    categoria: ['',Validators.required],
    cuotas: ['',Validators.required]
  })

  monedas:any[] = [
    { value: '$', descripcion: 'Pesos'},
    { value: 'U$D', descripcion: 'Dólares'},
    { value: '€', descripcion: 'Euros'}
  ]

  cuotas:any[] = [];

  cuotas_cred:any[] = [
    // { value: -1, descripcion: 'Suscripción'},
    { value: 1, descripcion: '1' },
    // { value: 11, descripcion: 'Plan Z' },
    { value: 3, descripcion: '3' },
    { value: 6, descripcion: '6' },
    { value: 9, descripcion: '9' },
    { value: 12, descripcion: '12' },
    { value: 18, descripcion: '18' },
    { value: 24, descripcion: '24' },
    { value: 30, descripcion: '30' },

  ]

  cuotas_deb:any[] = [
    {value: 0, descripcion: 'Débito'}
  ]

  cuotas_efec:any[] = [
    {value: 0, descripcion: 'Efectivo'}
  ]

  cuotas_susc:any[] = [
    { value: -1, descripcion: 'Suscripción'}
  ]

  categorias:any[] = []

  loading:boolean = true;
  process:boolean = false;
  tarjetas: Tarjeta[] = [];

  categoriaSel:any;
  tarjetaSel:any;

  constructor(private fb:FormBuilder,
              private aRoute:ActivatedRoute,
              private _notificacion: NotificacionesService,
              private _tarjetas:TarjetasService,
              private _gastos:GastosService,
              private _aux:AuxiliaresService
              ) {
    this.gastoForm.get('categoria')?.valueChanges.subscribe(cat => {
      
      this.categoriaSel = this.categorias.find(c => c._id == cat);
      
      if(!this.tarjetaSel || !this.categoriaSel){
        return;
      }


      if(this.categoriaSel.descripcion == 'Suscripciones'){
          this.cuotas = this.cuotas_susc;
          this.gastoForm.get('cuotas')?.setValue(-1);
      } else {
        if(this.tarjetaSel.tipo == 'Efectivo'){
          this.cuotas = this.cuotas_efec;
          this.gastoForm.get('cuotas')?.setValue(0);
        } else if(this.tarjetaSel?.debito){
          this.cuotas = this.cuotas_deb;
          this.gastoForm.get('cuotas')?.setValue(0);
        } else {
          this.cuotas = this.cuotas_cred;
          this.gastoForm.get('cuotas')?.setValue(1);
        }
      }
        
    })

    this.gastoForm.get('tarjeta')?.valueChanges.subscribe(tar => {
      this.tarjetaSel = this.tarjetas.find(t => t._id == tar);

      if(!this.categoriaSel || !this.tarjetaSel){
        return;
      }
      
      
      if(this.categoriaSel.descripcion == 'Suscripciones'){
          this.cuotas = this.cuotas_susc;
          this.gastoForm.get('cuotas')?.setValue(-1);
      } else {
        if(this.tarjetaSel.tipo == 'Efectivo'){
          this.cuotas = this.cuotas_efec;
          this.gastoForm.get('cuotas')?.setValue(0);
        } else if(this.tarjetaSel?.debito){
          this.cuotas = this.cuotas_deb;
          this.gastoForm.get('cuotas')?.setValue(0);
        } else {
          this.cuotas = this.cuotas_cred;
          this.gastoForm.get('cuotas')?.setValue(1);
        }
      }
    })
  }

  bancos!:any[];
  socketSubscription!:Subscription;
  ngOnDestroy(): void {
    // this.socketSubscription.unsubscribe();
    
  }
  ngOnInit(): void {
    this.socketSubscription = this._aux.escucharSocket().subscribe();
    // this.pConfig.ripple = true;
    
    this.bancos = this._aux.getBancos();

    this.id = this.aRoute.snapshot.paramMap.get('id');
    let categoria = '';
    


    // const getTarjetas = this._tarjetas.getTarjetas();
    const getTarjetas = this._tarjetas.getCacheTarjetas();
    const getCategorias = this._aux.getCacheCategorias();
    // const getCategorias = this._aux.getCategorias();

    let getData = new Observable();
     
    categoria = this.aRoute.snapshot.paramMap.get('cat')!;
    getData = zip(getTarjetas,getCategorias);
    
    
    getData.subscribe((data:any) => {
      // console.log('reload data');
      
      if(data[0].status === false ||
        data[1].status === false){
        this._notificacion.toastr('error',data[0].msg || data[1].msg,'')
        this.loading = false;
        return;
      }

      this.tarjetas = data[0];

      this.categorias = data[1];
      if(!this.id && this.gastoForm.pristine){
        this.gastoForm.reset({
          fecha: moment().toDate(),
          categoria,
          moneda: '$'
        })
      }
      
      
      
    })

    if(this.id){
      this.accion = 'actualizar';

      this._gastos.getGasto(this.id).subscribe(resp => {
        if(resp.status === false){
          this._notificacion.toastr('error',resp.msg,'')
          this.loading = false;
          return;
        }

        const gasto:any = resp;
        if(gasto){

          this.gastoForm.reset({
            descripcion: gasto.descripcion,
            monto: gasto.monto,
            tarjeta: gasto.tarjeta._id,
            fecha: moment(gasto.fecha).toDate(),
            moneda: gasto.moneda,
            categoria: gasto.categoria,
            cuotas: gasto.cuotas
          })
          // this.gastoForm.markAsDirty();
          
        }
        this.loading = false;
      });
      
    } else {
      this.loading = false;
    }

    this.cuotas = this.cuotas_cred


  }

  
  validarCampo(campo:string){
    return this.gastoForm.controls[campo]?.errors
          && this.gastoForm.controls[campo]?.touched;
  }

  guardar(){
    if(this.gastoForm.invalid){
      this.gastoForm.markAllAsTouched();
      return;
    }
    // return;
    this.process = true;

    let $gasto = undefined;
    if(this.id){
      $gasto = this._gastos.updateGasto(this.id,this.gastoForm.value);
    } else {
      $gasto = this._gastos.addGasto(this.gastoForm.value);
    }

    $gasto.pipe(take(1)).subscribe(resp => {
      this.process = false;
      if(resp.status === false){
        this._notificacion.toastr('error',resp.msg,'');
        return;
      }

      this._notificacion.toastr('success',resp,'');

      this._aux.actualizarSocket();
      this._aux.updateAll();
      this.gastoForm.markAsPristine();
      if(this.id){
        window.history.back();
      } else {
        
        this.resetear();
      }
    })

  }

  resetear(){

    if(this.gastoForm.dirty){
      this._notificacion.swalConfirm().then(respuesta => {
        if(respuesta){
          this.limpiar();
        }
      })
    } else {
      this.limpiar();
    }
    
  }

  limpiar(){
    this.accion = 'agregar';
    this.gastoForm.reset({fecha:moment().toDate()});
    this.gastoForm.markAsPristine();
    this.id = null;
  }

  

}
