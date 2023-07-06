import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { DataCacheService } from '../services/data-cache.service';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl:string = `${environment.apiUrl}/auth`;
  public nombreApellidoPattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';

  public emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$";
  
  constructor(private http:HttpClient,
              private _cache:DataCacheService,
              private socket:Socket) { }

  private _usuario!: any;
  get usuario(){
    return  {...this._usuario};
  }

  registro(body:any){
    const url = `${this.apiUrl}/new`;

    return this.http.post(url, body)
                .pipe(
                  map((resp:any) => {
                    if(resp.ok){
                      return resp.uid;
                    }
                  }),
                  catchError(err => of({status:false,msg:err.error.msg}))
                )

  }

  enviarMailActivacion(id:string){

    const url = `${this.apiUrl}/enviar-confirmacion`;
    const params = {
      params : {id}
    }

    return this.http.get(url,params)
                .pipe(
                  map((resp:any) => {
                    return of({status:true})
                  }),
                  catchError(err => of({status:false,msg: err.error.msg}))

                )
  }

  activarCuenta(id:string): Observable<any>{
    const url = `${this.apiUrl}/activar-cuenta`;
    const params = {
      params: {id}
    }
    return this.http.get(url,params)
                    .pipe(
                      map( (resp:any) => {
                        // if(resp.ok){
                          return of({status: true});
                        // } 
                      }),
                      catchError(err => of({status:false,msg:err.error.msg}))
                    );
        
  }

  login(body:any){
    
    const url = `${this.apiUrl}/login`;

    return this.http.post(url, body)
                .pipe(
                  tap((resp:any) => {
                    localStorage.setItem('token',resp.token!);
                  }), 
                  // map( resp => resp.ok ),
                  map( (resp:any) => {
                    localStorage.setItem('token', resp.token!);
                    // console.log(resp);
                    
                    this._usuario = {
                      uid: resp.uid!,
                      nombre: resp.nombre!,
                      email: resp.email!
                    }
  
                    if(resp.isAdmin){
                      this._usuario.isAdmin = true;
                      localStorage.setItem('isAdmin','true');
                    }
                    
                    return resp.ok;
                  }),
                  catchError(err => of({status:false, msg: (err.error.msg || err.name), statusCode: err.status}))
                );
  }

  recuperar(body:any){
    const url = `${this.apiUrl}/recuperar`;

    return this.http.post(url, body)
                .pipe(
                  map( (resp:any) => {
                    if(resp.ok){
                      return resp.ok;
                    }
                    
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                );
  }

  resetear(body:any, token:string){
    const url = `${this.apiUrl}/resetear`;
    // const body= { email, password };
    // return of({status:false});
    // const token: string = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({'x-token': token});

    return this.http.post(url, body, {headers})
                .pipe(
                  map( (resp:any) => {
                    if(resp.ok){
                      return resp.ok;
                    }
                    
                  }),
                  catchError(err => of({status:false, msg: err.error.msg}))
                );
  }

  validarToken(){


    const url = `${this.apiUrl}/renew`;
    const token = localStorage.getItem('token') || '';
    
    const headers = new HttpHeaders().set('x-token', token );
    
    return this.http.get(url, {headers})
              .pipe(
                map( (resp:any) => {
                  localStorage.setItem('token', resp.token!);
                  
                  this._usuario = {
                    uid: resp.uid!,
                    nombre: resp.nombre!,
                    email: resp.email!
                  }

                  this.socket.emit('connected',{uid: this._usuario.uid});
                  
                 

                  if(resp.isAdmin){
                    this._usuario.isAdmin = true;
                    localStorage.setItem('isAdmin','true');
                  }

                  return resp.ok;
                }),
                catchError(err => of({status: false, msg: err.name, statusCode: err.status}))
              )
  }

  // validarCaducidadToken(){
  //   const url = `${this.apiUrl}/authrenew`;
  //   const token = localStorage.getItem('token') || '';
  //   const headers = new HttpHeaders().set('x-token', token );

  //   return this.http.get(url, {headers})
  //             .pipe(
  //               map( resp => {
  //                 return resp.ok;
  //               }),
  //               catchError(err => of({status: err.status,valid: false}))
  //             )
  // }

  logout(){
    this._cache.clearCache();
    // this._cache.updateCache();
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');

    this._usuario = {}
  }
}
