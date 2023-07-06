import { Tarjeta } from './tarjeta.interface';
export interface Resumen{
  _id: string;
  usuario:String;
  inicio: string;
  cierre: string;
  vencimiento: string;
  tarjeta: Tarjeta;
  cuotas?: any[];
  montoPesos?: number;
  montoDolares?: number;
  montoEuros?: number;
  cotizacion?:number;
}