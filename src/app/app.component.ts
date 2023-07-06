import { Component, HostListener, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { PrimeNGConfig } from 'primeng/api';
import { SwUpdate } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'gastos-frontend';

  online:boolean = true;

  constructor(private config: PrimeNGConfig, private toastr:ToastrService, private update:SwUpdate) {

      if(!navigator.onLine){
        this.toastr.info(
          'Algunas funciones pueden no estar disponibles',
          'Sin conexión a internet',
          {
            enableHtml:true,
            disableTimeOut: true,
            // timeOut: 5000,
            closeButton:true,
            positionClass: 'toast-top-full-width'
          })
      }
  
  
      window.addEventListener('offline', (e) => { 
        // this.online=false;
        this.toastr.clear();
        this.toastr.info(
            'Algunas funciones pueden no estar disponibles',
            'Sin conexión a internet',
            {
              enableHtml:true,
              disableTimeOut: true,
              // timeOut: 5000,
              closeButton:true,
              positionClass: 'toast-top-full-width'
            })
            
      });
      
      
      window.addEventListener('online', (e) => { 
        // this.online=true;
        this.toastr.clear();
        this.toastr.success(
          '',
          'Conexión recuperada',
          {
            enableHtml:true,
            timeOut: 5000,
            closeButton:true,
            positionClass: 'toast-top-center'
          })
      });
      this.updateClient();

    }
  ngOnInit(): void {
    this.config.setTranslation({
      firstDayOfWeek: 1,
      dayNames: [ "domingo","lunes","martes","miércoles","jueves","viernes","sábado" ],
      dayNamesShort: [ "dom","lun","mar","mié","jue","vie","sáb" ],
      dayNamesMin: [ "Do","Lu","Ma","Mi","Ju","Vi","Sa" ],
      monthNames: [ "enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre" ],
      monthNamesShort: [ "ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic" ],
      today: 'Hoy',
      clear: 'Borrar', 
      emptyMessage: 'Aún no hay datos'
    });

    this.pwaDisponible();
  }

  updateClient(){

    if(!this.update.isEnabled){
      return;
    }

    this.update.versionUpdates.subscribe((event:any) => {
      
      // localStorage.setItem('checkingUpdate','false');
      if(event.type === "VERSION_READY"){

        Swal.fire({
          title: `Nueva version disponible`,
          html: '¿Queres actualizar? <br>Podés ver los cambios en la pestaña "Acerca de"',
          icon: 'info',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          showCancelButton: true,
          confirmButtonText: 'Actualizar',
          cancelButtonText: 'Cancelar',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.update.activateUpdate().then(() => location.reload());
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire(
              'Actualización cancelada',
              'No recibirás notificación hasta la proxima actualización',
              'error'
            )
          }
        })
      
        
        

      }
    });


  }

  /** ofrecer la instalacion de pwa en iOS */
  pwaDisponible(){
    const userAgent = window.navigator.userAgent.toLowerCase();
    // console.log(window.navigator);
    
    const standalone = ('standalone' in window.navigator) && (window.navigator as any).standalone; 
    // standalone valida solo para iOS y se esta usando pwa // true = pwa - false = navegador

    const isIos = userAgent.includes('iphone') || userAgent.includes('ipod') || userAgent.includes('ipad')
    const mostrarPwa = JSON.parse(localStorage.getItem('msg-pwa')!);
    // console.log(mostrarPwa);
    
    // alert(`iOS: ${isIos} - standalone: ${standalone}`);

    if(isIos && !standalone && !mostrarPwa){
      const titulo = '¡Descargá la app en tu iPhone o iPad!';
      const mensaje = 'Tocá en <i class="fa-solid fa-arrow-up-from-bracket"></i> y después en agregar al inicio';
      // const toastrOption = {
      //   enableHtml:true,
      //   disableTimeOut: true,
      //   // timeOut: 5000,
      //   closeButton:false,
      //   positionClass: 'toast-bottom-full-width'
      // }

      Swal.fire({
        title: titulo,
        html: mensaje,
        icon: 'info',
        showCloseButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'No volver a mostrar',
      }).then((result) => {
        if (result.isConfirmed) {
  
          this.noMostrar();
        
        }
      })

      // this.toastr.info(mensaje,titulo,toastrOption);
    }
  }
  /** ofrecer la instalacion de pwa en iOS */

  noMostrar(){
    localStorage.setItem('msg-pwa', JSON.stringify(true));
    
  }


  /** ofrecer pwa en android/pc */
  deferredPrompt: any;
  // showButton = false;
 
  @HostListener('window:beforeinstallprompt', ['$event'])

  onbeforeinstallprompt(e:any) {

    // alert('onBeforeInstallPrompt')
    // console.log(e);
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    const mostrarPwa = JSON.parse(localStorage.getItem('msg-pwa')!);

    if(!mostrarPwa){
      Swal.fire({
        title: 'Aplicación disponible',
        html: `¿Querés instalar la app en tu dispositivo?`,
        icon: 'info',
        confirmButtonColor: '#3085d6',
        denyButtonColor: '#d33',
        showCloseButton: true,
        showDenyButton: true,
        confirmButtonText: 'Instalar',
        denyButtonText: 'No volver a mostrar',

      }).then((result) => {
        if (result.isConfirmed) {
          this.addToHomeScreen();
        } else if (result.isDenied) {
          this.noMostrar();
        }
      })
    }
    
  }


  addToHomeScreen() {
    // hide our user interface that shows our A2HS button
    // this.showButton = false;
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
      .then((choiceResult:any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        this.deferredPrompt = null;
      });
  }
  /** ofrecer pwa en android/pc */
}
