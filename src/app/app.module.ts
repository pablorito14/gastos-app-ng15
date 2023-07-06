import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';

import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-AR';
registerLocaleData(localeEs);

import moment from 'moment';
moment.locale('es');

import { ScrollTopModule } from 'primeng/scrolltop';
import {SidebarModule} from 'primeng/sidebar';
import { MainComponent } from './shared/main/main.component';
import { ButtonModule } from 'primeng/button';
import { TarjetasPipe } from './pipes/tarjetas.pipe';

import { SocketIoModule,SocketIoConfig } from 'ngx-socket-io';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
const config:SocketIoConfig = { 
  url: environment.socketUrl, 
  options: {
    transports: ['websocket', 'polling', 'flashsocket']
  }
};

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    ToastrModule.forRoot(),
    SocketIoModule.forRoot(config),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ButtonModule,
    ScrollTopModule,
    SidebarModule,
    BlockUIModule,
    ProgressSpinnerModule,
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'es-ar'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
