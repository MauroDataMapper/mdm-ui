import {Component, DoCheck, OnInit} from '@angular/core';

@Component({
  selector: 'mdm-data-element-step1',
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

  constructor() {
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
    // TODO: Work out why [(ngModel)] is not working here!
    this.model.copyFromDataClass = dataClass;
    this.model.selectedDataElements = [];
    this.validate();
  };

  selectCreateType = createType => {
    this.model.createType = createType;
    this.validate()
  }
}
