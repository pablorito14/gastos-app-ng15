import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(private toastrSvc:ToastrService) { }

  toastr(serverity:string, title:string, msg: string){
    
    var toastrOption = {
      enableHtml:true,
      // disableTimeOut: true,
      timeOut: 7000,
      // closeButton:true
      closeButton:false,
      progressBar: true,
      preventDuplicates: true,
      preventOpenDuplicates: true
    }

    //
    
    if(serverity === 'error'){
      if(!title){
        title = 'Error!'
      }
      this.toastrSvc.error(msg,title, toastrOption)
    } else if(serverity === 'success'){
      this.toastrSvc.success(msg,title, toastrOption)
    } else if(serverity === 'info'){
      this.toastrSvc.info(msg,title, toastrOption)
    }
    
  }

  async swalConfirm(disrty:boolean=false):Promise<boolean>{
    let respuesta = false;
    const Toast = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: true,
      confirmButtonColor: '#3085d6',
      denyButtonColor: '#d33',
      showCloseButton: false,
      showDenyButton: true,
      confirmButtonText: 'Limpiar',
      denyButtonText: 'No limpiar',
      
    })
    
    await Toast.fire({
      icon: 'question',
      title: '¿Se van a perder los datos del formulario?',
    }).then(( result) => {
      if (result.isConfirmed) {
        respuesta = true;
      }
    })
    return respuesta;
    
  }
}
