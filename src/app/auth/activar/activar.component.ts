import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-activar',
  templateUrl: './activar.component.html',
  styles: [
  ]
})
export class ActivarComponent implements OnInit {

  constructor(private auth: AuthService,
    private aRoute: ActivatedRoute,
    private router:Router,
    private notificacion:NotificacionesService) { }


  ngOnInit(): void {
  
    this.aRoute.params
        .pipe(
          switchMap(({id}) => this.auth.activarCuenta(id))
        )
        .subscribe(resp => {
          // console.log(resp);
          if(resp.status == false){
            this.notificacion.toastr('error','Ocurrió un error',resp.msg);
            return;
          }
          this.notificacion.toastr('success','Cuenta activada!','Ahora podes iniciar sesión');
          
          this.router.navigateByUrl('/auth/login');
        })

  }

}
