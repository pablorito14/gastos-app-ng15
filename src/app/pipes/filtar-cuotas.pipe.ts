import { Pipe, PipeTransform } from '@angular/core';
import { Cuota } from '../interfaces/gasto-cuota.interface';

@Pipe({
  name: 'filtarCuotas'
})
export class FiltarCuotasPipe implements PipeTransform {

  transform(cuotas:any[], tarjeta:string): Cuota[] {
    
    if(tarjeta === null || tarjeta === undefined || tarjeta === ''){
      return cuotas;
    }

    // return cuotas;
    return cuotas.filter(c => c.tarjeta._id == tarjeta);
  }
}
