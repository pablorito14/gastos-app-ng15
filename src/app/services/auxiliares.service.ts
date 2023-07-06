import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { Categoria } from '../interfaces/categoria.interface';
import { DataCacheService } from './data-cache.service';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class AuxiliaresService {

  apiUrl:string = environment.apiUrl;

  constructor(private auth:AuthService,
              private _cache:DataCacheService,
              private http:HttpClient,
              private socket:Socket) { }

  // getCotizaciones(fecha1:string,fecha2:string){

  //   // console.log({fecha1,fecha2});
  //   let url = `https://mercados.ambito.com//dolar/oficial/historico-general/${fecha1}/${fecha2}`;
  //   // https://mercados.ambito.com//dolar/oficial/historico-general/10-12-2022/14-12-2022

  //   return this.http.get(url)
  //             .pipe(
  //               map((resp:any) => {
  //                 let cotizaciones:any[] = [];
  //                 resp.forEach((cot:any) => {
  //                   let fechaCot = cot[0].split('-');
  //                   if(fechaCot.length > 1){
  //                     // console.log(fechaCot);
  //                     let cotizacion = {
  //                       fecha: `${fechaCot[2]}-${fechaCot[1]}-${fechaCot[0]}`,
  //                       valor: cot[2]
  //                     }
  //                     cotizaciones.push(cotizacion)
  //                   }
                    
  //                 });
                  
  //                 return cotizaciones;
  //                 // return parseFloat(cotizaciones[0].valor.replace(',','.'))
                  
  //               }),
  //               catchError(err => of({status:false,msg: 'Error obteniendo cotizaciones'}))
  //             )
  // }

  private bancos:any[] = [
    { banco: 'santander', descripcion: 'Santander' },
    { banco: 'macro', descripcion: 'Macro' },
    { banco: 'galicia', descripcion: 'Galicia' },
    { banco: 'bbva', descripcion: 'BBVA' },
    { banco: 'credicoop', descripcion: 'Credicoop' },
    { banco: 'hsbc', descripcion: 'HSBC' },
    { banco: 'chubut', descripcion: 'Chubut' },
    { banco: 'hipotecario', descripcion: 'Hipotecario' },
    { banco: 'supervielle', descripcion: 'Supervielle' },
    { banco: 'icbc', descripcion: 'ICBC' },
    { banco: 'Brubank', descripcion: 'Brubank' },
    { banco: 'mercadopago', descripcion: 'MercadoPago' },
    { banco: 'payoneer', descripcion: 'Payoneer' },
  ]
  
  getBancos(){
    return this.bancos.sort((a,b) => {
      if(a.descripcion < b.descripcion){
        return -1;
      } else if(a.descripcion > b.descripcion){
        return 1;
      }

      return 0
    });
  }

  /** CACHE CATEGORIAS */
  getCacheCategorias(){
    this._cache.uid = this.auth.usuario.uid;
    return this._cache.getCategorias$();
  }

  updateCacheCategorias(){
    this._cache.updateCategorias();
  }

  getCategorias(){
    const url: string = `${this.apiUrl}/categorias`;
    const token: string = localStorage.getItem('token') || '';
    
    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: { uid: this.auth.usuario.uid }
    }
    
    return this.http.get(url, options )
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      
                      resp.categorias.forEach((cat:Categoria) => {
                        if(cat.usuario == '000000000000000000000000'){
                          cat.usuario = null;
                        }
                      });


                      return resp.categorias
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
  }

  addCategorias(body:any){
    const url: string = `${this.apiUrl}/categorias`;
    const token: string = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({'x-token':token});

    body = {uid: this.auth.usuario.uid, ...body};
    
    return this.http.post(url,body,{headers})
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      return resp.msg
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
  }

  updateCategoria(id:string,body:any){
    const url: string = `${this.apiUrl}/categorias`;
    const token: string = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({'x-token':token});

    body = {uid: this.auth.usuario.uid,id, ...body};
    
    return this.http.put(url,body,{headers})
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      return resp.msg
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
  }

  deleteCategoria(id:string){
    const url: string = `${this.apiUrl}/categorias`;
    const token: string = localStorage.getItem('token') || '';

    const options = {
      headers: new HttpHeaders({'x-token':token}),
      body: {
        usuario: this.auth.usuario.uid,
        id
      }
    }

    return this.http.delete(url,options)
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      return resp.msg
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
  }

  // getEstadisticas(){
  //   const url: string = `${this.apiUrl}/estadisticas`;
  //   const token: string = localStorage.getItem('token') || '';
    
  //   const options = {
  //     headers: new HttpHeaders().set('x-token',token),
  //     params: { uid: this.auth.usuario.uid }
  //   }
    
  //   return this.http.get(url, options )
  //               .pipe(
  //                 map((resp:any) => {
  //                   if(resp.ok){
  //                     return resp.data
  //                   }
  //                 }),
  //                 catchError(err => of({status:false, msg: err.error.msg}))
  //               )
  // }

  
  /** CACHE ESTADISTICAS NEW */
  getCacheEstadisticasAndCotizaciones(){
    this._cache.uid = this.auth.usuario.uid;
    // console.log(this._cache.logout);
    // this._cache.logout = true;
    
    // return this._cache.estadisticasAndCotizaciones$;
    return this._cache.getEstadisticasAndCotizaciones$();
  }

  updateCacheEstadisticasAndCotizaciones(){
    this._cache.updateEstadisticasAndCotizacion();
  }

  /** CACHE ESTADISTICAS NEW */


  /** CACHE CUOTAS PENDIENTES */
  getCacheCuotasPend(){
    this._cache.uid = this.auth.usuario.uid;
    return this._cache.getCuotasPendientes$();
  }

  updateCacheCuotasPend(){
    this._cache.updateCuotasPendientes();
  }
  
  /** CACHE CUOTAS PENDIENTES */

  updateAll(){
    this._cache.updateAll();
  }

  /** SOCKET */
  actualizarSocket(){
    
    this.socket.emit('updated',{uid: this.auth.usuario.uid});
  }

  escucharSocket(){
    return this.socket.fromEvent('updateData').pipe(
      map((resp:any) => {
        // console.log('se actualizo un resumen, actualizar todos los datos')
        this._cache.updateAll();
        return resp
      }),
      catchError(err => of(false))
    )
  }
 
}
