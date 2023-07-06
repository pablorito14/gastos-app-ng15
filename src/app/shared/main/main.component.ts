import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Event, Router, RoutesRecognized, ActivatedRoute, NavigationStart } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { AuthService } from 'src/app/auth/auth.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  @ViewChild('op') model:any;
  displaySideBarModal:boolean = false;
  constructor(private primengConfig: PrimeNGConfig,
              private auth: AuthService, private router:Router,
              private notificacion: NotificacionesService
    ) { 
      
      
    }
  items:MenuItem[] = [];
  isPWA:boolean = false;
  
  btnAtras:boolean = false;
  eventID: number = 0;
  
  accionGastos:string = 'Agregar';


  ngOnInit(): void {
    
    this.primengConfig.ripple = true;
   
    this.router.events.subscribe((event: Event) => {
      if(event instanceof NavigationStart){
        if(this.eventID == 0){
          this.eventID = event.id-1;
        }
        
        if(event.navigationTrigger == 'popstate' && 
            event.restoredState?.navigationId == this.eventID){
          this.btnAtras = false;
        } else {
          this.btnAtras = true;
        }
      }

      if (event instanceof NavigationEnd) {

        this.detallesResumen = false;
        if(event.url.includes('/detalles-resumen/')){
          this.detallesResumen = true;
        } else if(event.url.includes('/gastos/')){
          this.accionGastos = 'Editar';
        } else{
          this.accionGastos = 'Agregar';
        }
      }
    });
    // this.isLoggedIn();
    this.isStandalone();
    
    
  }

  detallesResumen:boolean = false;
  // showModalDialog(){
  //   this.displaySideBarModal = true
  // }

  isStandalone(){
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    const standalone = ('standalone' in window.navigator) && (window.navigator as any).standalone; 
    // standalone valida solo para iOS y se esta usando pwa // true = pwa - false = navegador

    const isIos = userAgent.includes('iphone') || userAgent.includes('ipod') || userAgent.includes('ipad')

    // alert(`iOS: ${isIos} - standalone: ${standalone}`);

    // if((isIos && standalone) || (window.matchMedia('(displaySideBar-mode: standalone)').matches)){
    if(isIos && standalone){
      this.isPWA = true;
      
    }
   
  }

  get usuario(){
    // console.log( Object.keys(this.auth.usuario).length === 0 )
    if(Object.keys(this.auth.usuario).length === 0){
      return null;
    } else {
      return this.auth.usuario;
    }
    // 
  }

  logout(){
    this.displaySideBar = false;
    // console.log(this.usuario);
    
    Swal.fire({
      title: `¡Cerrar sesión!`,
      text: `¿${this.usuario.nombre} estás seguro/a que queres salir?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.notificacion.toastr('info',`Hasta luego ${this.auth.usuario.nombre}!`,'');

        localStorage.removeItem('filtro-resumenes');
        localStorage.removeItem('filtro-debitos');
        localStorage.removeItem('filtro-estadisticas');

        this.auth.logout();
        this.router.navigateByUrl('/auth');
      }
    })

    
    // this.notificacion.toastr('info',`Hasta luego ${this.auth.usuario.nombre}!`,'');
    // this.auth.logout();
    // this.router.navigateByUrl('/auth');
    // window.location.reload();
  }

  goBack(){
    window.history.back();
    
  }

  displaySideBar:boolean = false;

  @HostListener("window:resize", [])
  private onResize() {
    this.displaySideBar = false;
    
  }

  // update(){
  //   window.location.reload();
  // }


  
}
