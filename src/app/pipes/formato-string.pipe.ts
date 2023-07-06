import { TitleCasePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { AuxiliaresService } from '../services/auxiliares.service';

@Pipe({
  name: 'formatoString'
})
export class FormatoStringPipe implements PipeTransform {

  bancos!:any[];
  constructor(private _aux:AuxiliaresService){
    this.bancos = _aux.getBancos();
    
  }

  transform(data:any, tipo:string): string {
    
    // if(tarjeta === null || tarjeta === undefined || tarjeta === ''){
    //   return resumenes;
    // }

    if(data === null || data === undefined || data == ''){
      return '';
    }

    if(tipo == 'banco' || tipo == 'tarjeta'){

      let bancoObj = this.bancos.find(b => b.banco == data.banco);
      
      let banco = bancoObj.descripcion;

      return banco;

    }
    return '';
  }

}
