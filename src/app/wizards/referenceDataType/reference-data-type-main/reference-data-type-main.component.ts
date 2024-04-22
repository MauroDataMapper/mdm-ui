/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  CatalogueItem,
  CatalogueItemDomainType,
  ReferenceDataModelDetail,
  ReferenceDataModelDetailResponse,
  ReferenceDataType,
  ReferenceDataTypeCreatePayload,
  ReferenceDataTypeDetailResponse,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { CreateType, WizardStep } from '@mdm/wizards/wizards.model';
import { UIRouterGlobals } from '@uirouter/angular';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { NewReferenceDataTypeState } from '../new-reference-data-type-form/new-reference-data-type-form.component';
import { ReferenceDataTypeStep1Component } from '../reference-data-type-step1/reference-data-type-step1.component';
import { ReferenceDataTypeStep2Component } from '../reference-data-type-step2/reference-data-type-step2.component';

export interface ReferenceDataTypeCreateState {
  createType: CreateType;
  copyFromModel?: CatalogueItem[];
  newDataTypeDetails?: NewReferenceDataTypeState;
  dataTypesForCopy?: ReferenceDataType[];
}

@Component({
  selector: 'mdm-reference-data-type-main',
  templateUrl: './reference-data-type-main.component.html',
  styleUrls: ['./reference-data-type-main.component.scss']
})
export class ReferenceDataTypeMainComponent implements OnInit {
  parentModelId: Uuid;
  parent: ReferenceDataModelDetail;
  steps: WizardStep<ReferenceDataTypeMainComponent>[] = [];
  state: ReferenceDataTypeCreateState = {
    createType: 'new'
  };
  processing = false;
  progressValue = 0;

  constructor(
    private resources: MdmResourcesService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private messageHandler: MessageHandlerService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.parentModelId = this.uiRouterGlobals.params.parentModelId;

    if (!this.parentModelId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.resources.referenceDataModel
      .get(this.parentModelId)
      .subscribe((response: ReferenceDataModelDetailResponse) => {
        this.parent = response.body;
        this.steps = [
          {
            title: 'Add Data Type',
            component: ReferenceDataTypeStep1Component,
            scope: this,
            hasForm: true,
            invalid: false
          },
          {
            title: 'Reference Data Type Details',
            component: ReferenceDataTypeStep2Component,
            scope: this,
            invalid: true
          }
        ];
      });

    this.title.setTitle('New Data Type');
  }

  cancelWizard() {
    this.stateHandler.GoPrevious();
  }

  save() {
    if (this.state.createType === 'copy') {
      this.copyDataTypesToModel(this.state.dataTypesForCopy);
      return;
    }

    this.createNewDataType(this.state.newDataTypeDetails);
  }

  private createNewDataType(details: NewReferenceDataTypeState) {
    if (!details || !details.valid) {
      return;
    }

    const payload: ReferenceDataTypeCreatePayload = {
      label: details.label,
      description: details.description,
      domainType: details.type,
      ...(details.type === CatalogueItemDomainType.ReferenceEnumerationType && {
        referenceEnumerationValues: details.enumerationValues
      })
    };

    this.processing = true;

    this.resources.referenceDataType
      .create(this.parentModelId, payload)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem creating the Reference Data Type.',
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.processing = false))
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          'Reference Data Type created successfully.'
        );
        this.stateHandler.Go('ReferenceDataModel', {
          id: this.parentModelId,
          tabView: 'types'
        });
      });
  }

  private copyDataTypesToModel(sourceTypes: ReferenceDataType[]) {
    const max = sourceTypes.length;
    let current = 0;

    const requests$: Observable<ReferenceDataModelDetail>[] = sourceTypes.map(
      (sourceType) => {
        return this.resources.referenceDataType
          .copy(this.parentModelId, sourceType.model, sourceType.id)
          .pipe(
            map((response: ReferenceDataTypeDetailResponse) => {
              current = current + 1;
              this.progressValue = (current / max) * 100;
              return response.body;
            }),
            catchError((error) => {
              this.messageHandler.showError(
                `Failed to copy "${sourceType.label}"`,
                error
              );
              return of({ id: sourceType.id, error });
            })
          );
      }
    );

    this.processing = true;
    forkJoin(requests$)
      .pipe(finalize(() => (this.processing = false)))
      .subscribe((results) => {
        const errorCount = results.filter((r) => r.error).length;
        if (errorCount > 0) {
          this.messageHandler.showWarning(
            `${errorCount} Reference Data Type(s) were not copied due to errors.`
          );
        } else {
          this.messageHandler.showSuccess(
            'All Reference Data Type(s) copied successfully.'
          );
          this.stateHandler.Go('ReferenceDataModel', {
            id: this.parentModelId,
            tabView: 'types'
          });
        }
      });
  }
}
