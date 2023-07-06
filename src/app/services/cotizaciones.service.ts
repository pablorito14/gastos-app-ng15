import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { first, from, of, zip } from 'rxjs';

interface Cotizacion {
  fecha:string;
  valor:number;
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {

  url_cotizaciones_d = 'https://mercados.ambito.com//dolar/oficial/historico-general';
  url_cotizaciones_e = 'https://mercados.ambito.com//euro/historico-general';
  constructor(private http:HttpClient) { }

  // setCotizaciones(){
  //   console.log('verificar si hay nuevas cotizaciones');
  //   let last_update = localStorage.getItem('last_update')!;
  //   let ls_cotizaciones_d = JSON.parse(localStorage.getItem('cotizaciones_d')!) || [];
  //   let ls_cotizaciones_e = JSON.parse(localStorage.getItem('cotizaciones_e')!) || [];


  //   let actualizar_cot_d = true;
  //   let actualizar_cot_e = true;


  //   // console.log(ls_cotizaciones_d.at(0).fecha,ls_cotizaciones_e.at(0).fecha)
  //   // console.log(moment(ls_cotizaciones_d.at(0).fecha).isAfter(moment(ls_cotizaciones_e.at(0).fecha)) )

  //   const fechaInicio = (ls_cotizaciones_d.length > 0) ? ls_cotizaciones_d.at(0).fecha : '01-11-2022';
  //   const fechaActual = moment('2023-04-05').format('YYYY-MM-DD');
  //   // const fechaActual = '2023-04-04';

  //   console.log(fechaInicio);
  //   console.log(last_update)
    

  //   if(last_update && (last_update == fechaActual || 
  //      (moment(fechaActual).weekday() == 5 || moment(fechaActual).weekday() == 6)) ){
  //         console.log('es sabado o domingo o la fecha de actualizacion es la fecha actual')
  //     return;
  //   }

  //   localStorage.setItem('last_update',fechaActual)
  //   if(ls_cotizaciones_d.length > 0){
  //     // lunes = 0 / domingo = 6
      
  //     if(ls_cotizaciones_d.find((c:any) => c.fecha == fechaActual) || 
  //       moment(fechaActual).weekday() == 5 || moment(fechaActual).weekday() == 6){
  //       actualizar_cot_d = false;
  //     }
  //   }

  //   if(ls_cotizaciones_e.length > 0){
  //     // lunes = 0 / domingo = 6
  //     if(ls_cotizaciones_e.find((c:any) => c.fecha == fechaActual) || 
  //       moment(fechaActual).weekday() == 5 || moment(fechaActual).weekday() == 6){
  //       console.log('no actualizar para hoy')
  //       actualizar_cot_e = false;
  //     }

  //   }


  //   if(actualizar_cot_d && actualizar_cot_e){
  //     console.log('buscar todas las cotizaciones');
  //     const cotizacionesRequest = zip(this.cotizaciones_request(`${this.url_cotizaciones_d}/${fechaInicio}/${fechaActual}`),
  //                                     this.cotizaciones_request(`${this.url_cotizaciones_e}/${fechaInicio}/${fechaActual}`));
  
  //     console.log(fechaInicio,fechaActual);

  //     cotizacionesRequest.subscribe((resp:any[]) => {
  //       const cotizaciones_d:Cotizacion[] = [];
  //       const cotizaciones_e:Cotizacion[] = [];
        
  //       console.log(resp[0]);
  //       console.log(resp[1]);

  //       for (const cot of resp[0]) {
  //         let fechaCot = cot[0].split('/');
  //         if(fechaCot.length > 1){
  //           let cotizacion = {
  //             fecha: `${fechaCot[2]}-${fechaCot[1]}-${fechaCot[0]}`,
  //             valor: cot[2]
  //           }
  
  //           const old_cot:Cotizacion = ls_cotizaciones_d.find((c:Cotizacion) => c.fecha == cotizacion.fecha)
  //           if(old_cot){
  //             old_cot.valor = cotizacion.valor;
  //           } else {
  //             cotizaciones_d.push(cotizacion);
  //           }
            
  //         }
  //       }
  
  //       for (const cot of resp[1]) {
  //         let fechaCot = cot[0].split('/');
  //         if(fechaCot.length > 1){
  //           let cotizacion = {
  //             fecha: `${fechaCot[2]}-${fechaCot[1]}-${fechaCot[0]}`,
  //             valor: cot[2]
  //           }
  
  //           // cotizaciones_e.push(cotizacion);
  //           const old_cot:Cotizacion = ls_cotizaciones_e.find((c:Cotizacion) => c.fecha == cotizacion.fecha)
  //           if(old_cot){
  //             old_cot.valor = cotizacion.valor;
  //           } else {
  //             cotizaciones_e.push(cotizacion);
  //           }
            
  //         }
  //       }
  //       // console.log('cotizaciones_d',cotizaciones_d)
  //       // console.log('cotizaciones_e',cotizaciones_e)
  
  //       localStorage.setItem('cotizaciones_d',JSON.stringify(cotizaciones_d.concat(ls_cotizaciones_d)));
  //       localStorage.setItem('cotizaciones_e',JSON.stringify(cotizaciones_e.concat(ls_cotizaciones_e)));
  //       // localStorage.setItem('last_update',fechaActual)

  //       // localStorage.setItem('cotizaciones_d',JSON.stringify(ls_cotizaciones_d));
  //       // localStorage.setItem('cotizaciones_e',JSON.stringify(ls_cotizaciones_e));
  
  //     })

  //   }
  // }

  // setCotizaciones(){
  //   let last_update = localStorage.getItem('last_update')!;
  //   let ls_cotizaciones_d = JSON.parse(localStorage.getItem('cotizaciones_d')!) || [];
  //   let ls_cotizaciones_e = JSON.parse(localStorage.getItem('cotizaciones_e')!) || [];

    
  //   const fechaInicio = (ls_cotizaciones_d.length > 0) ? ls_cotizaciones_d.at(0).fecha : '2022-11-01';
    
  //   const fec = undefined;
  //   // const fec = '2023-05-22';
  //   const fechaActual = moment(fec).format('YYYY-MM-DD');
  //   /**
  //    * validamos (no hay fecha de ultima actualizacion)
  //    *         o (hay fecha de ultima actualizacion y es diferente a la fecha actual y no es sabado ni domingo)
  //    *         o (fecha actual es sabado y la ultima actualizacion fue hace mas de 1 dia)
  //    *         o (fecha actual es domingo y la ultima actualizacion fue hace mas de 2 dias)
  //    */

  //   // cuando todavia no hay ls_cotizaciones_d da error

  //   // let actualizar_cot_d = (!last_update) || (last_update && last_update != fechaActual && moment(fechaActual).weekday() != 5 && moment(fechaActual).weekday() != 6) || 
  //   //                         (ls_cotizaciones_d.length > 0 && moment(fechaActual).weekday() == 5 && moment(ls_cotizaciones_d.at(0).fecha).diff(moment(fec),'days') < -1) ||
  //   //                         (ls_cotizaciones_d.length > 0 && moment(fechaActual).weekday() == 6 && moment(ls_cotizaciones_d.at(0).fecha).diff(moment(fec),'days') < -2);
  //   const actualizar_cot_d = !last_update || (
  //                               last_update && last_update != fechaActual && (
  //                                 (moment(fechaActual).weekday() != 5 && moment(fechaActual).weekday() != 6) || 
  //                                 ( ls_cotizaciones_d.length > 0 &&
  //                                   (moment(fechaActual).weekday() == 5 && moment(ls_cotizaciones_d.at(0).fecha).diff(moment(fec),'days') < -1 ) || 
  //                                   (moment(fechaActual).weekday() == 6 && moment(ls_cotizaciones_d.at(0).fecha).diff(moment(fec),'days') < -2 ) 
  //                                 )
  //                               )
  //                             )                            
  //   // let actualizar_cot_e = (!last_update) || (last_update && last_update != fechaActual && moment(fechaActual).weekday() != 5 && moment(fechaActual).weekday() != 6) || 
  //   //                         (ls_cotizaciones_e.length > 0 && moment(fechaActual).weekday() == 5 && moment(ls_cotizaciones_e.at(0).fecha).diff(moment(fec),'days') < -1) ||
  //   //                         (ls_cotizaciones_e.length > 0 && moment(fechaActual).weekday() == 6 && moment(ls_cotizaciones_e.at(0).fecha).diff(moment(fec),'days') < -2);
  //   const actualizar_cot_e = !last_update || (
  //                               last_update && last_update != fechaActual && (
  //                                 (moment(fechaActual).weekday() != 5 && moment(fechaActual).weekday() != 6) || 
  //                                 ( ls_cotizaciones_e.length > 0 &&
  //                                   (moment(fechaActual).weekday() == 5 && moment(ls_cotizaciones_e.at(0).fecha).diff(moment(fec),'days') < -1 ) || 
  //                                   (moment(fechaActual).weekday() == 6 && moment(ls_cotizaciones_e.at(0).fecha).diff(moment(fec),'days') < -2 ) 
  //                                 )
  //                               )
  //                             )                            

  //   localStorage.setItem('last_update',fechaActual)
    
  //   if(actualizar_cot_d && actualizar_cot_e){
      
  //     // console.log('buscar actualizacion en ambito')
  //     // console.time('cotizacionesRequest')
  //     const fechaActualRequest = moment(fec).add(1,'day').format('YYYY-MM-DD')
  //     const cotizacionesRequest = zip(this.cotizaciones_request(`${this.url_cotizaciones_d}/${fechaInicio}/${fechaActualRequest}`),
  //                                     this.cotizaciones_request(`${this.url_cotizaciones_e}/${fechaInicio}/${fechaActualRequest}`));
  
  //     // console.log(fechaInicio,fechaActualRequest);

  //     cotizacionesRequest.subscribe((resp: any[]) => {

  //       // console.timeEnd('cotizacionesRequest')
  //       const cotizaciones_d: Cotizacion[] = [];
  //       const cotizaciones_e: Cotizacion[] = [];

  //       for (const cot of resp[0]) {
  //         let fechaCot = cot[0].split('/');
  //         if (fechaCot.length > 1) {
  //           let cotizacion = {
  //             fecha: `${fechaCot[2]}-${fechaCot[1]}-${fechaCot[0]}`,
  //             // valor: cot[2]
  //             valor: parseFloat(cot[2].replace(',', '.'))
  //           };

  //           const old_cot: any = cotizaciones_d.find((c: Cotizacion) => c.fecha == cotizacion.fecha);
  //           if (old_cot) {
  //             cotizacion = old_cot;
  //             old_cot.valor = cotizacion.valor;
  //           } else {
  //             cotizaciones_d.push(cotizacion);
  //           }

  //         }
  //       }

  //       for (const cot of resp[1]) {
  //         let fechaCot = cot[0].split('/');
  //         if (fechaCot.length > 1) {
  //           let cotizacion = {
  //             fecha: `${fechaCot[2]}-${fechaCot[1]}-${fechaCot[0]}`,
  //             // valor: cot[2]
  //             valor: parseFloat(cot[2].replace(',', '.'))
  //           };

  //           const old_cot: any = cotizaciones_e.find((c: Cotizacion) => c.fecha == cotizacion.fecha);
  //           if (old_cot) {
  //             cotizacion = old_cot;
  //             old_cot.valor = cotizacion.valor;
  //           } else {
  //             cotizaciones_e.push(cotizacion);
  //           }

  //         }
  //       }

  //       localStorage.setItem('cotizaciones_d', JSON.stringify(cotizaciones_d.concat(ls_cotizaciones_d)));
  //       localStorage.setItem('cotizaciones_e', JSON.stringify(cotizaciones_e.concat(ls_cotizaciones_e)));
  //       console.log('bbb')
  //     })
      
  //   } 
    
  // }

  setCotizaciones(){
    let last_update = localStorage.getItem('last_update')!;
    let ls_cotizaciones_d = JSON.parse(localStorage.getItem('cotizaciones_d')!) || [];
    let ls_cotizaciones_e = JSON.parse(localStorage.getItem('cotizaciones_e')!) || [];

    const fechaInicio = (ls_cotizaciones_d.length > 0) ? ls_cotizaciones_d.at(0).fecha : '2022-11-01';
    
    const fec = undefined;
    // const fec = '2023-03-20';
    const fechaActual = moment(fec).format('YYYY-MM-DD');
    /**
     * validamos (no hay fecha de ultima actualizacion)
     *         o (hay fecha de ultima actualizacion y es diferente a la fecha actual y no es sabado ni domingo)
     *         o (fecha actual es sabado y la ultima actualizacion fue hace mas de 1 dia)
     *         o (fecha actual es domingo y la ultima actualizacion fue hace mas de 2 dias)
     */

    // cuando todavia no hay ls_cotizaciones_d da error

    // let actualizar_cot_d = (!last_update) || (last_update && last_update != fechaActual && moment(fechaActual).weekday() != 5 && moment(fechaActual).weekday() != 6) || 
    //                         (ls_cotizaciones_d.length > 0 && moment(fechaActual).weekday() == 5 && moment(ls_cotizaciones_d.at(0).fecha).diff(moment(fec),'days') < -1) ||
    //                         (ls_cotizaciones_d.length > 0 && moment(fechaActual).weekday() == 6 && moment(ls_cotizaciones_d.at(0).fecha).diff(moment(fec),'days') < -2);
    const actualizar_cot_d = !last_update || (
                                last_update && last_update != fechaActual && (
                                  (moment(fechaActual).weekday() != 5 && moment(fechaActual).weekday() != 6) || 
                                  ( ls_cotizaciones_d.length > 0 &&
                                    (moment(fechaActual).weekday() == 5 && moment(ls_cotizaciones_d.at(0).fecha).diff(moment(fec),'days') < -1 ) || 
                                    (moment(fechaActual).weekday() == 6 && moment(ls_cotizaciones_d.at(0).fecha).diff(moment(fec),'days') < -2 ) 
                                  )
                                )
                              )                            
    // let actualizar_cot_e = (!last_update) || (last_update && last_update != fechaActual && moment(fechaActual).weekday() != 5 && moment(fechaActual).weekday() != 6) || 
    //                         (ls_cotizaciones_e.length > 0 && moment(fechaActual).weekday() == 5 && moment(ls_cotizaciones_e.at(0).fecha).diff(moment(fec),'days') < -1) ||
    //                         (ls_cotizaciones_e.length > 0 && moment(fechaActual).weekday() == 6 && moment(ls_cotizaciones_e.at(0).fecha).diff(moment(fec),'days') < -2);
    const actualizar_cot_e = !last_update || (
                                last_update && last_update != fechaActual && (
                                  (moment(fechaActual).weekday() != 5 && moment(fechaActual).weekday() != 6) || 
                                  ( ls_cotizaciones_e.length > 0 &&
                                    (moment(fechaActual).weekday() == 5 && moment(ls_cotizaciones_e.at(0).fecha).diff(moment(fec),'days') < -1 ) || 
                                    (moment(fechaActual).weekday() == 6 && moment(ls_cotizaciones_e.at(0).fecha).diff(moment(fec),'days') < -2 ) 
                                  )
                                )
                              )                            

    localStorage.setItem('last_update',fechaActual)
    
    if(actualizar_cot_d && actualizar_cot_e){
      
      // console.time('cotizacionesRequest')
      const fechaActualRequest = moment(fec).add(1,'day').format('YYYY-MM-DD')
      const cotizacionesRequest = zip(this.cotizaciones_request(`${this.url_cotizaciones_d}/${fechaInicio}/${fechaActualRequest}`),
                                      this.cotizaciones_request(`${this.url_cotizaciones_e}/${fechaInicio}/${fechaActualRequest}`));
  

      cotizacionesRequest.subscribe((resp: any[]) => {

        const cotizaciones_d: Cotizacion[] = [];
        const cotizaciones_e: Cotizacion[] = [];

        for (const cot of resp[0]) {
          let fechaCot = cot[0].split('/');

          if (fechaCot.length > 1) {
            let cotizacion = {
              fecha: `${fechaCot[2]}-${fechaCot[1]}-${fechaCot[0]}`,
              valor: parseFloat(cot[2].replace(',', '.'))
            };

            const old_cot = cotizaciones_d.at(-1)!;
            if(cotizaciones_d.length > 0 && old_cot.fecha == cotizacion.fecha){
              cotizacion = old_cot;
              old_cot.valor = cotizacion.valor;
            } else {
              cotizaciones_d.push(cotizacion);
            }
          }
          
        }

        for (const cot of resp[1]) {
          let fechaCot = cot[0].split('/');
          if (fechaCot.length > 1) {
            let cotizacion = {
              fecha: `${fechaCot[2]}-${fechaCot[1]}-${fechaCot[0]}`,
              valor: parseFloat(cot[2].replace(',', '.'))
            };

            const old_cot = cotizaciones_e.at(-1)!;
            if (cotizaciones_e.length > 0 && old_cot.fecha == cotizacion.fecha) {
              cotizacion = old_cot;
              old_cot.valor = cotizacion.valor;
            } else {
              cotizaciones_e.push(cotizacion);
            }

          }
        }

        localStorage.setItem('cotizaciones_d', JSON.stringify(cotizaciones_d.concat(ls_cotizaciones_d)));
        localStorage.setItem('cotizaciones_e', JSON.stringify(cotizaciones_e.concat(ls_cotizaciones_e)));
        // console.timeEnd('cotizacionesRequest')
      })
      
    } 
    
  }

  cotizaciones_request(url:string){
    return this.http.get(url);
  }

}
