import { downgradeComponent } from '@angular/upgrade/static'; declare var angular: angular.IAngularStatic;
import { Component, OnInit, Input,  EventEmitter, Output } from '@angular/core';


import moduleName from '../../../index';
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


    onDelete() {
      console.log('hey I am  clicked in child');
      debugger
      this.deleted.emit("Hi");
  }


  constructor() {

  }
}



angular.module(moduleName)
    .directive('abc', downgradeComponent({component: HeroDetailComponent}) as angular.IDirectiveFactory);