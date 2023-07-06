import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styles: [
    `
    :host ::ng-deep .loading{
      text-align:center;
      width: 100%;
      position: absolute;
      top:45%;
      color:#FFF;
      font-size:30px;
      font-weight:bold;
      font-family: 'Play', sans-serif;
    }


    `
  ]
})
export class Error404Component implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
