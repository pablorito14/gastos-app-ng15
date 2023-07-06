import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { AuxiliaresService } from 'src/app/services/auxiliares.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { take, pipe } from 'rxjs';
import { Categoria } from 'src/app/interfaces/categoria.interface';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styles: [
    `

      ::ng-deep .p-colorpicker-preview {
        /* width: 4rem !important; */
        /* height: auto; */
        /* width: 100%; */
        /* height: 100%; */
        /* border-top-right-radius: 1rem; */
        /* border-bottom-right-radius: 1rem; */

        
      }
      .color-picker-categoria{
        padding-top: 1.6rem;
        padding-bottom: 1.6rem;
      }
      .color-categoria{
        height: 1.5rem;
      }

      .tabla-categorias th,
      .tabla-categorias td{
        padding-top: .5rem;
        padding-bottom: .5rem;
      } 
    `
  ]
})
export class CategoriasComponent implements OnInit {

  view:string = 'categorias';

  accion: string = 'agregar';
  loading: boolean = true;
  process:boolean = false;
  color:string = '#1976D2';

  categoriaForm: FormGroup = this.fb.group({
    descripcion: ['',Validators.required],
    color: ['#3F51B5',Validators.required]
  }) 

  categorias: Categoria[] = [];

  constructor(private _aux: AuxiliaresService,
    private _confirmation: ConfirmationService,
    private _notificacion: NotificacionesService,
    private fb:FormBuilder) { }
  
  ngOnInit(): void {
    this.obtenerCategorias();
  }

  

  obtenerCategorias(){
    this._aux.getCategorias().pipe(take(1)).subscribe(resp => {

      if(resp.status === false){
        this._notificacion.toastr('error',resp.msg,'');
        // this.loading = false;
        return;
      }

      this.loading = false;
      this.reload = false;
      this.categorias = resp;
    })
  }

  categoriaSel:Categoria | undefined;
  buscarCategoria(cat:string){
    this.categoriaSel = this.categorias.find(c => c._id == cat);

    if(this.categoriaSel){
      this.accion = 'actualizar';
      this.categoriaForm.reset({
        descripcion: this.categoriaSel.descripcion,
        color: this.categoriaSel.color || '#3F51B5'
      })
      this.irArriba();
      // this.categoriaForm.markAsDirty();
    }
    
    
  }

  validarCampo(campo:string){
    // console.log(campo,this.tarjetaForm.controls[campo]?.errors);
    
    return this.categoriaForm.controls[campo]?.errors
          && this.categoriaForm.controls[campo]?.touched;
  }

  guardar(){
    if(this.categoriaForm.invalid){
      this.categoriaForm.markAllAsTouched();
      return;
    }
   
    this.process = true;
    let $categoria = undefined;

    if(this.categoriaSel){
      $categoria = this._aux.updateCategoria(this.categoriaSel._id,this.categoriaForm.value);
    } else {
      $categoria = this._aux.addCategorias(this.categoriaForm.value);
    }


    $categoria.pipe(take(1)).subscribe(resp => {
      this.process = false;
      if(resp.status === false){
        this._notificacion.toastr('error',resp.msg,'')
        return;
      }

      this._notificacion.toastr('success',resp,'');
      if(this.categoriaSel){
        this._aux.updateCacheEstadisticasAndCotizaciones();
      }
      this.process = false;
      this.categoriaForm.markAsPristine();
      this.resetear();
      this.obtenerCategorias();

      this._aux.actualizarSocket();
    })
    
  }

  confirm(id:string,event:Event) {
    
    
    const cat = this.categorias.find(c => c._id == id);
    
    this._confirmation.confirm({
        target: event.target || undefined,
        message: `¿Eliminar categoria ${cat?.descripcion}?`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Si',
        rejectLabel: 'No',
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
    this._aux.deleteCategoria(id).pipe(take(1)).subscribe(resp => {
      if(resp.status === false){
        this._notificacion.toastr('error',resp.msg,'');
        this.deletingID = undefined!;
        return;
      }

      this._notificacion.toastr('success',resp,'');
      
      this.categorias = this.categorias.filter(c => c._id != id);
      this._aux.actualizarSocket();
      
    })

  }
  
  resetear(){
    
    if(this.categoriaForm.dirty){
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
    this.categoriaForm.reset({
      descripcion: '', 
      color: '#3F51B5'
    })
    this.categoriaSel = undefined;
  }
  irArriba() {
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  // titleCasePipe: TitleCasePipe = new TitleCasePipe();
  // titleCase(){
  //   const cat = this.categoriaForm.controls['descripcion'].value;
  //   const catTitle = this.titleCasePipe.transform(cat);

  //   this.categoriaForm.controls['descripcion'].setValue(catTitle);
  // }
  reload:boolean = false;
  actualizar(){
    this.reload = true;
    this._aux.actualizarSocket();
    this.obtenerCategorias();
    this._aux.updateAll();
  }

}
