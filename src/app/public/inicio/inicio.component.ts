import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styles: [
  ]
})
export class InicioComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {
    if(localStorage.getItem('token')){
      this.router.navigateByUrl('/user/estadisticas');
    } else {
      this.router.navigateByUrl('/auth/login');
    }
  }

}
