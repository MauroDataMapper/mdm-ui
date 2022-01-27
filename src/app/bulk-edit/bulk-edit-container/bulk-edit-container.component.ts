/*
Copyright 2020-2022 University of Oxford
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
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DataModelDetail, DataModelDetailResponse, ProfileContext } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService, MessageHandlerService, BroadcastService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditContext, BulkEditStep } from '../types/bulk-edit-types';

@Component({
  selector: 'mdm-bulk-edit-container',
  templateUrl: './bulk-edit-container.component.html',
  styleUrls: ['./bulk-edit-container.component.scss']
})
export class BulkEditContainerComponent implements OnInit {
  context: BulkEditContext;
  parent: DataModelDetail;
  currentStep: BulkEditStep = BulkEditStep.Selection;

  public Steps = BulkEditStep;

  constructor(
    private stateHandler: StateHandlerService,
    private resource: MdmResourcesService,
    private broadcast: BroadcastService,
    private uiRouterGlobals: UIRouterGlobals,
    private messageHandler: MessageHandlerService,
    private title: Title,
    private editing: EditingService) { }

  ngOnInit(): void {
    this.context = {
      catalogueItemId: this.uiRouterGlobals.params.id,
      domainType: this.uiRouterGlobals.params.domainType,
      elements: [],
      profiles: []
    };

    this.resource.dataModel
      .get(this.context.catalogueItemId)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem getting the parent catalogue item.', error);
          return EMPTY;
        })
      )
      .subscribe((response: DataModelDetailResponse) => {
        this.parent = response.body;
        this.title.setTitle(`Bulk Edit - ${this.parent.label}`);
        this.editing.start();
      });
  }

  cancel() {
    // The state handler is also tied to the EditingService, so will automatically confirm to leave first
    this.stateHandler.GoPrevious();
  }

  next() {
    this.currentStep = this.currentStep + 1;
  }

  previous() {
    this.currentStep = this.currentStep - 1;
  }

  validate() {
    this.broadcast.dispatch('validateBulkEdit');
  }

  save(profiles: ProfileContext[]) {
    this.resource.profile
      .saveMany(
        this.context.domainType,
        this.context.catalogueItemId,
        { profilesProvided: profiles })
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem saving the profiles.', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Profile information was saved successfully.');
      });
  }
}
