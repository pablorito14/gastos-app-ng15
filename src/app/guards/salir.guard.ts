import { Injectable } from '@angular/core';

import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SalirGuard  {



  async canDeactivate(component: any): Promise<boolean> {
    // console.log(component.view);
    let view = component.view;
    let dirty = false;
    switch(view){
      case 'resumenes':
        dirty = component.resumenForm.dirty;
        break;
      case 'categorias':
        dirty = component.categoriaForm.dirty;
        break;
      case 'tarjetas':
        dirty = component.tarjetaForm.dirty;
        break;
      case 'nuevo_gasto':
        dirty = component.gastoForm.dirty;
        break;
    }

    // console.log(dirty);
    
    if(dirty){
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: true,
        confirmButtonColor: '#3085d6',
        denyButtonColor: '#d33',
        showCloseButton: false,
        showDenyButton: true,
        confirmButtonText: 'Salir',
        denyButtonText: 'Cancelar',
        
      })
      
      const result = await Toast.fire({
        icon: 'question',
        title: '¿Se van a perder los datos del formulario?',
      });
      if (result.isConfirmed) {
        return true;
      } else {
        return false;
      }
    }
    


    return true;

}
  
}
