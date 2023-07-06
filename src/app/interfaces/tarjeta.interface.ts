export interface Tarjeta{
  _id: string;
  numero: string;
  banco:string;
  usuario:string;
  tipo:string;
  estado:string;
  descripcion?:string;
  debito: boolean;
}