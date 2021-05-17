/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
  EventEmitter,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { Step } from '@mdm/model/stepModel';
import { DataClassStep2Component } from '../data-class-step2/data-class-step2.component';
import { DataClassStep1Component } from '../data-class-step1/data-class-step1.component';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { StateService } from '@uirouter/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { Title } from '@angular/platform-browser';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { CatalogueItemDomainType, DataClass, DataClassDetailResponse } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

@Component({
  selector: 'mdm-data-class-main',
  templateUrl: './data-class-main.component.html',
  styleUrls: ['./data-class-main.component.sass']
})
export class DataClassMainComponent implements AfterViewInit {
  steps: Step[] = [];
  doneEvent = new EventEmitter<any>();
  parentDataModelId: any;
  grandParentDataClassId: any;
  parentDataClassId: any;

  model: any = {
    metadata: [],
    classifiers: [],
    parent: {},
    createType: 'new',
    copyFromDataModel: [],
    selectedDataClasses: [],
    selectedDataClassesMap: {}
  };
  constructor(
    private title: Title,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private broadcastSvc: BroadcastService,
    private changeRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.

    this.title.setTitle('New Data Class');

    // tslint:disable-next-line: deprecation
    this.parentDataModelId = this.stateService.params.parentDataModelId;
    // tslint:disable-next-line: deprecation
    this.grandParentDataClassId = this.stateService.params.grandParentDataClassId;
    // tslint:disable-next-line: deprecation
    this.parentDataClassId = this.stateService.params.parentDataClassId;

    if (!this.parentDataModelId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    const step1 = new Step();
    step1.title = 'Select an Import Method';
    step1.component = DataClassStep1Component;
    step1.scope = this;
    step1.hasForm = true;
    step1.invalid = true;

    const step2 = new Step();
    step2.title = 'Data Class Details';
    step2.component = DataClassStep2Component;
    step2.scope = this;
    step2.invalid = true;

    if (this.parentDataClassId) {
      this.resources.dataClass
        .getChildDataClass(
          this.parentDataModelId,
          this.grandParentDataClassId,
          this.parentDataClassId
        )
        .toPromise()
        .then((result) => {
          result.body.breadcrumbs.push(Object.assign([], result.body));
          this.model.parent = result.body;
          this.steps.push(step1);
          this.steps.push(step2);
          this.changeRef.detectChanges();
        });
    } else {
      this.resources.dataModel
        .get(this.parentDataModelId)
        .toPromise()
        .then((result) => {
          result.body.breadcrumbs = [];
          result.body.breadcrumbs.push(Object.assign({}, result.body));
          this.model.parent = result.body;
          this.steps.push(step1);
          this.steps.push(step2);
          this.changeRef.detectChanges();
        });
    }
  }

  closeWizard = () => {
    this.stateHandler.GoPrevious();
  };

  save = () => {
    if (this.model.createType === 'new') {
      this.saveNewDataClass();
    } else {
      this.saveCopiedDataClasses();
    }
  };

  getMultiplicity = (resource, multiplicity) => {
    if (this.model[multiplicity] === '*') {
      this.model[multiplicity] = -1;
    }
    if (!isNaN(this.model[multiplicity])) {
      resource[multiplicity] = parseInt(this.model[multiplicity], 10);
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

  saveCopiedDataClasses = () => {
    this.steps[1].compRef.instance.saveCopiedDataClasses();
  };

  saveNewDataClass = () => {
    const resource: DataClass = {
      domainType: CatalogueItemDomainType.DataClass,
      label: this.model.label,
      description: this.model.description,
      classifiers: this.model.classifiers.map((cls) => {
        return { id: cls.id };
      }),
      metadata: this.model.metadata.map((m) => {
        return {
          key: m.key,
          value: m.value,
          namespace: m.namespace
        };
      }),
      minMultiplicity: null,
      maxMultiplicity: null
    };

    this.getMultiplicity(resource, 'minMultiplicity');
    this.getMultiplicity(resource, 'maxMultiplicity');

    let deferred: Observable<DataClassDetailResponse>;
    if (this.model.parent.domainType === 'DataClass') {
      deferred = this.resources.dataClass.addChildDataClass(
        this.model.parent.model,
        this.model.parent.id,
        resource
      );
    } else {
      deferred = this.resources.dataClass.save(this.model.parent.id, resource);
    }

    deferred.subscribe(
      (response) => {
        this.messageHandler.showSuccess('Data Class saved successfully.');
        this.stateHandler.Go(
          'dataClass',
          {
            dataModelId: response.body.model || '',
            dataClassId: response.body.parentDataClass || '',
            id: response.body.id
          },
          { reload: true, location: true }
        );
       },
      (error) => {
        this.messageHandler.showError(
          'There was a problem saving the Data Class.',
          error
        );
      }
    );
  };
}
