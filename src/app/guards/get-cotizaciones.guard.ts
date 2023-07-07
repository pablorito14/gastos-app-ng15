import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CotizacionesService } from '../services/cotizaciones.service';

@Injectable({
  providedIn: 'root'
})
export class GetCotizacionesGuard  {
  constructor(private _cotizaciones:CotizacionesService){}
  canActivate(): boolean {
    this.getCotizaciones();
    return true;
  }
  canLoad(): boolean {
    this.getCotizaciones();
    return true;
  }

  getCotizaciones(){
    this._cotizaciones.setCotizaciones();
  }
}
