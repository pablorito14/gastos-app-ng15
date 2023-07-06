import { Component, OnInit, OnDestroy } from '@angular/core';
import moment from 'moment';
import { Resumen } from 'src/app/interfaces/resumen.interface';
import { AuxiliaresService } from 'src/app/services/auxiliares.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { Subscription } from 'rxjs';
import { GastosService } from 'src/app/services/gastos.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styles: [
    `
    .p-button-custom{
      background-color: #fff;
      /* border: 1px solid rgba(0, 0, 0, 0.12); */
      color: #000;
      border-radius: 1rem;
      
    }

    .p-button-custom-expired{
      background-color: lightgray;
    }

    .p-button-custom:hover,
    .p-button-custom:focus,
    .p-button-custom-active{
      background-color: #3f51b5;
      /* border: 1px solid rgba(0, 0, 0, 0.2); */
      color: #ffffff;
    }

    ::ng-deep .p-card-content{
      padding-top: 0 !important;
    }

    ::ng-deep .detalles-categoria .p-card-body{
      padding: .5rem !important
    }
    
    
    `
  ]
})
export class EstadisticasComponent implements OnInit,OnDestroy {

  loading:boolean = true;

  imp_rg4815:number = environment.imp_rg4815;
  imp_pais:number = environment.imp_pais;
  imp_catar:number = environment.imp_catar

  moment = moment;

  constructor(private _aux: AuxiliaresService,
              private _notificaciones:NotificacionesService
              ) { }
  

  estadisticasSubscription!:Subscription;
  // estadisticas$ = this._aux.estadisticas$;
  // cotizaciones$ = this._aux.cotizaciones$;
  
  // estadisticasAndCotizaciones$ = this._aux.estadisticasAndCotizaciones$; 
  ngOnDestroy(): void {
    this.estadisticasSubscription.unsubscribe();
    // this.socketSubscription.unsubscribe();
  }
  
  socketSubscription!:Subscription;
  ngOnInit() {
    
    this.socketSubscription = this._aux.escucharSocket().subscribe();
    this.obtenerDatos();  
    
    // console.log(localStorage.getItem('cotizaciones_d'));

    // let delayMs = 0;
    // if(localStorage.getItem('cotizaciones_d') && localStorage.getItem('cotizaciones_d')){
    //   console.log('no esperar')
    //   delayMs = 0;
    // }
    

    // console.log(delayMs)
    // setTimeout(() => this.obtenerDatos(), delayMs)
  }

  tarjetas:any[] = []; 
  resumenesActuales: Resumen[] = [];
  resumenActual!:any;

  allData:any;

  borrar_localstorage_cotizaciones(){
    localStorage.removeItem('last_update');
    localStorage.removeItem('cotizaciones_d');
    localStorage.removeItem('cotizaciones_e')
  }


  obtenerDatos(){
    this.estadisticasSubscription = this._aux.getCacheEstadisticasAndCotizaciones()
      .subscribe((resp:any) => {
        if(resp.status === false){
          this._notificaciones.toastr('error',resp.msg,'');
          return;
        }
        
        if(resp.length == 0){
          this.loading = false;
          return;
        }
        this.allData = resp;
        // console.log(resp)
        
        this.dataShow = this.allData[0];
        if(this.dataShow){
          let filtro = localStorage.getItem('filtro-estadisticas');
          if(filtro){
            this.cambiarTarjeta(filtro);
          } else {
            this.mostrarDatos()
          }
          
        }
        this.reload = false;
        this.loading = false;
    })
    
  }

  dataShow:any;
  strResumenActual:string = '';
  /** CHART */
  mostrarDatos(){
    this.tarjetaSel = this.dataShow._id;
    // this.buttonActive = this.dataShow._id;
    // const now = moment('2022-10-22');//
    const now = moment();

    // if(this.dataShow.debito){
      // console.log('calcular debitos por mes');
      
    // } else {
      this.resumenActual = null;
      this.dataShow.resumenes.forEach((r:any,indice:number) => {
        if(now.isBetween(r.inicio,r.cierre,undefined,'[)')){
          this.resumenActual = r;
        }
      });

      this.strResumenActual = 'Resumen';

      if(!this.resumenActual){
        this.resumenActual = this.dataShow.resumenes[0];
        this.strResumenActual = 'Último resumen disponible';
      } else if(this.dataShow.debito){
        this.strResumenActual = 'Periodo';
      }
    // }

    this.chartRender();
  }

  
  tarjetaSel:any;
  buttonActive:string = '';

  cambiarTarjeta(tarjeta:string){
    // console.log(tarjeta);
    if(tarjeta != ''){
      localStorage.setItem('filtro-estadisticas',tarjeta);
    } else {
      localStorage.removeItem('filtro-estadisticas');
    }

    this.dataShow = this.allData.find((t:any) => t._id == tarjeta);
    // console.log(this.dataShow);
    this.mostrarDetallesCategoria = false;
    this.mostrarDatos();
  }

  prevResumen(indice:number){
    indice++;

    let newResumen = this.dataShow.resumenes.find((r:any) => r.indice == indice);
    this.resumenActual = newResumen;
    this.chartRender();
  }
  nextResumen(indice:number){
    indice--;

    let newResumen = this.dataShow.resumenes.find((r:any) => r.indice == indice);
    this.resumenActual = newResumen;
    this.chartRender();
  }

  /** CHART */
  data: any;
  options:any;
  plugins:any;

  // colores: string[] = [
  //   '#42A5F5',
  //   '#EC407A',
  //   '#26A69A',
  //   '#FF9F40',
  //   '#7E57C2',
  //   '#FFCA28',
  //   '#C9CBCF',
  //   '#AB47BC',
  //   '#66BB6A',
  // ]

  // colores: string[] = [
  //   '#36A2EB',
  //   '#FF6384',
  //   '#4BC0C0',
  //   '#FF9F40',
  //   '#9966FF',
  //   '#FFCD56',
  //   '#C9CBCF'
  // ]
  
  chartRender(){
    
    if(!this.resumenActual){
      return;
    }

    let strLabels:string[] = [];
    let numData:number[] = [];
    let codColor:string[] = [];
    let total:number = 0;

    
    // TODO: APLICAR RECARGO CATAR A GASTOS
    let impuestos = 1+this.imp_rg4815+this.imp_pais;
    if((this.resumenActual.montoDolares + this.resumenActual.montoEuros) >= 300){
      impuestos += this.imp_catar;
    }
    // console.log(this.resumenActual)
    // console.log(impuestos)
    this.resumenActual.acumuladores.forEach((acum:any) => {
      
      let montoTotal = 0;
      if(this.resumenActual.tarjeta.debito){
        // montoTotal = acum.montoPesos+Math.round(acum.montoDolares*impuestos)+Math.round(acum.montoEuros*impuestos);
        montoTotal = acum.montoPesos+Math.round(acum.montoDolares)+Math.round(acum.montoEuros);
      } else {
        montoTotal = acum.montoPesos
                    +Math.round(acum.montoDolares*this.resumenActual.cotizacion_d*impuestos)
                    +Math.round(acum.montoEuros*this.resumenActual.cotizacion_e*impuestos);
      }

      strLabels.push(acum.categoria);
      numData.push(montoTotal);
      codColor.push(acum.color);
      // total += (acum.valor+)
      total += montoTotal
      acum.valor = montoTotal
    })

    this.resumenActual.acumuladores.sort((a:any,b:any) => {
      if(a.valor > b.valor){
        return -1;
      } else if(a.valor < b.valor){
        return 1;
      }

      return 0;
    })
    
    this.data = {
      labels: strLabels,
      datasets: [
          {
            label: '$ '+new Intl.NumberFormat('es-AR', { style: 'decimal', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(total),
            data: numData,
            backgroundColor: codColor,
            cutout: '60%' //ancho de la dona
            
          }
      ]
    }

    const innerOuterLabels = {
      id: 'innerOuterLabels',
      beforeDraw(chart:any,args:any,pluginOptions:any){
        const { ctx,data,chartArea: {top,bottom,left,right,width,height} } = chart;

        ctx.save();

        labels(0, width/2, height/2 +top);
        function labels(datasetIndex:number,x:number,y:number){
          ctx.font = 'bolder 30px sans-serif';
          ctx.fillStyle = '#666';
          ctx.textAlign = 'center';
          ctx.fillText(data.datasets[datasetIndex].label,x,y);
          // ctx.fillText('asdasda',x,y);
        }

      }
    }

    
    this.plugins = [innerOuterLabels];
  
    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      events: ['click'],
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          
          callbacks: {
            label: function(context:any) {
              let label = ' $ ';
              if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('es-AR', { style: 'decimal', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(context.parsed);
              }

              return label;
            }
          }
        },
        title: {
          display: false,
        }
      }
    };
  }

  mostrarDetallesCategoria:boolean = false;
  gastosPorCategoria:any[] = [];
  categoriaSel:any = {};

  agregarGastoACategoria(categoria:string){
    this.mostrarDetallesCategoria = true;
    this.categoriaSel = this.resumenActual.acumuladores.find((acum:any) => acum.id == categoria);
    // console.log(this.categoriaSel);
    // 

    if(!this.dataShow.debito){
      this.gastosPorCategoria = this.resumenActual.cuotas.filter((c:any) => c.gasto.categoria == categoria);
    } else {
      this.gastosPorCategoria = this.resumenActual.cuotas.filter((c:any) => c.categoria == categoria);
    }

    // console.log(this.tarjetaSel);
    this.gastosPorCategoria.sort((a:any,b:any) => {
      if(a.fecha > b.fecha) return -1;
      if(a.fecha < b.fecha) return 1;
      return 0
    })
    
    
  }

  reload:boolean = false;
  actualizar(){
    this.reload = true;
    this._aux.actualizarSocket();
    this._aux.updateAll();
  }

}
