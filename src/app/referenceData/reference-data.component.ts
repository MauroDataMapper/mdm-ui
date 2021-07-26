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
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MatTabGroup } from '@angular/material/tabs';
import { SharedService } from '@mdm/services/shared.service';
import { MessageService } from '@mdm/services/message.service';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import { MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import {
  ModelUpdatePayload,
  ReferenceDataModelDetail,
  ReferenceDataModelDetailResponse,
  SecurableDomainType
} from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';
import { TabCollection } from '@mdm/model/ui.model';

@Component({
  selector: 'mdm-reference-data',
  templateUrl: './reference-data.component.html',
  styleUrls: ['./reference-data.component.scss']
})
export class ReferenceDataComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  referenceModel: ReferenceDataModelDetail;
  showSecuritySection: boolean;
  subscription: Subscription;
  parentId: string;
  isEditable: boolean;
  showExtraTabs = false;
  activeTab: any;
  semanticLinks: any[] = [];
  schemaView = 'list';
  descriptionView = 'default';
  contextView = 'default';
  annotationsView = 'default';
  errorMessage = '';
  showEdit = false;
  showDelete = false;
  access: Access;
  tabs = new TabCollection(['description', 'elements', 'types', 'data', 'rules', 'annotations', 'history']);

  typesItemCount = 0;
  isLoadingTypes = true;
  dataItemCount = 0;
  isLoadingData = true;
  elementsItemCount = 0;
  isLoadingElements = true;
  rulesItemCount = 0;
  isLoadingRules = true;

  constructor(
    private resourcesService: MdmResourcesService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private editingService: EditingService,
    private messageHandler: MessageHandlerService,
    private title: Title
  ) {
  }

  ngOnInit(): void {
    this.parentId = this.uiRouterGlobals.params.id;
    if (!this.parentId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.showExtraTabs = this.sharedService.isLoggedIn();
    this.title.setTitle('Reference Data Model');

    this.activeTab = this.tabs.getByName(this.uiRouterGlobals.params.tabView).index;
    this.tabSelected(this.activeTab);

    this.referenceModelDetails(this.parentId);
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  typesCountEmitter($event) {
    this.isLoadingTypes = false;
    this.typesItemCount = $event;
  }

  dataCountEmitter($event) {
    this.isLoadingData = false;
    this.dataItemCount = $event;
  }

  elementsCountEmitter($event) {
    this.isLoadingElements = false;
    this.elementsItemCount = $event;
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  save(saveItems: Array<DefaultProfileItem>) {
    const resource: ModelUpdatePayload = {
      id: this.referenceModel.id,
      domainType: this.referenceModel.domainType
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      resource[item.propertyName] = item.value;
    });


    this.resourcesService.referenceDataModel
    .update(this.referenceModel.id, resource)
    .subscribe(
      (res) => {
        this.referenceModel = res.body;
        this.messageHandler.showSuccess(
          'Reference Data Model updated successfully.'
        );
       },
      (error) => {
        this.messageHandler.showError(
          'There was a problem updating the Reference Data Model.',
          error
        );
      }
    );
  }

  referenceModelDetails(id: string) {
    this.resourcesService.referenceDataModel
      .get(id)
      .subscribe((result: ReferenceDataModelDetailResponse) => {
        this.referenceModel = result.body;
        this.isEditable = this.referenceModel.availableActions.includes(
          'update'
        );
        this.parentId = this.referenceModel.id;
        this.watchRefDataModelObject();

        if (this.sharedService.isLoggedIn(true)) {
          this.ReferenceModelPermissions(id);
        }
      });
  }

  ReferenceModelPermissions(id: any) {
    this.resourcesService.security
      .permissions(SecurableDomainType.ReferenceDataModels, id)
      .subscribe((permissions: { body: { [x: string]: any } }) => {
        Object.keys(permissions.body).forEach((attrname) => {
          this.referenceModel[attrname] = permissions.body[attrname];
        });
      });
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe(); // unsubscribe to ensure no memory leaks
    }
  }

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go(
      'referencedatamodel',
      { tabView: tab.name },
      { notify: false }
    );
  }

  watchRefDataModelObject() {
    this.access = this.securityHandler.elementAccess(this.referenceModel);
    if (this.access !== undefined) {
      this.showEdit = this.access.showEdit;
      this.showDelete =
        this.access.showPermanentDelete || this.access.showSoftDelete;
    }
  }
}
