import { Component, OnInit } from '@angular/core';
import versiones from '../../../../versiones-log.json';

interface Version{
  version:string;
  cambios: string[]
}

@Component({
  selector: 'app-acerca-de',
  templateUrl: './acerca-de.component.html',
  styles: [
  ]
})
export class AcercaDeComponent implements OnInit {
  versiones:Version[] = versiones.reverse();
  constructor() { }

  ngOnInit(): void {
    // console.log(versiones);
    
  }

}
