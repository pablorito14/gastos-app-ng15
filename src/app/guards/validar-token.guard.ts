import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, of, take } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificacionesService } from '../services/notificaciones.service';
import { CotizacionesService } from '../services/cotizaciones.service';

@Injectable({
  providedIn: 'root'
})
export class ValidarTokenGuard  {
  constructor(private auth: AuthService,
              private notificacion:NotificacionesService,
              private cotizaciones:CotizacionesService,
              private router: Router){}

  canActivate(): Observable<boolean> | boolean {
    return this.validarToken();
  }

  canActivateChild(): Observable<boolean> | boolean {
    return this.validarToken();
  }

  canLoad(): Observable<boolean> | boolean {
    return this.validarToken();
  }

  validarToken(){
    return this.auth.validarToken()
      .pipe(
        take(1),
        tap(valid => {
          if(valid.status === false) { 
            if(valid.statusCode == 0){
              this.notificacion.toastr('error','Error de conexión','La base de datos puede estar fuera de linea momentáneamente');
            }
            this.router.navigateByUrl('/auth/login'); 
            return;
          }
          // this.setCotizaciones();
          
        })
      );
  }

  setCotizaciones(){
    this.cotizaciones.setCotizaciones();
  }

}
