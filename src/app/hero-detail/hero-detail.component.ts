
import { Component, OnInit, Input,  EventEmitter, Output, Inject } from '@angular/core';



import './hero-detail.component.css'

@Component({
  selector: 'abc',
  templateUrl: './hero-detail.component.html',
  styles: ['./hero-detail.component.css']
})
export class HeroDetailComponent {

  @Input()
  nameForName: string;

  @Output() deleted = new EventEmitter<string>();




  constructor() {

  }
}



