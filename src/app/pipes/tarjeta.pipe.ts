import { Pipe, PipeTransform } from '@angular/core';
import { Tarjeta } from '../interfaces/tarjeta.interface';
import { AuxiliaresService } from '../services/auxiliares.service';

@Pipe({
  name: 'strTarjeta'
})
export class TarjetaPipe implements PipeTransform {

  bancos:any[] = [];
  constructor(private _aux:AuxiliaresService){
    this.bancos = _aux.getBancos();
  }

  transform(tarjeta:Tarjeta,view:string = ''): String {

    // console.log(view,tarjeta);
    if(!tarjeta){
      return '';
    }

    let tipo = '';
    let debito = '';

    if(tarjeta.tipo == 'visa_deb'){
      tipo = 'visa';
      debito = ' Débito ';

    } else if(tarjeta.tipo == 'mastercard_deb'){
      tipo = 'mastercard';
      debito = ' Débito ';
    } else {
      tipo = tarjeta.tipo;
      debito = ' Crédito '
    }

    let respuesta = '';

    const banco = this.bancos.find(b => b.banco == tarjeta.banco && tarjeta.banco != '') || {banco:'',descripcion:''}

    if(view === 'estadisticas'){

      if(tarjeta._id == ''){
        respuesta = 'Todos los gastos con débito/efectivo';
      } else if(tarjeta.tipo == 'Efectivo'){
        respuesta = `<i class="fa-solid fa-money-bill-1 fa-xl mr-1"></i> ${tarjeta.descripcion}`
      } else {

        let estado = '';
        if(tarjeta.estado == 'expired'){
          estado = '<small>(vencida)</small>';
        }

        respuesta = `<i class="fa-brands fa-cc-${ tipo } fa-xl mr-1"></i>${debito}${banco.descripcion} ${tarjeta.numero} ${estado}`;
      }
    } else if(view === 'resumenes' || view === 'cuotasPendientes') {
      respuesta = ` <i class="fa-brands fa-cc-${ tipo } fa-lg mr-1"></i> ${banco.descripcion} ${tarjeta.numero}`;
    } else if(view === 'detallesResumen' || view === 'tarjetas'){
      respuesta = ` <i class="fa-brands fa-cc-${ tipo } fa-lg mr-1"></i> ${tarjeta.numero}`;
    }
    
    return respuesta;
    
  }

}
