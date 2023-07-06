import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, delay, map, mergeMap, Observable, of, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';
import moment from 'moment';
import { Cuota, Gasto } from '../interfaces/gasto-cuota.interface';
import { Resumen } from '../interfaces/resumen.interface';
import { CotizacionesService } from './cotizaciones.service';

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  apiUrl:string = `${environment.apiUrl}`;
  uid:string = '';

  constructor(private http:HttpClient) { }

  /** CACHE ESTADISTICAS NEW */
  private _estadisticasAndCotizaciones$ = new BehaviorSubject<void>(undefined);
    
  private getEstadisticasAndCotizacionesRequest(){

    const url:string = `${this.apiUrl}/estadisticas`;
    const token:string = localStorage.getItem('token') || '';

    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: {uid: this.uid}
    }
    
    const time_delay = ( (JSON.parse(localStorage.getItem('cotizaciones_d')!) || []).length == 0 || 
                    (JSON.parse(localStorage.getItem('cotizaciones_d')!) || []).length == 0) ? 500 : 0;


    return this.http.get(url,options).pipe(
      delay(time_delay),
      map((resp:any) => {
        const cotizaciones = {
          cot_d: JSON.parse(localStorage.getItem('cotizaciones_d')!),
          cot_e: JSON.parse(localStorage.getItem('cotizaciones_e')!)
        }
        
        let estadisticas = this.organizarEstadisticas(resp,cotizaciones);
        
        return estadisticas;
        
      }),
      catchError(err => of({status:false,msg:err.error.msg}))

    )
    /** OLD_METHOD
    let fecha1 = moment('2022-11-01').format('YYYY-MM-DD');
    let fecha2 = moment().format('YYYY-MM-DD');

    let urlCotizaciones = `https://mercados.ambito.com//dolar/oficial/historico-general/${fecha1}/${fecha2}`;
    
    const url: string = `${this.apiUrl}/estadisticas`;
    const token: string = localStorage.getItem('token') || '';
    
    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: { uid: this.uid }
    }
    return this.http.get(urlCotizaciones).pipe(
      switchMap((cot:any) => {
        let cotizaciones = this.organizarCotizaciones(cot);
        
        return this.http.get(url,options).pipe(
          map((resp:any) => {
            let estadisticas = this.organizarEstadisticas(resp.data,cotizaciones)
            console.log(estadisticas);
            
            return estadisticas
          // }),catchError(err => {console.log(err);return of({status:false, msg: err.error.msg}) })
          }),catchError(err => of({status:false, msg:err.error.msg}))
        )
      // }),catchError(err => {console.log(err);return of({status:false,msg: 'Error obteniendo cotizaciones'}) } )
    }),catchError(err => of({status:false, msg: 'Error obteniendo cotizaciones'}))
    )
    OLD_METHOD */
  }

  private estadisticasAndCotizaciones$!: Observable<any>;

  getEstadisticasAndCotizaciones$(){
    if(!this.estadisticasAndCotizaciones$){
      this.estadisticasAndCotizaciones$ = this._estadisticasAndCotizaciones$.pipe(
        mergeMap(() => this.getEstadisticasAndCotizacionesRequest()),
        shareReplay(1));
        
    } 
        
    return this.estadisticasAndCotizaciones$;
  }

  updateEstadisticasAndCotizacion(){
    this._estadisticasAndCotizaciones$.next();
  }


  // private organizarCotizaciones(cot:any){
  //   let cotizaciones:any[] = [];
    
  //   cot.forEach((cot:any) => {
  //     let fechaCot = cot[0].split('/');
      
  //     if(fechaCot.length > 1){
  //       let cotizacion = {
  //         fecha: `${fechaCot[2]}-${fechaCot[1]}-${fechaCot[0]}`,
  //         valor: cot[2]
  //       }
  //       cotizaciones.push(cotizacion)
  //     }
      
  //   });

  //   if(cotizaciones.length > 0){
  //     cotizaciones = cotizaciones.reverse();
  //   }
  //   return cotizaciones;
  // }

  private buscarCotizacion(debito:boolean,fin_resumen:string,fecha_gasto:string,cotizaciones:any,moneda:string){
    
    // console.log('************************')
    // console.log(debito,moneda,fin_resumen,fecha_gasto);
    
    let fecha:any = undefined;
    if(debito){
      let diff = moment(fin_resumen).diff(moment(fecha_gasto),'month');
      // fecha = moment(fecha_gasto).add(diff,'month');
      fecha = moment(fecha_gasto).startOf('day').add(diff,'month').format('YYYY-MM-DD');
    } else {
      fecha = moment(fin_resumen).startOf('day').format('YYYY-MM-DD');
      // fecha = fin_resumen;
    }
    // console.log({fecha})
    
    if((moment(fecha).isBefore(moment(),'day'))){
      // console.log(moment(fecha).format('YYYY-MM-DD') + 'anterior a hoy')
      let cotizacion:any = 0;
      cotizaciones.some((c:any) => {
        const diff = moment(c.fecha).diff(moment(fecha),'day');
        
        if(diff == 0){
          // console.log('hay cotizacion para la fecha')
          cotizacion = c.valor;
          return true;
        } else if(diff == -1){
          // console.log('buscar cotizacion 1 dia despues');
          cotizacion = c.valor;
          return true;
        } else if(diff == -2){
          // console.log('buscar cotizacion 2 dia despues');
          cotizacion = c.valor;
          return true;
        } else if(diff == -3){
          // console.log('buscar cotizacion 3 dia despues');
          cotizacion = c.valor;
          return true;
        } else if(diff == -4){
          // console.log('buscar cotizacion 4 dia despues');
          cotizacion = c.valor;
          return true;
        }

        // console.log('2)', moment(c.fecha).startOf('day').isSame(moment(fecha).startOf('day')))
        // console.log(moment(c.fecha).startOf('day'),moment(fecha));

        // if(moment(c.fecha).isSame(moment(fecha),'day')){
        //   console.log('misma fecha')
        //   cotizacion = c.valor;
        //   return true;
        // } else if(moment(c.fecha).isSame(moment(fecha).add(1,'days'),'day')){
        //   console.log('buscar 1 dias para atras')
        //   cotizacion = c.valor;
        //   return true;
        // } else if(moment(c.fecha).isSame(moment(fecha).add(2,'days'),'day')){
        //   console.log('buscar 2 dias para atras')
        //   cotizacion = c.valor;
        //   return true;
        // } else if(moment(c.fecha).isSame(moment(fecha).add(3,'days'),'day')){
        //   console.log('buscar 3 dias para atras')
        //   cotizacion = c.valor;
        //   return true;
        // } else if(moment(c.fecha).isSame(moment(fecha).add(4,'days'),'day')){
        //   console.log('buscar 4 dias para atras')
        //   cotizacion = c.valor;
        //   return true;
        // }
        return false;
      })
      // console.log(fecha);
      
      if(cotizacion != 0){
        // return parseFloat(cotizacion.replace(',','.'))
        // console.log(cotizacion+'\n************************');
        return cotizacion
      } else {
        // return parseFloat(cotizaciones[cotizaciones.length-1].valor.replace(',','.'))
        // console.log(cotizaciones);
        // console.log(cotizaciones.at(0).valor+'\ncotizacion == 0\n************************');
        return cotizaciones.at(0).valor;
      }
    } else {
      // return parseFloat(cotizaciones[cotizaciones.length-1].valor.replace(',','.'))
      // console.log(cotizaciones.at(0).valor+'\nfecha no anterior a actual\n************************');
      return cotizaciones.at(0).valor;
    }
  
  }

  private organizarEstadisticas(resp:any,ls_cotizaciones:any){

    // let cotizaciones = resp.cotizaciones;
    
    let acumulador:any[] = [];
    resp.categorias.forEach((c:any,indice:number) => {
      // const acum = {id: c._id, categoria: c.descripcion, color: c.color, valor: 0};
      const acum = {id: c._id, categoria: c.descripcion, color: c.color, 
                    valor: 0, montoPesos: 0, montoDolares: 0, montoEuros: 0, 
                    cotizacion_d: 0, cotizacion_e:0 };
      acumulador.push(acum)
    })

    let newObj:any[] = []; 
    // this.tarjetas.forEach(t => {
    resp.tarjetas.forEach((t:any) => {



      let tipo = '';
      switch(t.tipo){
        case 'visa':
          tipo = 'VISA';
          break;
        case 'amex':
          tipo = 'AMEX';
          break;
        case 'mastercard':
          tipo = 'Mastercard';
          break;
        case 'visa_deb':
          tipo = 'VISA Débito';
          break;
        case 'mastercard_deb':
          tipo = 'Mastercard Débito';
          break;
        default:
          tipo = t.tipo;
          break;
      }

      let expired = '';
      if(t.estado == 'expired'){
        expired = ' (Vencida)'
      }

      const newTarjeta = JSON.parse(JSON.stringify(t))
      
      let cantCuotas = 0;
      let indice = 0;
      let resumenes:any[] = [];

      if(newTarjeta.debito){
        
        

        let debitos = resp.debitos.filter((d:any) => d.tarjeta._id == t._id);
        let suscripciones = resp.suscripciones.filter((s:any) => s.tarjeta._id == t._id);
        
        if(debitos.length > 0 || suscripciones.length > 0)  {
          // console.log('entro a procesar');
          let primer_gasto:any = undefined;
          let ultimo_gasto:any = undefined;
          
          resp.debitos.forEach((g:Gasto) => {
            if(t._id == g.tarjeta._id){
              if(!primer_gasto){
                primer_gasto = g;
              }else {
                if(moment(g.fecha).isBefore(moment(primer_gasto.fecha))){
                  primer_gasto = g;
                }
              }

              if(!ultimo_gasto){
                ultimo_gasto = g;
              } else {
                if(moment(g.fecha).isAfter(moment(ultimo_gasto.fecha))){
                  ultimo_gasto = g;
                }
              }
            }
          });

          resp.suscripciones.forEach((g:Gasto) => {
            if(t._id == g.tarjeta._id){
              if(!primer_gasto){
                primer_gasto = g;
              }else {
                if(moment(g.fecha).isBefore(moment(primer_gasto.fecha))){
                  primer_gasto = g;
                }
              }

              if(!ultimo_gasto){
                ultimo_gasto = g;
              } else {
                if(moment(g.fecha).isAfter(moment(ultimo_gasto.fecha))){
                  ultimo_gasto = g;
                } 
              }
            }

          });

          let fecha_inicio = '';
          if(primer_gasto){
            fecha_inicio = primer_gasto.fecha;
          }

          let fecha_fin = '';
          if(ultimo_gasto){
            if(moment(ultimo_gasto.fecha).isBefore(moment(),'month')){
              fecha_fin = moment().toISOString();
            } else {
              fecha_fin = ultimo_gasto.fecha;
            }
          }
          let mesesDiff = moment(fecha_fin).endOf('month').diff(moment(fecha_inicio).startOf('month'),'month')
          indice = mesesDiff;
          
          for (let index = 0; index <= mesesDiff; index++) {
            let mes = moment(fecha_inicio).add(index,'months')
            // let mes = moment(fecha_primer_gasto).add(index,'months')

            
            let newResumen = {
              acumuladores: JSON.parse(JSON.stringify(acumulador)),
              mes: mes.format('MM-YYYY'),
              inicio: mes.startOf('month').format(),
              cierre: mes.endOf('month').format(),
              cuotas: [],
              // tarjeta: newTarjeta._id,
              tarjeta: newTarjeta,
              usuario: newTarjeta.usuario,
              vencimiento: null,
              indice: indice,
              montoPesos: 0,
              montoDolares: 0,
              montoEuros: 0
            }
            indice--;
            resumenes.push(newResumen);
              
          }

          resumenes = resumenes.reverse();

          resp.debitos.forEach((d:any) => {
            if(t._id == d.tarjeta._id){
              let resumen = resumenes.find(r => r.mes == moment(d.fecha).format('MM-YYYY'));
              let categoria = resumen.acumuladores.find((cat:any) => cat.id == d.categoria)
              resumen.cuotas.push(d)

              if(d.moneda != '$'){
                // const cotizacion = this.buscarCotizacion(true,resumen.cierre,d.fecha,cotizaciones,d.moneda);
                
                if(d.moneda == 'U$D'){
                  const cotizacion = this.buscarCotizacion(true,resumen.cierre,d.fecha,ls_cotizaciones.cot_d,d.moneda);
                  resumen.montoDolares += d.monto;
                  // categoria.montoDolares += (d.monto*cotizacion)
                  categoria.montoDolares += (d.monto >= 300) ? d.monto*cotizacion*2 : d.monto*cotizacion*1.75
                } else if(d.moneda == '€'){
                  const cotizacion = this.buscarCotizacion(true,resumen.cierre,d.fecha,ls_cotizaciones.cot_e,d.moneda);
                  resumen.montoEuros += d.monto;
                  categoria.montoEuros += (d.monto >= 300) ? d.monto*cotizacion*2 : d.monto*cotizacion*1.75
                }

              } else {
                resumen.montoPesos += d.monto;
                categoria.montoPesos += d.monto;
              }
              
              cantCuotas++;
            }
          });
          
          resp.suscripciones.forEach((s:any) => {
            if(t._id == s.tarjeta._id){

              let res = resumenes.filter(r => (moment(s.fecha).isSameOrBefore(moment(r.cierre)) && 
                                              ( !s.fecha_baja || moment(s.fecha_baja).isAfter(moment(r.cierre))))
                                        )
              res.forEach(r => {
                let categoria = r.acumuladores.find((cat:any) => cat.id == s.categoria)

                if(s.moneda != '$'){
                  // const cotizacion = this.buscarCotizacion(true,r.cierre,s.fecha,ls_cotizaciones,s.moneda);
                  if(s.moneda == 'U$D'){
                    const cotizacion = this.buscarCotizacion(true,r.cierre,s.fecha,ls_cotizaciones.cot_d,s.moneda);
                    r.montoDolares += s.monto;
                    // categoria.montoDolares += (s.monto*cotizacion)
                    categoria.montoDolares += (s.monto >= 300) ? s.monto*cotizacion*2 : s.monto*cotizacion*1.75
                  } else if(s.moneda == '€'){
                    const cotizacion = this.buscarCotizacion(true,r.cierre,s.fecha,ls_cotizaciones.cot_e,s.moneda);
                    r.montoEuros += s.monto;
                    // categoria.montoEuros += (s.monto*cotizacion)
                    categoria.montoEuros += (s.monto >= 300) ? s.monto*cotizacion*2 : s.monto*cotizacion*1.75
                  }
  
                } else {
                  r.montoPesos += s.monto;
                  categoria.montoPesos += s.monto;
                }

                r.cuotas.push(s);
              })
              cantCuotas++;
            }
          });
          // console.log(resumenes);
        } else {
          let newResumen = {
            acumuladores: JSON.parse(JSON.stringify(acumulador)),
            mes: moment().format('MM-YYYY'),
            inicio: moment().startOf('month').format(),
            cierre: moment().endOf('month').format(),
            cuotas: [],
            tarjeta: newTarjeta,
            usuario: newTarjeta.usuario,
            vencimiento: null,
            indice: indice,
            montoPesos: 0,
            montoDolares: 0,
            montoEuros: 0
          }
          resumenes.push(newResumen);
        }
      } else { // tarjetas de credito
        resp.resumenes.forEach((r:any) => {
          if(r.tarjeta == t._id){
            let newResumen = JSON.parse(JSON.stringify(r))
            let newAcum = JSON.parse(JSON.stringify(acumulador))
            newResumen.cotizacion_d = 0;
            newResumen.cotizacion_e = 0;
            newResumen.montoPesos = 0;
            newResumen.montoDolares = 0;
            newResumen.montoEuros = 0;
            let cuotas:any[] = [];
            // this.cuotas.forEach((c:any) => {
            resp.cuotas.forEach((c:any) => {
              if(c.resumen == r._id){
                let newCuota = JSON.parse(JSON.stringify(c))
                cuotas.push(newCuota);
                
                let categoria = newAcum.find((cat:any) => cat.id == c.gasto.categoria)

                if(c.gasto.moneda == 'U$D'){
                  categoria.montoDolares += c.monto;
                  newResumen.montoDolares += c.monto;
                } else if(c.gasto.moneda == '€'){
                  categoria.montoEuros += c.monto;
                  newResumen.montoEuros += c.monto;
                } else {
                  categoria.montoPesos += c.monto;
                  newResumen.montoPesos += c.monto;
                }

                cantCuotas++;


              }
            })

            if(newResumen.montoDolares > 0){
              // let cotizacion = this.buscarCotizacion(false,r.vencimiento,'',cotizaciones);
              const cotizacion_d = this.buscarCotizacion(false,r.vencimiento,'',ls_cotizaciones.cot_d,'U$D')
              newResumen.cotizacion_d = cotizacion_d;
            }

            if(newResumen.montoEuros > 0){
              // let cotizacion = this.buscarCotizacion(false,r.vencimiento,'',cotizaciones);
              const cotizacion_e = this.buscarCotizacion(false,r.vencimiento,'',ls_cotizaciones.cot_e,'€')
              newResumen.cotizacion_e = cotizacion_e;
            }

            newResumen.acumuladores = newAcum;
            newResumen.cuotas = cuotas
            newResumen.indice = indice; 
            indice++;
            resumenes.push(newResumen);
          }
        })
      }

      newTarjeta.descripcion = `${tipo} ${t.numero}${expired}`;
      newTarjeta.cantCuotas = cantCuotas;
      newTarjeta.resumenes = resumenes;

      if(newTarjeta.resumenes.length > 0){
        newObj.push(newTarjeta);
      }
      
    })

    let tarjetaAll:any = {
      _id: '',
      numero: '',
      banco: '',
      usuario: '',
      tipo: '',
      estado: '',
      descripcion: 'Efectivo/Todas las tarjetas de débito',
      debito: true,
      resumenes: []
    }
    newObj.forEach(t => {
      // console.log(t);
      
      if(t.debito){
        t.resumenes.forEach((r:any) => {
          if(!tarjetaAll.resumenes.some((resumen:any) => resumen.mes == r.mes)){
            let newResumen = Object.assign({}, r);
            
            let newAcum:any = [];
            r.acumuladores.forEach((a:any) => {
              newAcum.push(JSON.parse(JSON.stringify(a)));  
            });

            newResumen.acumuladores = newAcum;

            tarjetaAll.resumenes.push(newResumen);
          } else {
            let resumen = tarjetaAll.resumenes.find((res:any) => res.mes == r.mes);
            resumen.acumuladores.forEach((acum:any) => {
              let acumulador = r.acumuladores.find((a:any) => a.id == acum.id);

              acum.valor += acumulador.valor;
              acum.montoPesos += acumulador.montoPesos;
              acum.montoDolares += acumulador.montoDolares;
              acum.montoEuros += acumulador.montoEuros;

            });

            resumen.cuotas = resumen.cuotas.concat(r.cuotas);
          }

          // console.log(t.descripcion,r.acumuladores);
          
        });

        
        
      }

      
      
    })
    // console.log(tarjetaAll);
    

    newObj.sort((a,b) => {
      if(a.estado < b.estado){
        return -1;
      } else if(a.estado > b.estado){
        return 1;
      } else if(a.cantCuotas > b.cantCuotas){
        return -1;
      } else if(a.cantCuotas < b.cantCuotas){
        return 1;
      } else {
        return 0;
      }
    })

    newObj.unshift(tarjetaAll);
    // console.log(newObj)
    return newObj;
  }
  /** CACHE ESTADISTICAS NEW */

  /** CACHE TARJETAS */
  private _tarjetas$ = new BehaviorSubject<void>(undefined);

  private getTarjetasRequest(){
    const url: string = `${this.apiUrl}/tarjeta`;
    const token: string = localStorage.getItem('token') || '';
    
    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: { uid:this.uid }
    }

    return this.http.get(url,options).pipe(
      map((resp:any) => {
        // console.log(`update tarjetas ENDPOINT [cache service user ${this.uid}]`);
        // console.log(resp);
        resp.tarjetas.forEach((t:any) => {

          let tipo = '';
          switch(t.tipo){
            case 'visa':
              tipo = 'VISA';
              break;
            case 'amex':
              tipo = 'AMEX';
              break;
            case 'mastercard':
              tipo = 'Mastercard';
              break;
            case 'visa_deb':
              tipo = 'VISA Débito';
              break;
            case 'mastercard_deb':
              tipo = 'Mastercard Débito';
              break;
          }
  
          let expired = '';
          if(t.estado == 'expired'){
            expired = ' (Vencida)'
          }
          // let formatoString = new FormatoStringPipe();
  
          // let banco = formatoString.transform(t,'banco');
          
          // t.descripcion = `${tipo} ${banco} ${t.numero}${expired}`;        
          t.descripcion = `${tipo} ${t.numero}`;        
        })

        return resp.tarjetas;
        
      }),
      catchError(err => of({status: false,msg: err.error.msg}))
    );

  }
  
  private tarjetas$!: Observable<any>;

  getTarjetas$(){
    if(!this.tarjetas$){
      this.tarjetas$ = this._tarjetas$.pipe(
        mergeMap(() => this.getTarjetasRequest()),
        shareReplay(1)
      )
    }

    return this.tarjetas$;
  }

  updateTarjetas(){
    this._tarjetas$.next();
  }
  /** CACHE TARJETAS */

  

  /** CACHE CUOTAS PENDIENTES */
  private _cuotasPendientes$ = new BehaviorSubject<void>(undefined);
  private getCuotasPendientesRequest(){
    const url: string = `${this.apiUrl}/cuotas-pendientes`;
    const token: string = localStorage.getItem('token') || '';
    
    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: { uid: this.uid }
    }
    
    return this.http.get(url, options )
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      // console.log('update cuotas pendientes ENDPOINT')
                      console.log(resp);
                      
                      return resp
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
  }

  private cuotasPendientes$!: Observable<any>;

  getCuotasPendientes$(){
    if(!this.cuotasPendientes$){
      this.cuotasPendientes$ = this._cuotasPendientes$.pipe(
        mergeMap(() => this.getCuotasPendientesRequest()),
        shareReplay(1)
      )
    }
    return this.cuotasPendientes$;
  }

  updateCuotasPendientes(){
    this._cuotasPendientes$.next();
  }
  /** CACHE CUOTAS PENDIENTES */

  /** CACHE DEBITOS */
  private _debitos$ = new BehaviorSubject<void>(undefined);

  private getDebitosRequest(){
    const url: string = `${this.apiUrl}/debito`;
    const token: string = localStorage.getItem('token') || '';
    
    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: { uid: this.uid }
    }
    return this.http.get(url,options).pipe(
      map((resp:any) => {
        // console.log('update debitos ENDPOINT');
        // console.log(resp);
        
        let newObj:any[] = []; 
        // this.tarjetas.forEach(t => {
        resp.tarjetas.forEach((t:any) => {

          let tipo = '';
          switch(t.tipo){
            case 'visa':
              tipo = 'VISA';
              break;
            case 'amex':
              tipo = 'AMEX';
              break;
            case 'mastercard':
              tipo = 'Mastercard';
              break;
            case 'visa_deb':
              tipo = 'VISA Débito';
              break;
            case 'mastercard_deb':
              tipo = 'Mastercard Débito';
              break;
            default: 
              tipo = t.tipo;
              break;
          }

          let expired = '';
          if(t.estado == 'expired'){
            expired = ' (Vencida)'
          }


          const newTarjeta = JSON.parse(JSON.stringify(t))
          // console.log(newTarjeta);
          
          let cantCuotas = 0;
          let indice = 0;
          let resumenes:any[] = [];

          /** buscamos el primer gasto entre debitos y suscripciones */ 
          let debitos = resp.debitos.filter((d:any) => d.tarjeta._id == t._id);
          let suscripciones = resp.suscripciones.filter((s:any) => s.tarjeta._id == t._id);
          
          
            
          // if(resp.debitos.length > 0 && resp.suscripciones.length > 0)  {    
          if(debitos.length > 0 || suscripciones.length > 0)  {
            
            let primer_gasto:any = undefined;
            let ultimo_gasto:any = undefined;
            
            resp.debitos.forEach((g:Gasto) => {
              if(t._id == g.tarjeta._id){
                if(!primer_gasto){
                  primer_gasto = g;
                }else {
                  if(moment(g.fecha).isBefore(moment(primer_gasto.fecha))){
                    primer_gasto = g;
                  }
                }

                if(!ultimo_gasto){
                  ultimo_gasto = g;
                } else {
                  if(moment(g.fecha).isAfter(moment(ultimo_gasto.fecha))){
                    ultimo_gasto = g;
                  }
                }
              }
            });

            resp.suscripciones.forEach((g:Gasto) => {
              if(t._id == g.tarjeta._id){
                if(!primer_gasto){
                  primer_gasto = g;
                }else {
                  if(moment(g.fecha).isBefore(moment(primer_gasto.fecha))){
                    primer_gasto = g;
                  }
                }

                if(!ultimo_gasto){
                  ultimo_gasto = g;
                } else {
                  if(moment(g.fecha).isAfter(moment(ultimo_gasto.fecha))){
                    ultimo_gasto = g;
                  } 
                }
              }

            });

            // let fecha_inicio = primer_gasto.fecha;
            let fecha_inicio = '';
            if(primer_gasto){
              fecha_inicio = primer_gasto.fecha;
            }
            let fecha_fin = '';
            if(moment(ultimo_gasto.fecha).isBefore(moment(),'month')){
              fecha_fin = moment().toISOString();
            } else {
              fecha_fin = ultimo_gasto.fecha;
            }

            // let mesesDiff = moment(fecha_fin).diff(moment(fecha_inicio),'month')
            let mesesDiff = moment(fecha_fin).endOf('month').diff(moment(fecha_inicio).startOf('month'),'month')
            indice = mesesDiff;
            
            for (let index = 0; index <= mesesDiff; index++) {
              let mes = moment(fecha_inicio).add(index,'months')
              // let mes = moment(fecha_primer_gasto).add(index,'months')
              
              
              if(!resumenes.some(r => r.mes == mes.format('MM-YYYY'))){


                let newResumen = {
                  mes: mes.format('MM-YYYY'),

                  inicio: mes.startOf('month').format(),
                  cierre: mes.endOf('month').format(),
                  cuotas: [],
                  tarjeta: newTarjeta._id,
                  usuario: newTarjeta.usuario,
                  vencimiento: null,
                  indice: indice,
                  montoPesos: 0,
                  montoDolares: 0,
                  montoEuros:0
                }
                indice--;
                resumenes.push(newResumen);
              }  
            }

            resumenes = resumenes.reverse();

            resp.debitos.forEach((d:any) => {
              // console.log(d);
              // console.log(resumenes);
              
              
              if(t._id == d.tarjeta._id){
                let resumen = resumenes.find(r => r.mes == moment(d.fecha).format('MM-YYYY'));
                resumen.cuotas.push(d)

                if(d.moneda == 'U$D'){
                  resumen.montoDolares += d.monto;
                } else if(d.moneda == '€') {
                  resumen.montoEuros += d.monto;
                } else if(d.moneda == '$') {
                  resumen.montoPesos += d.monto;
                }
                cantCuotas++;
              }
            });
            
            resp.suscripciones.forEach((s:any) => {
              if(t._id == s.tarjeta._id){

                let res = resumenes.filter(r => (moment(s.fecha).isSameOrBefore(moment(r.cierre)) && 
                                                ( !s.fecha_baja || moment(s.fecha_baja).isAfter(moment(r.cierre))))
                                          )

                res.forEach(r => {
                  if(s.moneda == 'U$D'){
                    r.montoDolares += s.monto;
                  } else if(s.moneda == '€'){
                    r.montoEuros += s.monto;
                  } else if(s.moneda == '$'){
                    r.montoPesos += s.monto;
                  }

                  // if(s.moneda == '$'){
                  //   r.montoPesos += s.monto;
                  // } else {
                  //   r.montoDolares += s.monto;
                  // }

                  r.cuotas.push(s);
                })
                

                cantCuotas++;
              }
            });

            
            resumenes.forEach(r => {
              r.cuotas.sort((a:any,b:any) => {

                if(moment(a.fecha).isAfter(moment(b.fecha))){
                  return -1;
                } 

                if(moment(a.fecha).isBefore(moment(b.fecha))){
                  return 1;
                }

                return 0;
              })
            })
          } else {
            let newResumen = {
              mes: moment().format('MM-YYYY'),

              inicio: moment().startOf('month').format(),
              cierre: moment().endOf('month').format(),
              cuotas: [],
              tarjeta: newTarjeta._id,
              usuario: newTarjeta.usuario,
              vencimiento: null,
              indice: indice,
              montoPesos: 0,
              montoDolares: 0
            }
            resumenes.push(newResumen);
          }
          
          newTarjeta.descripcion = `${tipo} ${t.numero}${expired}`;
          newTarjeta.cantCuotas = cantCuotas;
          newTarjeta.resumenes = resumenes;

          if(newTarjeta.resumenes.length > 0){
            newObj.push(newTarjeta);
          }
          
        })

        // console.log(newObj);
        
        newObj.sort((a,b) => {
          if(a.estado < b.estado){
            return -1;
          } else if(a.estado > b.estado){
            return 1;
          } else if(a.cantCuotas > b.cantCuotas){
            return -1;
          } else if(a.cantCuotas < b.cantCuotas){
            return 1;
          } else {
            return 0;
          }
        })

        // console.log(newObj)
        return newObj;
        
      }),
      catchError(err => of({status: false,msg: err.error.msg}))
    );
  }
  
  private debitos$!: Observable<any>;

  getDebitos$(){
    if(!this.debitos$){
      this.debitos$ = this._debitos$.pipe(
        mergeMap(() => this.getDebitosRequest()),
        shareReplay(1)
      )
    }

    return this.debitos$;
  }

  updateDebitos(){
    this._debitos$.next();
  }
  /** CACHE DEBITOS */

  /** CACHE RESUMENES */
  private _resumenes$ = new BehaviorSubject<void>(undefined);

  private getResumesRequest(){
    const url: string = `${this.apiUrl}/resumen`;
    const token: string = localStorage.getItem('token') || '';
    
    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: { uid: this.uid }
    }

    return this.http.get(url, options )
                .pipe(
                  map((resp:any) => {
                    // if(resp.ok){
                      // console.log('update resumenes ENDPOINT');
                      // console.log(resp);
                      resp.resumenes.forEach((r:Resumen) => {
                        let montoP = 0;
                        let montoD = 0;
                        let montoE = 0;
                        
                        resp.cuotas.forEach((c:Cuota) => {
                          if(c.resumen == r._id){
                            if(c.gasto.moneda == '$'){
                              montoP += c.monto;
                            } else if(c.gasto.moneda == 'U$D') {
                              montoD += c.monto;
                            } else if(c.gasto.moneda == '€'){
                              montoE += c.monto;
                            }

                          }
                        });

                        r.montoPesos = montoP;
                        r.montoDolares = montoD;
                        r.montoEuros = montoE;
                      });


                      resp.tarjetas.forEach((t:any) => {

                        let tipo = '';
                        switch(t.tipo){
                          case 'visa':
                            tipo = 'VISA';
                            break;
                          case 'amex':
                            tipo = 'AMEX';
                            break;
                          case 'mastercard':
                            tipo = 'Mastercard';
                            break;
                          case 'visa_deb':
                            tipo = 'VISA Débito';
                            break;
                          case 'mastercard_deb':
                            tipo = 'Mastercard Débito';
                            break;
                        }
                
                        let expired = '';
                        if(t.estado == 'expired'){
                          expired = ' (Vencida)'
                        }
                        let banco = '';
                        // let formatoString = new FormatoStringPipe();
                
                        // let banco = formatoString.transform(t,'banco');
                        
                        t.descripcion = `${tipo} ${banco} ${t.numero}${expired}`;        
                      })
                      console.log(resp);
                     
                      return {tarjetas:resp.tarjetas,resumenes:resp.resumenes};
                    // }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
  }

  private resumenes$!: Observable<any>

  getResumenes$(){
    if(!this.resumenes$){
      this.resumenes$ = this._resumenes$.pipe(
        mergeMap(() => this.getResumesRequest()),
        shareReplay(1)
      )
    }

    return this.resumenes$;
  }

  updateResumes(){
    this._resumenes$.next();
    
  }
  /** CACHE RESUMENES */

  /** CACHE CATEGORIAS */

  private _categorias$ = new BehaviorSubject<void>(undefined);
  
  private getCategoriasRequest(){
    const url: string = `${this.apiUrl}/categorias`;
    const token: string = localStorage.getItem('token') || '';
    
    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: { uid: this.uid }
    }
    return this.http.get(url, options )
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      
                      resp.categorias.forEach((cat:any) => {
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

  private categorias$!: Observable<any>;

  getCategorias$(){
    if(!this.categorias$){
      this.categorias$ = this._categorias$.pipe(
        mergeMap(() => this.getCategoriasRequest()),
        shareReplay(1)
      )
    }

    return this.categorias$;
  }

  updateCategorias(){
    this._categorias$.next();
  }

  /** CACHE CATEGORIAS */

  /** CACHE DETALLES-RESUMEN */
  
  private _detalles$ = new BehaviorSubject<void>(undefined);
  // private getDetallesRequest(){
    
  //   let id = this.id_detalle;
  //   // console.log(id);
  //   const url: string = `${this.apiUrl}/gasto`;
  //   const token: string = localStorage.getItem('token') || '';
    
  //   const options = {
  //     headers: new HttpHeaders().set('x-token',token),
  //     params: { uid: this.uid, resumen:id }
  //   }

  //   // traer cotizaciones del localstorage
    
  //   return this.http.get(url, options ).pipe(
  //     switchMap((resp:any) => {
  //       // if(resp.ok){
  //         // console.log(resp);
  //         // console.log(id);
          
          
  //         // console.timeEnd('peticionGastos');
  //         // console.time('procesoPeticionGastos');
  //         let montoPesos = 0;
  //         let montoDolares = 0;
  //         let montoEuros = 0;
  //         resp.cuotas.forEach((c:Cuota) => {
  //           if(c.gasto.moneda === '$'){
  //             montoPesos += c.monto;
  //           } else if(c.gasto.moneda == 'U$D') {
  //             montoDolares += c.monto; 
  //           } else if(c.gasto.moneda == '€'){
  //             montoEuros += c.monto;
  //           }
            
  //         });
    
  //         resp.resumen.montoPesos = montoPesos;
  //         resp.resumen.montoDolares = montoDolares;
  //         resp.resumen.montoEuros = montoEuros;
    
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
  private getDetallesRequest(){
    
    let id = this.id_detalle;
    // console.log(id);
    const url: string = `${this.apiUrl}/gasto`;
    const token: string = localStorage.getItem('token') || '';
    
    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: { uid: this.uid, resumen:id }
    }
    
    // traer cotizaciones del localstorage
    const time_delay = ( (JSON.parse(localStorage.getItem('cotizaciones_d')!) || []).length == 0 || 
                    (JSON.parse(localStorage.getItem('cotizaciones_d')!) || []).length == 0) ? 500 : 0;

    return  this.http.get(url, options ).pipe(
      delay(time_delay),
      map((resp:any) => {

        let ls_cotizaciones:any = {
          ls_cotizaciones_d: JSON.parse(localStorage.getItem('cotizaciones_d')!),
          ls_cotizaciones_e: JSON.parse(localStorage.getItem('cotizaciones_e')!)
        };

        let montoPesos = 0;
        let montoDolares = 0;
        let montoEuros = 0;
        resp.cuotas.forEach((c:Cuota) => {
          if(c.gasto.moneda === '$'){
            montoPesos += c.monto;
          } else if(c.gasto.moneda == 'U$D') {
            montoDolares += c.monto; 
          } else if(c.gasto.moneda == '€'){
            montoEuros += c.monto;
          }
          
        });
  
        resp.resumen.montoPesos = montoPesos;
        resp.resumen.montoDolares = montoDolares;
        resp.resumen.montoEuros = montoEuros;
  
        resp.cuotas.sort((a:any,b:any) => {
          if(a.gasto.fecha < b.gasto.fecha){
            return -1;
          } else if(a.gasto.fecha > b.gasto.fecha){
            return 1;
          }
          
          return 0
          
        })
        resp.resumen.cuotas = resp.cuotas;
        let resumen = resp.resumen;
        let strCotizacion = 'Cotizacion según ambito.com ';
        let cuotas = resp.cuotas;
        let cotizacion_d = 0;
        let cotizacion_e = 0;


        const ls_cotizaciones_d:any[] = ls_cotizaciones.ls_cotizaciones_d;
        const ls_cotizaciones_e:any[] = ls_cotizaciones.ls_cotizaciones_e;
        

        const formato_fecha = '';
        if(moment().isBefore(moment(resumen.vencimiento))){
          // buscar ultima actualizacion de dolar y euros

          // const fec_d = ls_cotizaciones_d.at(0).fecha;
          // const fec_e = ls_cotizaciones_e.at(0).fecha;

          // if(fec_d == fec_e){
          //   strCotizacion += `del U$D y € al ${moment(fec_d).format('DD/MM')}`;
          // } else {
          //   strCotizacion += `del U$D al ${moment(fec_d).format('DD/MM')} y del € al ${moment(fec_e).format('DD/MM')}`;
          // }

          strCotizacion = 'mas reciente';
          cotizacion_d = ls_cotizaciones_d.at(0).valor;
          cotizacion_e = ls_cotizaciones_e.at(0).valor;
        } else {
          // cotizacion segun ambito.com del dolar al 13/05 y del euro al 22/05 (mas cercano al vencimiento)
         
          // buscar la actualizacion del dolar y euros mas cercana al vencimiento
          
          // buscarCotizacion(debito:boolean,fin_resumen:string,fecha_gasto:string,cotizaciones:any,moneda:string);
          cotizacion_d = this.buscarCotizacion(false,resumen.vencimiento,'',ls_cotizaciones_d,'U$D');
          cotizacion_e = this.buscarCotizacion(false,resumen.vencimiento,'',ls_cotizaciones_e,'€');
          
          strCotizacion = 'más cercana a la fecha de vencimiento';
          // TODO: COTIZACION CERCANA A LA FECHA DE VENCIMIENTO DEL RESUMEN

        }

        
        // console.log(cotizacionActual);

        // const cotizacion = 0;
        return {resumen,cuotas,strCotizacion,cotizacion_d,cotizacion_e};
          
      }),
      catchError(err => {
        console.log(err); 

        let code = '';
        let error = err.error;
        if(!error){
          console.log('aaa')
          error = 'Error desconocido. Recargue la pagina.';
          code = 'localstorage';
        }
        
        // let error = 'Error desconocido. Recargue la pagina';
        // let code: 'localstorage'
        return of({status:false, msg: error, code: code})
      })
    )
  }

  private detalles$!: Observable<any>;
   id_detalle:string = '';
  getDetalles$(id:string){
    // console.log(id);
    
    if(!this.detalles$){
      // console.log(id);
      this.id_detalle = id;
      this.detalles$ = this._detalles$.pipe(
        mergeMap(() => this.getDetallesRequest()),
        shareReplay(1)
      )
    }

    if(this.id_detalle != id){
      this.id_detalle = id;
      this.updateDetalles();
    }
    return this.detalles$;
  }

  updateDetalles(){
    this._detalles$.next();
  }

  clearCacheDetalles(){
    this.detalles$ = undefined!;
  }

  /** CACHE DETALLES-RESUMEN */

  /** CACHE DETALLES-RESUMEN */
  
  clearCache(){
    this.estadisticasAndCotizaciones$ = undefined!;
    
    this.resumenes$ = undefined!;
    this.tarjetas$ = undefined!;
    this.cuotasPendientes$ = undefined!;
    this.debitos$ = undefined!;

    this.categorias$ = undefined!;

    this.detalles$ = undefined!;

  }
  /** ACTUALIZAR TODOS LOS CACHE */
  updateAll(){
    this.updateEstadisticasAndCotizacion();
    this.updateTarjetas();
    this.updateCuotasPendientes();
    this.updateDebitos();
    this.updateResumes();
    this.updateCategorias();
    this.updateDetalles();
  }
}
