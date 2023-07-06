import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { NotificacionesService } from 'src/app/services/notificaciones.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
  ]
})
export class LoginComponent implements OnInit {
  

  loginForm: FormGroup = this.fb.group({
    email: ['',[Validators.required,Validators.pattern(this.auth.emailPattern)]],
    password: ['',Validators.required]
  })

  constructor(private fb:FormBuilder, 
              private auth:AuthService,
              private router:Router,
              private notificacion:NotificacionesService) { }
  
  process:boolean = false;
  ngOnInit(): void {
    // console.log('asdasd');
    
    // this.loginForm.reset({
    //   email: 'pablo@pablo.com',
    //   password: '123456'
    // })
  }
  
  login(){
    
    if(this.loginForm.invalid){
      this.loginForm.markAllAsTouched();
      return;
    }

    this.process = true;
    const { email, password } = this.loginForm.value;

    const body:any = { email, password }


    this.auth.login(body)
        .subscribe(resp => {
          this.process = false;
          if(resp.status === false){
            if(resp.statusCode == 0){
              this.notificacion.toastr('error','Error de conexión','La base de datos puede estar fuera de linea momentáneamente');
            } else {
              this.notificacion.toastr('error',resp.msg,'');
            }
            return;
          }

          this.notificacion.toastr('success',`Bienvenido/a nuevamente ${this.auth.usuario.nombre}!`,'')
          this.router.navigateByUrl('/user/estadisticas')
          // this.router.navigateByUrl('/user/tarjetas')

        })
  }
    
  

  get emailErrorMsg():string{
    const errors = this.loginForm.get('email')?.errors;
    if(errors){
      if(errors['required']){
        return 'Ingresa tu correo';
      } else if(errors['pattern']){
        return 'Correo no válido';
      } 
    }
    return '';
  }

  campoValido(campo:string){
    return this.loginForm.controls[campo]?.errors
          && this.loginForm.controls[campo]?.touched;
  }

  toLowerCase(campo:string){
    const value:string = this.loginForm.controls[campo].value;
    const newValue = value.toLowerCase();
    this.loginForm.controls[campo].setValue(newValue);
  }


}
