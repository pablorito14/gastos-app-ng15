import { Tarjeta } from "./tarjeta.interface";



export interface Gasto {
  _id            :string;
  tarjeta       : Tarjeta;
  descripcion   :string;
  monto         :number;
  moneda        :string;
  fecha         :Date;
  fecha_baja    :Date | null;
  categoria     :string;
  cuotas: number;
}

export interface Categoria{
  id            :string;
  descripcion   :string;
}

export interface Cuota{
  _id            :string;
  gasto         :Gasto;
  monto         :number;
  descripcion   :string;
  resumen       :string;
}
  