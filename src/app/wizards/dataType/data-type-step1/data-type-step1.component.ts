import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-type-step1',
  templateUrl: './data-type-step1.component.html',
  styleUrls: ['./data-type-step1.component.sass']
})
export class DataTypeStep1Component implements OnInit {
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

  ngOnInit() {
    this.model = this.step.scope.model;
  }

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
      this.model.copyFromDataModel.length === 0
    ) {
      this.step.invalid = true;
      return;
    }

    this.step.invalid = false;
  };

  selectCreateType = createType => {
    this.model.createType = createType;
  };

  //TODO CORRECT
  onSelect = () => {};

  loadHelp = () => {
    //TODO
  };
}
