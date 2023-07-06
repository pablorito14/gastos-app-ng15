import { Pipe, PipeTransform } from '@angular/core';
import { Resumen } from '../interfaces/resumen.interface';
import { Tarjeta } from '../interfaces/tarjeta.interface';

@Pipe({
  name: 'filtrarResumenes'
})
export class FiltrarResumenesPipe implements PipeTransform {

  transform(resumenes:Resumen[], tarjeta:string): Resumen[] {
    
    if(tarjeta === null || tarjeta === undefined || tarjeta === ''){
      return resumenes;
    }
    

    return resumenes.filter(r => r.tarjeta._id == tarjeta);
  }

}
