/*
Copyright 2020-2023 University of Oxford and NHS England

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
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  CatalogueItemDomainType,
  CodeSet,
  CodeSetIndexResponse,
  DataType,
  ReferenceDataModel,
  ReferenceDataModelIndexResponse,
  Terminology,
  TerminologyIndexResponse
} from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-data-type-inline',
  templateUrl: './new-data-type-inline.component.html',
  styleUrls: ['./new-data-type-inline.component.sass']
})
export class NewDataTypeInlineComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @Output() validationStatusEvent = new EventEmitter<string>();

  @Input() parentDataModel;
  @Input() showParentDataModel = false;
  @Input() showClassification = false;
  @Input() showLabelAndDescription = false;

  @ViewChild('myFormNewDataType', { static: false }) myFormNewDataType: NgForm;
  @Input() model: DataType = {
    label: '',
    description: '',
    domainType: CatalogueItemDomainType.PrimitiveType,
    model: '',
    breadcrumbs: [],
    classifiers: [],
    modelResourceId: '',
    modelResourceDomainType: null,
    enumerationValues: [],
    referenceClass: null
  };

  @Input() parentScopeHandler;
  formDataTypeChangesSubscription: Subscription;
  allDataTypes;
  isValid = false;
  reloading = false;
  terminologies: Terminology[];
  codesets: CodeSet[];
  dataModels: ReferenceDataModel[];
  @Input() advanced = false;

  constructor(
    private resourceService: MdmResourcesService,
    private elementTypes: ElementTypesService
  ) {
    this.allDataTypes = this.elementTypes.getAllDataTypesArray();
    if (this.allDataTypes) {
      this.model.domainType = this.allDataTypes[0];
    }
    this.loadTerminologies();
    this.loadCodeSets();
    this.loadReferenceModels();
  }

  // Sending the negation of isValid because
  // parent component want to know if error is present
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
      (x) => {
        this.validate(x);
      }
    );
  }

  onTypeSelect() {
    if (
      this.model.domainType !== CatalogueItemDomainType.EnumerationType &&
      this.model.enumerationValues &&
      this.model.enumerationValues.length > 0
    ) {
      this.model.enumerationValues = [];
    } else if (
      this.model.domainType !== CatalogueItemDomainType.ReferenceType &&
      this.model.referenceClass
    ) {
      this.model.referenceClass = null;
    }
    this.advanced = false;
    this.validate();
  }
  validate(newValue?) {
    let isValid = true;
    if (newValue !== undefined) {
      this.model.label = newValue.label;
      this.model.domainType = newValue.dataModelType;
    }

    if (
      (!this.model.label || this.model.label.trim().length === 0) &&
      (this.model.domainType === CatalogueItemDomainType.PrimitiveType ||
        this.model.domainType === CatalogueItemDomainType.EnumerationType)
    ) {
      isValid = false;
    }
    // Check if for EnumerationType, at least one value is added
    if (
      this.model.domainType === CatalogueItemDomainType.EnumerationType &&
      (!this.model.enumerationValues ||
        this.model.enumerationValues.length === 0)
    ) {
      isValid = false;
    }
    // Check if for ReferenceType, the dataClass is selected
    if (
      this.model.domainType === CatalogueItemDomainType.ReferenceType &&
      (!this.model.referenceClass || this.model.referenceClass.id === '')
    ) {
      isValid = false;
    }
    // Check if for TerminologyType, the terminology is selected
    if (
      this.model.domainType === CatalogueItemDomainType.TerminologyType &&
      !this.model.modelResourceId
    ) {
      isValid = false;
    }

    if (
      this.model.domainType === CatalogueItemDomainType.CodeSet &&
      !this.model.modelResourceId
    ) {
      isValid = false;
    }

    if (
      this.model.domainType ===
        CatalogueItemDomainType.ReferenceDataModelType &&
      !this.model.modelResourceId
    ) {
      isValid = false;
    }

    this.isValid = isValid;
    this.sendValidationStatus();
  }

  onDataClassSelect = (dataClasses) => {
    if (dataClasses && dataClasses.length > 0) {
      this.model.referenceClass = dataClasses[0];
    } else {
      this.model.referenceClass = null;
    }

    this.validate();
    this.sendValidationStatus();
  };

  loadTerminologies() {
    this.reloading = true;
    this.resourceService.terminology.list({ all: true }).subscribe(
      (data: TerminologyIndexResponse) => {
        this.terminologies = data.body.items.sort((a, b) =>
          a.label.localeCompare(b.label)
        );
        this.reloading = false;
      },
      () => {
        this.reloading = false;
      }
    );
  }

  modelDataTypeSelected(value: any) {
    this.model.modelResourceId = value.id;
    this.model.modelResourceDomainType = value.domainType;

    this.validate();
    this.sendValidationStatus();
  }

  loadCodeSets() {
    this.reloading = true;
    this.resourceService.codeSet.list({ all: true }).subscribe(
      (data: CodeSetIndexResponse) => {
        this.codesets = data.body.items.sort((a, b) =>
          a.label.localeCompare(b.label)
        );
        this.reloading = false;
      },
      () => {
        this.reloading = false;
      }
    );
  }

  loadReferenceModels() {
    this.reloading = true;
    this.resourceService.referenceDataModel.list({ all: true }).subscribe(
      (data: ReferenceDataModelIndexResponse) => {
        this.dataModels = data.body.items.sort((a, b) =>
          a.label.localeCompare(b.label)
        );
        this.reloading = false;
      },
      () => {
        this.reloading = false;
      }
    );
  }

  onEnumListUpdated = (newEnumList) => {
    this.model.enumerationValues = newEnumList;
    this.validate();
    this.sendValidationStatus();
  };

  ngOnDestroy(): void {
    this.formDataTypeChangesSubscription.unsubscribe();
  }
}
