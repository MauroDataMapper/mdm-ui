import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-element-step1',
  templateUrl: './data-element-step1.component.html',
  styleUrls: ['./data-element-step1.component.sass']
})
export class DataElementStep1Component implements OnInit {
  step: any;
  model: any;

  constructor() {}

  ngOnInit() {
    this.model = this.step.scope.model;
  }
  onSelect = dataClass => {
    this.model.selectedDataElements = [];
  }

  selectCreateType = createType => {
    this.model.createType = createType;
  }
}
