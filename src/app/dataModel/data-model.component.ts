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
import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SharedService } from '../services/shared.service';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import { MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import {
  DataModelDetail,
  DataModelDetailResponse,
  ModelUpdatePayload,
  SecurableDomainType
} from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';
import { TabCollection } from '@mdm/model/ui.model';
import { BaseComponent } from '@mdm/shared/base/base.component';

@Component({
  selector: 'mdm-data-model',
  templateUrl: './data-model.component.html',
  styleUrls: ['./data-model.component.scss']
})
export class DataModelComponent
  extends BaseComponent
  implements OnInit, AfterViewChecked {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  parentId: string;
  showFinalised: string;
  downloadLinks: HTMLAnchorElement[] = [];
  compareToList: any[] = []; // TODO: define better type

  dataModel: DataModelDetail;
  editMode = false;
  showExtraTabs = false;
  showEdit = false;
  showDelete = false;
  activeTab: any;
  semanticLinks: any[] = [];
  access: Access;
  tabs = new TabCollection([
    'search',
    'description',
    'schema',
    'types',
    'context',
    'rules',
    'annotations',
    'history'
  ]);

  errorMessage = '';

  schemaView = 'list';

  contextView = 'default';
  annotationsView = 'default';
  schemaItemCount = 0;
  typesItemCount = 0;
  isLoadingSchema = true;
  isLoadingTypes = true;
  rulesItemCount = 0;
  isLoadingRules = true;
  historyItemCount = 0;
  isLoadingHistory = true;
  showEditDescription = false;
  isLoggedIn = false;

  constructor(
    private resourcesService: MdmResourcesService,
    private sharedService: SharedService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private title: Title,
    private messageHandler: MessageHandlerService,
    private editingService: EditingService
  ) {
    super();
  }

  ngOnInit() {
    if (!this.uiRouterGlobals.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (this.uiRouterGlobals.params.edit === 'true') {
      this.editMode = true;
    }
    this.showExtraTabs = this.sharedService.isLoggedIn();
    this.parentId = this.uiRouterGlobals.params.id;
    this.showFinalised = this.uiRouterGlobals.params.finalised;

    this.activeTab = this.tabs.getByName(
      this.uiRouterGlobals.params.tabView ?? 'description'
    ).index;
    this.tabSelected(this.activeTab);

    this.title.setTitle('Data Model');

    this.dataModelDetails(this.parentId, this.showFinalised);

    this.isLoggedIn = this.sharedService.isLoggedIn();
  }

  save(saveItems: Array<DefaultProfileItem>) {
    const resource: ModelUpdatePayload = {
      id: this.dataModel.id,
      domainType: this.dataModel.domainType
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      resource[item.propertyName] = item.value;
    });

    this.resourcesService.dataModel
      .update(this.catalogueItem.id, resource)
      .subscribe(
        (res: DataModelDetailResponse) => {
          this.messageHandler.showSuccess('Data Model updated successfully.');
          this.dataModel = res.body;
          this.catalogueItem = res.body;
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem updating the Data Model.',
            error
          );
        }
      );
  }

  ngAfterViewChecked(): void {
    if (
      this.tabGroup &&
      !this.editingService.isTabGroupClickEventHandled(this.tabGroup)
    ) {
      this.editingService.setTabGroupClickEvent(this.tabGroup);
    }
  }

  watchDataModelObject() {
    this.access = this.securityHandler.elementAccess(this.catalogueItem);
    if (this.access !== undefined) {
      this.showEdit = this.access.showEdit;
      this.showDelete =
        this.access.showPermanentDelete || this.access.showSoftDelete;
    }
  }

  dataModelDetails(id: string, showFinalised: string) {
    let arr = [];

    if (!showFinalised) {
      this.resourcesService.dataModel
        .get(id)
        .subscribe(async (result: DataModelDetailResponse) => {
          this.dataModel = result.body;
          this.catalogueItem = result.body;

          if (this.dataModel.semanticLinks) {
            this.compareToList = this.dataModel.semanticLinks
              .filter(
                (link) =>
                  link.linkType === 'New Version Of' ||
                  link.linkType === 'Superseded By'
              )
              .map((link) => link.target);
          }

          this.watchDataModelObject();
          this.parentId = this.catalogueItem.id;

          await this.resourcesService.versionLink
            .list('dataModels', this.catalogueItem.id)
            .subscribe((response) => {
              if (response.body.count > 0) {
                arr = response.body.items;
                for (const val in arr) {
                  if (this.catalogueItem.id !== arr[val].targetModel.id) {
                    this.semanticLinks.push(arr[val]);
                  }
                }
              }
            });

          if (this.sharedService.isLoggedIn(true)) {
            this.DataModelPermissions(this.catalogueItem.id);
          }
        });
    } else {
      const data = {
        finalised: this.showFinalised
      };
      this.resourcesService.catalogueItem
        .getPath('dataModels', id, data)
        .subscribe(async (result: DataModelDetailResponse) => {
          this.dataModel = result.body;
          this.catalogueItem = result.body;

          this.watchDataModelObject();
          this.parentId = this.catalogueItem.id;

          await this.resourcesService.versionLink
            .list('dataModels', this.catalogueItem.id)
            .subscribe((response) => {
              if (response.body.count > 0) {
                arr = response.body.items;
                for (const val in arr) {
                  if (this.catalogueItem.id !== arr[val].targetModel.id) {
                    this.semanticLinks.push(arr[val]);
                  }
                }
              }
            });

          if (this.sharedService.isLoggedIn(true)) {
            this.DataModelPermissions(this.catalogueItem.id);
          }
        });
    }
  }

  async DataModelPermissions(id: any) {
    await this.resourcesService.security
      .permissions(SecurableDomainType.DataModels, id)
      .subscribe((permissions: { body: { [x: string]: any } }) => {
        Object.keys(permissions.body).forEach((attrname) => {
          this.catalogueItem[attrname] = permissions.body[attrname];
        });
      });
  }

  schemaCountEmitter($event) {
    this.isLoadingSchema = false;
    this.schemaItemCount = $event;
  }

  typesCountEmitter($event) {
    this.isLoadingTypes = false;
    this.typesItemCount = $event;
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  historyCountEmitter($event) {
    this.isLoadingHistory = false;
    this.historyItemCount = $event;
  }

  addDataClass() {
    this.stateHandler.Go(
      'newDataClass',
      { parentDataModelId: this.catalogueItem.id, parentDataClassId: null },
      null
    );
  }

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go('dataModel', { tabView: tab.name }, { notify: false });
  }
}
