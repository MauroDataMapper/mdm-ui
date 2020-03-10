import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: "element-icon",
  templateUrl: './element-icon.component.html',
  styleUrls: ['./element-icon.component.sass']
})
export class ElementIconComponent implements OnInit {
  @Input() element: any;

  constructor() {}

  ngOnInit() {}
}
