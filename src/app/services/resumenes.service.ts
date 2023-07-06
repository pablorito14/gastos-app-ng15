import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { DataCacheService } from './data-cache.service';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ResumenesService {

  apiUrl:string = `${environment.apiUrl}`;

  constructor(private auth:AuthService,
              private _cache:DataCacheService,
              private http:HttpClient,
              private socket:Socket) { }


  /** CACHE DEBITOS */

  getCacheDebitos(){
    this._cache.uid = this.auth.usuario.uid;
    return this._cache.getDebitos$();
  }

  updateCacheDebitos(){
    this._cache.updateDebitos();
  }
  /** CACHE DEBITOS */


  /** CACHE RESUMENES */

  getCacheResumenes(){
    this._cache.uid = this.auth.usuario.uid;
    return this._cache.getResumenes$();
  }

  updateCacheResumenes(){
    this._cache.updateResumes();
  }

  /** CACHE RESUMENES */

  agregarResumen(body:any){
    const url: string = `${this.apiUrl}/resumen`;
    const token: string = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({'x-token':token});

    body = {usuario: this.auth.usuario.uid, ...body};
    
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

  updateResumen(id:string,body:any){
    const url: string = `${this.apiUrl}/resumen`;
    const token: string = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({'x-token':token});

    body = {usuario: this.auth.usuario.uid,id, ...body};
    
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

  deleteResumen(id:string,ultimo:boolean){
    const url: string = `${this.apiUrl}/resumen`;
    const token: string = localStorage.getItem('token') || '';

    // const headers = new HttpHeaders({'x-token':token});

    const options = {
      headers: new HttpHeaders({'x-token':token}),
      body: {
        usuario: this.auth.usuario.uid,
        id, ultimo
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
        // console.log('se actualizo un resumen, actualizar todos los datos')
        this._cache.updateAll();
        return resp
      }),
      catchError(err => of(false))
    )
  }
}
