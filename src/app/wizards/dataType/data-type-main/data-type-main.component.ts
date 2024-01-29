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
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { Step } from '@mdm/model/stepModel';
import { DataTypeStep1Component } from '../data-type-step1/data-type-step1.component';
import { DataTypeStep2Component } from '../data-type-step2/data-type-step2.component';
import { Title } from '@angular/platform-browser';
import {
  CatalogueItemDomainType,
  DataType,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { ElementTypesService } from '@mdm/services';

@Component({
  selector: 'mdm-data-type-main',
  templateUrl: './data-type-main.component.html',
  styleUrls: ['./data-type-main.component.sass']
})
export class DataTypeMainComponent implements OnInit {
  parentDataModelId: Uuid;
  steps: Step[] = [];
  processing: boolean;
  isProcessComplete: boolean;
  model = {
    createType: 'new',
    copyFromDataModel: [],
    isValid: false,
    parent: {
      id: ''
    },
    parentDataModel: { id: '' },
    dataType: {
      label : '',
      description: '',
      organisation: '',
      domainType: CatalogueItemDomainType.PrimitiveType,
      metadata: [],
      enumerationValues: [],
      classifiers: [],
      // referencedDataType: { id: '' },
      modelResourceId: '',
      modelResourceDomainType: null,
      referenceClass: { id: '' },
    } as DataType,
    isProcessComplete: false
  };
  constructor(
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private title: Title,
    private changeRef: ChangeDetectorRef,
    private elementTypes: ElementTypesService
  ) {}

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    this.parentDataModelId = this.stateService.params.parentDataModelId;

    if (!this.parentDataModelId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    const step1 = new Step();
    step1.title = 'Add Data Type';
    step1.component = DataTypeStep1Component;
    step1.scope = this;
    step1.hasForm = true;
    step1.invalid = false;

    const step2 = new Step();
    step2.title = 'Data Type Details';
    step2.component = DataTypeStep2Component;
    step2.scope = this;
    step2.invalid = true;

    this.resources.dataModel
      .get(this.parentDataModelId)
      .subscribe((result) => {
        result.body.breadcrumbs = [];
        result.body.breadcrumbs.push(Object.assign({}, result.body));
        // this.model.parent.id = result.body.id || '';
        this.model.parent = result.body;
        this.steps.push(step1);
        this.steps.push(step2);
        this.changeRef.detectChanges();
      });

    this.title.setTitle('New Data Type');
  }

  cancelWizard() {
    this.stateHandler.GoPrevious();
  }

  save = () => {
    if (this.model.createType === 'new') {
      this.saveNewDataType();
    } else {
      this.saveCopiedDataTypes();
    }
  };

  fireChanged = (tab: any) => {
    for (let i = 0; i < this.steps.length; i++) {
      const step: Step = this.steps[i];
      if (i === tab.selectedIndex) {
        if (step.compRef) {
          if (step.compRef.instance.onLoad !== undefined) {
            step.compRef.instance.onLoad();
          }
          step.active = true;
        }
      } else {
        step.active = false;
      }
    }
  };

  saveNewDataType() {
    const domainType = this.elementTypes.isModelDataType(this.model.dataType.domainType)
      ? CatalogueItemDomainType.ModelDataType
      : this.model.dataType.domainType;

    const resource: DataType = {
      domainType,
      label: this.model.dataType.label,
      description: this.model.dataType.description,
      classifiers: this.model.dataType.classifiers.map((cls) => {
        return { id: cls.id };
      })
    };
    if (domainType === CatalogueItemDomainType.ModelDataType) {
      resource.modelResourceDomainType = this.model.dataType.modelResourceDomainType;
      resource.modelResourceId = this.model.dataType.modelResourceId;

    } else {
      /*
      resource.id = this.model.dataType.referencedDataType
        ? this.model.dataType.referencedDataType.id
        : null;
      */

      resource.referenceClass = {
        id: this.model.dataType.referenceClass
          ? this.model.dataType.referenceClass.id
          : null
      };
      resource.enumerationValues = this.model.dataType.enumerationValues.map((m) => {
        return {
          key: m.key,
          value: m.value,
          category: m.category
        };
      });
    }
    this.resources.dataType.save(this.model.parent.id, resource).subscribe(
      (response) => {
        this.messageHandler.showSuccess('Data Type saved successfully.');
        this.stateHandler.Go(
          'DataType',
          { dataModelId: response.body.model, id: response.body.id },
          { reload: true, location: true }
        );
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem saving the Data Type.',
          error
        );
      }
    );
  }

  saveCopiedDataTypes = () => {
    this.steps[1].compRef.instance.saveCopiedDataTypes();
  };
}
