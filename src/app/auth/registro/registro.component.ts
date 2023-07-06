import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { NotificacionesService } from '../../services/notificaciones.service';
import { AuthService } from '../auth.service';
import { TitleCasePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styles: [
  ]
})
export class RegistroComponent implements OnInit {

  process:boolean = false;

  registroForm:FormGroup = this.fb.group({
    nombre: ['',Validators.required],
    email: ['',[Validators.required,Validators.pattern(this.auth.emailPattern)]],
    emailConf: ['',Validators.required],
    password: ['',[Validators.required,Validators.minLength(6)]],
    passwordConf: ['',Validators.required]
  },{
    validators: [
      this.camposIguales('email','emailConf'),
      this.camposIguales('password','passwordConf'),
    ]
  })
  constructor(private fb:FormBuilder,
              private notificacion:NotificacionesService,
              private auth:AuthService) { }

  ngOnInit(): void {
    
    
    // this.registroForm.reset({
    //   nombre: 'pablo',
    //   email: 'pablo@pablo.com',
    //   emailConf:'pablo@pablo.com',
    //   password: '123456',
    //   passwordConf:'123456'
    // })
  }
  titleCasePipe: TitleCasePipe = new TitleCasePipe();
  titleCase(){
    const nombre = this.registroForm.controls['nombre'].value;
    const nombreTitle = this.titleCasePipe.transform(nombre);

    this.registroForm.controls['nombre'].setValue(nombreTitle);
  }

  registro(){

    if(this.registroForm.invalid){
      this.registroForm.markAllAsTouched();
      return;
    }

    this.process = true;
    const { nombre, email, password } = this.registroForm.value;

    const body:any = { nombre, email, password }

    this.auth.registro(body)
        .subscribe(resp => {
          
          if(resp.status === false){
            this.notificacion.toastr('error',resp.msg,'');
            this.process = false;
            return;
          }

          // this.notificacion.toastr('success','Cuenta creada','HABILITAR ENVIO DE CORREO');
          this.auth.enviarMailActivacion(resp)
              .subscribe(resp => {
                this.process = false;

                // this.notificacion.toastr('success','Cuenta creada','Por favor confirma tu correo');

                Swal.fire('Cuenta creada',`Te enviamos un correo para que confirmes tu cuenta.<br><br> En caso de no ver ese correo, 
                          es posible que haya sido filtrado como SPAM o Correo no deseado.`,'success')
                this.registroForm.reset();
              })

          
        })
  }

  get emailErrorMsg():string{
    const errors = this.registroForm.get('email')?.errors;
    
    if(errors){
      if(errors['required']){
        return 'Ingrese su correo';
      } else if(errors['pattern']){
        return 'Correo no válido';
      } 
    }
    return '';
  }

  get confirmEmailErrorMsg():string{
    const errors = this.registroForm.get('emailConf')?.errors;
    if(errors){
      if(errors['required']){
        return 'Ingrese su correo';
      } else if(errors['pattern']){
        return 'Correo no válido';
      } else if(errors['noIguales']){
        return 'Correos diferentes';
      }
    }
    
    return ''
  }

  get passErrorMsg():string{
    const errors = this.registroForm.get('password')?.errors;
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
    const errors = this.registroForm.get('passwordConf')?.errors;
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
    const value:string = this.registroForm.controls[campo].value;
    const newValue = value.toLowerCase();
    this.registroForm.controls[campo].setValue(newValue);
  }

  campoValido(campo:string){
    return this.registroForm.controls[campo]?.errors
          && this.registroForm.controls[campo]?.touched;
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
