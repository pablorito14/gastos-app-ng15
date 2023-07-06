import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-auth',
  templateUrl: './main-auth.component.html',
  styleUrls: ['./main-auth.component.css']
})
export class MainAuthComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit(): void {

    if(localStorage.getItem('token')){
      this.router.navigateByUrl('/user/estadisticas');
      
    }
  }


}
