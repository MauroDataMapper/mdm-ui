/*
Copyright 2020 University of Oxford

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import {Component, OnInit, Input, Output, EventEmitter,  ViewChild, AfterViewInit} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ElementTypesService } from '@mdm/services/element-types.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'mdm-data-type-inline',
  templateUrl: './new-data-type-inline.component.html',
  styleUrls: ['./new-data-type-inline.component.sass']
})
export class NewDataTypeInlineComponent implements OnInit,  AfterViewInit {
  @Output() validationStatusEvent = new EventEmitter<string>();

  @Input() parentDataModel;
  @Input() showParentDataModel = false;
  @Input() showClassification = false;
  formDataTypeChangesSubscription: Subscription;
  @ViewChild('myFormNewDataType', {static: false}) myFormNewDataType: NgForm;
  @Input() model: any = {
    label: '',
    description: '',
    domainType: '',
    referencedDataClass: '',
    referencedTerminology: ''
  };

  childDataClasses: any; // TODO - FIGURE OUT IF NEEDED

  @Input() parentScopeHandler;
  allDataTypes;
  isValid = false;
  reloading = false;
  terminologies: any;

  constructor(
    private resourceService: MdmResourcesService,
    private elementTypes: ElementTypesService
  ) {
    this.allDataTypes = this.elementTypes.getAllDataTypesArray();
    if (this.allDataTypes) { this.model.domainType = this.allDataTypes[0]; }
    this.loadTerminologies();
  }

  sendValidationStatus() {
    this.validationStatusEvent.emit(String(!this.isValid));
  }

  ngOnInit() {
    this.validate();
    if (this.parentScopeHandler) {
      this.parentScopeHandler.$broadcast('newDataTypeInlineUpdated', {
        model: this.model,
        isValid: this.isValid
      });
    }
  }

  ngAfterViewInit() {
    this.formDataTypeChangesSubscription = this.myFormNewDataType.form.valueChanges.subscribe(
      x => {
        this.validate(x);
      }
    );
  }

  onTypeSelect() {
    if (this.model.domainType !== 'TerminologyType') {
      this.model.referencedTerminology.id = '';
    }

    this.validate();
  }
  validate(newValue?) {
    let isValid = true;
    if (newValue !== undefined) {
      this.model.label = newValue.label;
      this.model.domainType = newValue.dataModelType;
      }
    if (!this.model.label || this.model.label.trim().length === 0) {
      isValid = false;
    }
    // Check if for EnumerationType, at least one value is added
    if (
      this.model.domainType === 'EnumerationType' &&
      this.model.enumerationValues.length === 0
    ) {
      isValid = false;
    }
    // Check if for ReferenceType, the dataClass is selected
    if (
      this.model.domainType === 'ReferenceType' &&
      (!this.model.referencedDataClass || this.model.referencedDataClass.id === '')
    ) {
      isValid = false;
    }

    if (
      this.model.domainType === 'Primitive' ) {
      isValid = true;
    }

    // Check if for TerminologyType, the terminology is selected
    if (
      this.model.domainType === 'TerminologyType' &&
      (!this.model.referencedTerminology ||
        this.model.referencedTerminology.id === '')
    ) {
      isValid = false;
    }

    this.isValid = isValid;

    this.sendValidationStatus();
  }

  onDataClassSelect = dataClasses => {
    if (dataClasses && dataClasses.length > 0) {
      this.model.referencedDataClass = dataClasses[0];
    } else {
      this.model.referencedDataClass = null;
    }

    this.validate();
    this.sendValidationStatus();
  };

  loadTerminologies() {
    this.reloading = true;
    this.resourceService.terminology.list()
    // this.resourceService.terminology.get(null, null, null)
      .subscribe(
      data => {
        this.terminologies = data.body.items;
        this.reloading = false;
      },
      function() {
        this.reloading = false;
      }
    );
  }

  onTerminologySelect(terminology: any, record: any) {
    this.model.referencedTerminology = terminology;
    this.model.terminology = terminology;
    this.validate();
    this.sendValidationStatus();
  }

  onEnumListUpdated = newEnumList => {
    this.model.enumerationValues = newEnumList;
    this.validate();
    this.sendValidationStatus();
  }
}
