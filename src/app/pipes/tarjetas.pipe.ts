import { Pipe, PipeTransform } from '@angular/core';
import { Tarjeta } from '../interfaces/tarjeta.interface';
import { AuxiliaresService } from '../services/auxiliares.service';

@Pipe({
  name: 'tarjetas'
})
export class TarjetasPipe implements PipeTransform {
  
  bancos!:any[];
  constructor(private _aux:AuxiliaresService){
    this.bancos = _aux.getBancos();
    
  }

  transform(tarjetasSource:Tarjeta[],view:string): Tarjeta[] {
    
    if(!tarjetasSource){
      return [];
    }
    
    let returnTarjetas:Tarjeta[] = [];
    if(view == 'newGasto' || view == 'resumenes' || view == 'newResumen' || 
        view == 'cuotasPendientes' || view == 'debitos' || view == 'estadisticas'){
      let tarjetas:Tarjeta[] = tarjetasSource;

      if(view != 'resumenes' && view != 'debitos' && view != 'estadisticas'){
        tarjetas = tarjetas.filter((t:Tarjeta) => t.estado == 'active');
      }
      
      tarjetas.forEach(t => {
        
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

        const banco = this.bancos.find(b => b.banco == t.banco && t.banco != '') || {banco:'',descripcion:''}
        
        t.descripcion = `${tipo} ${banco.descripcion} ${t.numero}`; 
        if(view == 'estadisticas' && t.tipo == ''){
          t.descripcion = 'Efectivo/Todas las tarjetas de débito'
        }
        if(t.estado === 'expired'){
          t.descripcion = `${t.descripcion} (vencida)`
        }
      });

      if(view == 'newGasto'){
        returnTarjetas = tarjetas.sort((t1:any,t2:any) => {

          if(t1.tipo == 'Efectivo' ){
            return -1;
          }
          if(t1.descripcion < t2.descripcion){
            return -1
          } else if(t1.descripcion > t2.descripcion){
            return 1
          }
          return 0
        });
      }else if(view == 'resumenes' || view == 'newResumen' || view == 'cuotasPendientes'){
        returnTarjetas = tarjetas.sort((t1,t2) => {
          
          if(t1.estado < t2.estado){
            return -1;
          } else if(t1.estado > t2.estado){
            return 1;
          } else {
            if(t1.banco < t2.banco){
              return -1;
            } else if(t1.banco > t2.banco){
              return 1;
            }
  
            return 0
          }
          
          
        })
      } else if(view == 'debitos' || view == 'estadisticas'){
        returnTarjetas = tarjetas;
      }

    }
    return returnTarjetas;    
    // return [];
  }

}
