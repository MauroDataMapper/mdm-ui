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
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { Step } from '@mdm/model/stepModel';
import { DataTypeStep1Component } from '../data-type-step1/data-type-step1.component';
import { DataTypeStep2Component } from '../data-type-step2/data-type-step2.component';
import { Title } from '@angular/platform-browser';
import { CatalogueItemDomainType, DataModelDetailResponse, DataType } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-data-type-main',
  templateUrl: './data-type-main.component.html',
  styleUrls: ['./data-type-main.component.sass'],
})
export class DataTypeMainComponent implements OnInit {
  parentDataModelId: any;
  steps: Step[] = [];
  processing: any;
  isProcessComplete: any;
  model = {
    createType: 'new',
    copyFromDataModel: [],
    isValid: false,
    parent: {
      id: '',
    },
    parentDataModel: { id: '' },
    label: '',
    description: '',
    organisation: '',
    domainType: CatalogueItemDomainType.PrimitiveType,
    metadata: [],
    enumerationValues: [],
    classifiers: [],
    referencedDataType: { id: '' },
    referencedTerminology: { id: '' },
    referencedDataClass: { id: '' },
    isProcessComplete: false,
  };
  constructor(
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private title: Title,
    private changeRef: ChangeDetectorRef
  ) { }

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

    this.resources.dataModel.get(this.parentDataModelId).subscribe((result: DataModelDetailResponse) => {
      result.body.breadcrumbs = [];
      result.body.breadcrumbs.push(Object.assign({}, result.body));
      this.model.parent.id = result.body.id || '';

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
    const resource: DataType = {
      domainType: this.model.domainType,
      label: this.model.label,
      description: this.model.description,
      classifiers: this.model.classifiers.map((cls) => {
        return { id: cls.id };
      })
    };

    if (this.model.domainType === CatalogueItemDomainType.TerminologyType
      || this.model.domainType === CatalogueItemDomainType.CodeSetType
      || this.model.domainType === CatalogueItemDomainType.ReferenceDataModelType) {
      resource.domainType = CatalogueItemDomainType.ModelDataType;
      resource.modelResourceId = this.model.referencedTerminology ? this.model.referencedTerminology.id : null;
      resource.modelResourceDomainType = '';
      if (this.model.domainType === CatalogueItemDomainType.TerminologyType) {
        resource.modelResourceDomainType = CatalogueItemDomainType.Terminology;
      }
      else if (this.model.domainType === CatalogueItemDomainType.CodeSetType) {
        resource.modelResourceDomainType = CatalogueItemDomainType.CodeSet;
      }
      else if (this.model.domainType === CatalogueItemDomainType.ReferenceDataModelType) {
        resource.modelResourceDomainType = CatalogueItemDomainType.ReferenceDataModel;
      }

      // resource = {
      //   //domainType: CatalogueItemDomainType.ModelDataType,
      //   //label: this.model.label,
      //   //modelResourceId: this.model.referencedTerminology ? this.model.referencedTerminology.id : null,
      //   //modelResourceDomainType: '',
      //   // classifiers: this.model.classifiers.map((cls) => {
      //   //   return { id: cls.id };
      //   // }),
      //   //description: this.model.description
      // };
      // if (this.model.domainType === 'TerminologyType') {
      //   resource['modelResourceDomainType'] = 'Terminology';
      // }
      // else if (this.model.domainType === 'CodeSetType') {
      //   resource['modelResourceDomainType'] = 'CodeSet';
      // }
      // else if (this.model.domainType === 'ReferenceDataModelType') {
      //   resource['modelResourceDomainType'] = 'ReferenceDataModel';
      // }
    }
    else {
      resource.organisation = this.model.organisation;
      resource.referenceDataType = {
        id: this.model.referencedDataType ? this.model.referencedDataType.id : null
      };
      resource.referenceClass = {
        id: this.model.referencedDataClass ? this.model.referencedDataClass.id : null
      };
      resource.terminology = {
        id: this.model.referencedTerminology ? this.model.referencedTerminology.id : null
      };
      resource.enumerationValues = this.model.enumerationValues.map((m) => {
        return {
          key: m.key,
          value: m.value,
          category: m.category
        };
      });
      resource.metadata = this.model.metadata.map((m) => {
        return {
          key: m.key,
          value: m.value,
          namespace: m.namespace
        };
      });

      // resource = {
      //   //label: this.model.label,
      //   //description: this.model.description,
      //   //organisation: this.model.organisation,
      //   //domainType: this.model.domainType,
      //   // referenceDataType: {
      //   //   id: this.model.referencedDataType ? this.model.referencedDataType.id : null
      //   // },
      //   // referenceClass: {
      //   //   id: this.model.referencedDataClass ? this.model.referencedDataClass.id : null
      //   // },
      //   // terminology: {
      //   //   id: this.model.referencedTerminology ? this.model.referencedTerminology.id : null
      //   // },

      //   // classifiers: this.model.classifiers.map((cls) => {
      //   //   return { id: cls.id };
      //   // }),
      //   enumerationValues: this.model.enumerationValues.map((m) => {
      //     return {
      //       key: m.key,
      //       value: m.value,
      //       category: m.category
      //     };
      //   }),
      //   metadata: this.model.metadata.map((m) => {
      //     return {
      //       key: m.key,
      //       value: m.value,
      //       namespace: m.namespace
      //     };
      //   })
      // };
    }
    this.resources.dataType.save(this.model.parent.id, resource).subscribe(response => {
      this.messageHandler.showSuccess('Data Type saved successfully.');
      this.stateHandler.Go(
        'DataType',
        { dataModelId: response.body.model, id: response.body.id },
        { reload: true, location: true }
      );
    }, error => {
      this.messageHandler.showError('There was a problem saving the Data Type.', error);
    });
  }

  saveCopiedDataTypes = () => {
    this.steps[1].compRef.instance.saveCopiedDataTypes();
  };
}
