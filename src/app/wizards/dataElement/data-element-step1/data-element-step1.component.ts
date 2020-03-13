import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-element-step1',
  templateUrl: './data-element-step1.component.html',
  styleUrls: ['./data-element-step1.component.sass']
})
export class DataElementStep1Component implements OnInit {
  step: any;
  modelVal: any;
  get model() {
    return this.modelVal;
  }

  set model(val) {
    this.modelVal = val;
    this.validate();
  }

  constructor() {}

  ngDoCheck() {
    this.validate();
  }

  validate = () => {
    if (!this.model.createType) {
      this.step.invalid = true;
      return;
    }

    if (
      this.model.createType === 'copy' &&
      this.model.copyFromDataClass.length === 0
    ) {
      this.step.invalid = true;
      return;
    }

    this.step.invalid = false;
  };

  ngOnInit() {
    this.model = this.step.scope.model;
  }
  onSelect = dataClass => {
    this.model.selectedDataElements = [];
  };

  selectCreateType = createType => {
    this.model.createType = createType;
  }
}
