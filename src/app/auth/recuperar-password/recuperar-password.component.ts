import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import Swal from 'sweetalert2';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.component.html',
  styles: [
  ]
})
export class RecuperarPasswordComponent implements OnInit {

  process:boolean = false;

  recuperarForm:FormGroup = this.fb.group({
    email: ['',[Validators.required,Validators.pattern(this.auth.emailPattern)]]
  })

  constructor(private fb: FormBuilder,
              // private router:Router,
              private auth:AuthService,
              private notificacion:NotificacionesService) { }

  ngOnInit(): void {
    
  }

  recuperar(){
    if(this.recuperarForm.invalid){
      this.recuperarForm.markAllAsTouched();
      return;
    }

    this.process = true;
    const { email } = this.recuperarForm.value;

    const body:any = { email }


    this.auth.recuperar(body)
        .subscribe(resp => {
          
          this.process = false;
          if(resp.status === false){
            this.notificacion.toastr('error',resp.msg,'');
            return;
          }

          Swal.fire('Recuperación de contraseña',`Te enviamos un correo para que puedas resetar tu contraseña.<br><br> En caso de no ver ese correo, 
                          es posible que haya sido filtrado como SPAM o Correo no deseado.`,'success')
          this.recuperarForm.reset();
          this.auth.logout();
          // this.notificacion.toastr('success','Revisa tu correo','Te enviamos un link para recuperar tu cuenta')

        })
  }
    
  

  get emailErrorMsg():string{
    const errors = this.recuperarForm.get('email')?.errors;
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
    return this.recuperarForm.controls[campo]?.errors
          && this.recuperarForm.controls[campo]?.touched;
  }

  toLowerCase(campo:string){
    const value:string = this.recuperarForm.controls[campo].value;
    const newValue = value.toLowerCase();
    this.recuperarForm.controls[campo].setValue(newValue);
  }

}
