import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-resetear-password',
  templateUrl: './resetear-password.component.html',
  styles: [
  ]
})
export class ResetearPasswordComponent implements OnInit {

  process:boolean = false;
  key: string = '';

  resetearForm:FormGroup = this.fb.group({
    email: ['',[Validators.required,Validators.pattern(this.auth.emailPattern)]],
    password: ['',[Validators.required,Validators.minLength(6)]],
    passwordConf: ['',Validators.required]
  },{
    validators: [
      this.camposIguales('password','passwordConf'),
    ]
  })
  constructor(private fb:FormBuilder,
              private aRoute: ActivatedRoute,
              private router: Router,
              private notificacion:NotificacionesService,
              private auth:AuthService) { }

  ngOnInit(): void {

    // if(localStorage.getItem('token')){
    //   this.router.navigateByUrl('/mi-cuenta');
      
    // }

    this.aRoute.params.subscribe(
      key => this.key = key['id']
    )
  }

  resetear(){

    if(this.resetearForm.invalid){
      this.resetearForm.markAllAsTouched();
      return;
    }

    this.process = true;
    const { email, password } = this.resetearForm.value;

    const body:any = { email, password }
    // console.log(body);
    

    this.auth.resetear(body,this.key)
        .subscribe(resp => {
          
          if(resp.status === false){
            this.notificacion.toastr('error',resp.msg,'');
            this.process = false;
            return;
          }

          this.notificacion.toastr('success','Contraseña actualizada','Ya podes iniciar sesión!');
          this.router.navigateByUrl('/auth/login');
          this.process = false;
        })
  }

  get emailErrorMsg():string{
    const errors = this.resetearForm.get('email')?.errors;
    if(errors){
      if(errors['required']){
        return 'Ingrese su correo';
      } else if(errors['pattern']){
        return 'Correo no valido';
      } 
    }
    
    return '';
  }

  get confirmEmailErrorMsg():string{
    
    
    const errors = this.resetearForm.get('emailConf')?.errors;
    if(errors){
      if(errors['required']){
        return 'Ingrese su correo';
      } else if(errors['pattern']){
        return 'Correo no valido';
      } else if(errors['noIguales']){
        return 'Correos diferentes';
      }
    }
    return ''
  }

  get passErrorMsg():string{
    const errors = this.resetearForm.get('password')?.errors;
    // console.log(errors);
    if(errors){
      if(errors['required']){
        return 'Ingresa una contraseña';
      } else if(errors['minlength']){
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    return ''
  }

  get confirmPassErrorMsg():string{
    console.log(this.resetearForm.get('passwordConf')?.errors);
    const errors = this.resetearForm.get('passwordConf')?.errors;
    if(errors){
      if(errors['required']){
        return 'Confirma tu contraseña';
      } else if(errors['noIguales']){
        return 'Contraseñas diferentes';
      }
    }
    return ''
  }

  toLowerCase(campo:string){
    const value:string = this.resetearForm.controls[campo].value;
    const newValue = value.toLowerCase();
    this.resetearForm.controls[campo].setValue(newValue);
  }

  campoValido(campo:string){
    return this.resetearForm.controls[campo]?.errors
          && this.resetearForm.controls[campo]?.touched;
  }

  camposIguales(campo1: string, campo2: string) {
    return ( formGroup: AbstractControl ): ValidationErrors | null => {

      const valor1 = formGroup.get(campo1)?.value;
      const valor2 = formGroup.get(campo2)?.value;

      if(valor1 != '' && valor2 != ''){
        if(valor1 !== valor2){
          formGroup.get(campo2)?.setErrors({ noIguales: true });
          return { noIguales: true }
        }

        formGroup.get(campo2)?.setErrors(null);
        // setErrors(null) borra todos los errores de validaciones
      }
      return null
    }
  }

}
