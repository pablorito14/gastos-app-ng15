import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, mergeMap, of, shareReplay, switchMap } from 'rxjs';

import moment from 'moment';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Cuota } from '../interfaces/gasto-cuota.interface';
import { DataCacheService } from './data-cache.service';
@Injectable({
  providedIn: 'root'
})
export class GastosService {
  
  apiUrl:string = environment.apiUrl;

  constructor(private auth:AuthService,
              private _cache:DataCacheService,
              private http:HttpClient) { }


  getCotizacion(){
    return this.http.get('https://mercados.ambito.com//dolar/oficial/variacion')
              .pipe(
                map((resp:any) => {
                  return parseFloat(resp.venta.replace(',','.'))
                }),
                catchError(err => of({status:false, msg: 'Error obteniendo cotización'}))
              )
  }

  getCotizacionCierre(fecha1:string,fecha2:string){
    let url = `https://mercados.ambito.com//dolar/oficial/historico-general/${fecha1}/${fecha2}`;
    // https://mercados.ambito.com//dolar/oficial/historico-general/10-12-2022/14-12-2022

    return this.http.get(url)
              .pipe(
                map((resp:any) => {
                  let cotizaciones:any[] = [];
                  resp.forEach((cot:any) => {
                    let fechaCot = cot[0].split('-');
                    if(fechaCot.length > 1){
                      // console.log(fechaCot);
                      let cotizacion = {
                        fecha: `${fechaCot[2]}-${fechaCot[1]}-${fechaCot[0]}`,
                        valor: cot[2]
                      }
                      cotizaciones.push(cotizacion)
                    }
                    
                  });
                  // return cotizaciones;
                  return parseFloat(cotizaciones[0].valor.replace(',','.'))
                }),
                catchError(err => of({status:false, msg: 'Error obteniendo cotizaciones'}))
              )
  }

  // getGastos(id:string){
  //   // console.time('peticionGastos');
  //   const url: string = `${this.apiUrl}/gasto`;
  //   const token: string = localStorage.getItem('token') || '';
    
  //   const options = {
  //     headers: new HttpHeaders().set('x-token',token),
  //     params: { uid: this.auth.usuario.uid, resumen:id }
  //   }
    
  //   return this.http.get(url, options ).pipe(
  //     switchMap((resp:any) => {
  //       // if(resp.ok){
  //         // console.log(resp);
          
  //         // console.timeEnd('peticionGastos');
  //         // console.time('procesoPeticionGastos');
  //         let montoPesos = 0;
  //         let montoDolares = 0;
  //         resp.cuotas.forEach((c:Cuota) => {
  //           if(c.gasto.moneda === '$'){
  //             montoPesos += c.monto;
  //           } else {
  //             montoDolares += c.monto;
  //           }
            
  //         });
    
  //         resp.resumen.montoPesos = montoPesos;
  //         resp.resumen.montoDolares = montoDolares;
    
  //         resp.cuotas.sort((a:any,b:any) => {
  //           if(a.gasto.fecha < b.gasto.fecha){
  //             return -1;
  //           } else if(a.gasto.fecha > b.gasto.fecha){
  //             return 1;
  //           }
            
  //           return 0
            
  //         })
  //         resp.resumen.cuotas = resp.cuotas;
  //         let resumen = resp.resumen;
  //         let strCotizacion = '';
  //         let cuotas = resp.cuotas;
  //         let urlCotizacion = '';
  //         let cotizacionActual = false;
  //         if(moment().isBefore(moment(resumen.vencimiento))){
  //           strCotizacion = 'más actual';
  //           urlCotizacion = 'https://mercados.ambito.com//dolar/oficial/variacion';
  //           cotizacionActual = true;
  //           // return  this._gastos.getCotizacion();
  //         } else {
  //           strCotizacion = 'más cercana a la fecha de vencimiento';
  //           let fecha2 = moment(resumen.vencimiento).add(1,'day').format('YYYY-MM-DD');
  //           let fecha1 = moment(resumen.vencimiento).subtract(5,'days').format('YYYY-MM-DD');
  //           urlCotizacion = `https://mercados.ambito.com//dolar/oficial/historico-general/${fecha1}/${fecha2}`;
  //           // return this._gastos.getCotizacionCierre(fecha1,fecha2);
  //         }
  //         // console.timeEnd('procesoPeticionGastos');

  //         // console.time('peticionCotizaciones');
          
  //         return this.http.get(urlCotizacion).pipe(
  //           map((cot:any) => {
  //             let cotizacion = 0;
              
  //             if(cotizacionActual){
  //               cotizacion = parseFloat(cot.venta.replace(',','.'));
  //             } else {
  //               cotizacion = parseFloat(cot[1][2].replace(',','.'));
  //             }

  //             // console.timeEnd('peticionCotizaciones');
  //             return {resumen,cuotas,strCotizacion,cotizacion}
  //           }),
  //           catchError(err => of({status:false, msg: err.error.msg}))
  //         )
  //       // }
  //     }),
  //     // catchError(err => of({status:false, msg: err.error.msg}))
  //     catchError(err => of({status:false, msg: err.error.msg}))
  //   )
  // }


  getGasto(id:string){
    const url: string = `${this.apiUrl}/detalle-gasto`;
    const token: string = localStorage.getItem('token') || '';
    
    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: { uid: this.auth.usuario.uid, id }
    }
    
    return this.http.get(url, options )
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      return resp.gasto
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
  }

  addGasto(body:any){
    const url: string = `${this.apiUrl}/gasto`;
    const token: string = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({'x-token':token});

    body = {uid: this.auth.usuario.uid, ...body};
    
    return this.http.post(url,body,{headers})
                .pipe(
                  map((resp:any) => {
                    // console.log(resp);
                    
                    if(resp.ok){
                      return resp.msg
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
    

  }

  updateGasto(id:string,body:any){
    const url: string = `${this.apiUrl}/gasto`;
    const token: string = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({'x-token':token});

    body = {uid: this.auth.usuario.uid,id, ...body};
    
    return this.http.put(url,body,{headers})
                .pipe(
                  map((resp:any) => {
                    // console.log(resp);
                    
                    if(resp.ok){
                      return resp.msg
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
    
  }

  eliminarGasto(id:string){
    const url: string = `${this.apiUrl}/gasto`;
    const token: string = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({'x-token':token});

    const options = {
      headers: new HttpHeaders({'x-token':token}),
      body: {
        uid: this.auth.usuario.uid,
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

  /** CACHE */
  getCacheDetalles(id:string){
    // console.log(id);
    
    this._cache.uid = this.auth.usuario.uid;
    return this._cache.getDetalles$(id);
  }

  updateCacheDetalles(){
    this._cache.updateDetalles();
  }

  clearCacheDetalles(){
    this._cache.clearCacheDetalles();
  }
  
}
