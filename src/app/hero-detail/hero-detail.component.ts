import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: "abc",
  templateUrl: './hero-detail.component.html',
  styles: ['./hero-detail.component.css']
})
export class HeroDetailComponent {
  @Input()
  nameForName: string;

  @Output() deleted = new EventEmitter<string>();

  constructor() {}
}
