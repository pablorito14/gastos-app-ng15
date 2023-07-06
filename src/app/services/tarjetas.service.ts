import { Injectable } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of, Observable, mergeMap } from 'rxjs';
import { Tarjeta } from '../interfaces/tarjeta.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { DataCacheService } from './data-cache.service';
import { Socket } from 'ngx-socket-io';



@Injectable({
  providedIn: 'root'
})
export class TarjetasService {
  apiUrl:string = `${environment.apiUrl}`;


  constructor(private auth:AuthService,
              private _cache:DataCacheService,
              private http:HttpClient,
              private socket:Socket) { }

  
  
  getTarjetas(){
    const url: string = `${this.apiUrl}/tarjeta`;
    const token: string = localStorage.getItem('token') || '';
    
    const options = {
      headers: new HttpHeaders().set('x-token',token),
      params: { uid: this.auth.usuario.uid }
    }

    return this.http.get(url, options )
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      return resp.tarjetas
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
  }

  /** CACHE TARJETAS */
  getCacheTarjetas(){
    this._cache.uid = this.auth.usuario.uid;

    return this._cache.getTarjetas$();
  }

  updateCacheTarjetas(){
    this._cache.updateTarjetas();
  }
  
  /** CACHE TARJETAS */
  
  addTarjeta(body:any){
    const url: string = `${this.apiUrl}/tarjeta`;
    const token: string = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({'x-token':token});

    body = {uid: this.auth.usuario.uid, ...body};
    
    return this.http.post(url,body,{headers})
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      return resp.msg
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
    

  }

  updateTarjeta(id:string,body:any){
    const url: string = `${this.apiUrl}/tarjeta`;
    const token: string = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({'x-token':token});

    body = {uid: this.auth.usuario.uid,id, ...body};
    
    return this.http.put(url,body,{headers})
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      return resp.msg
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
    
  }

  expiredTarjeta(id:string){
    const url: string = `${this.apiUrl}/tarjeta`;
    const token: string = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({'x-token':token});

    const options = {
      headers: new HttpHeaders({'x-token':token}),
      body: {
        uid: this.auth.usuario.uid,
        id
      }
    }

    return this.http.delete(url,options)
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      return resp.msg
                    }
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                )
  }

  /** SOCKET */
  actualizarSocket(){
    
    this.socket.emit('updated',{uid: this.auth.usuario.uid});
  }

  escucharSocket(){
    return this.socket.fromEvent('updateData').pipe(
      map((resp:any) => {
        // console.log('se actualizo una tarjeta, actualizar todos los datos')
        this._cache.updateAll();
        return resp
      }),
      catchError(err => of(false))
    )
  }
}
