import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: "multiplicity",
  templateUrl: './multiplicity.component.html',
  styleUrls: ['./multiplicity.component.sass']
})
export class MultiplicityComponent implements OnInit {
  @Input() min: any;
  @Input() max: any;

  constructor() {}

  ngOnInit() {}
}
