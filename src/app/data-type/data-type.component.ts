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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SharedService } from '../services/shared.service';
import { MatTabGroup } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';
import {
  ElementTypesService,
  MessageHandlerService,
  SecurityHandlerService,
} from '@mdm/services';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';
import { DataModel, DataType, DataTypeDetail, DataTypeDetailResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { TabCollection } from '@mdm/model/ui.model';
import { BaseComponent } from '@mdm/shared/base/base.component';

@Component({
  selector: 'mdm-data-type',
  templateUrl: './data-type.component.html',
  styleUrls: ['./data-type.component.scss']
})
export class DataTypeComponent extends BaseComponent
  implements OnInit, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  dataType: DataTypeDetail;
  dataModelId: Uuid;
  dataModel: DataModel;
  id: Uuid;
  activeTab: number;
  showExtraTabs: boolean;
  showEditForm = false;

  loadingData = false;

  schemaView = 'list';
  descriptionView = 'default';
  contextView = 'default';
  rulesItemCount = 0;
  isLoadingRules = true;
  errorMessage: any;
  elementType: any;
  showEdit: boolean;
  showEditDescription = false;
  access: any;

  tabs = new TabCollection([
    'description',
    'dataElements',
    'rules',
    'comments',
    'links',
    'attachments'
  ]);

  allDataTypes = this.elementTypes.getAllDataTypesArray();
  allDataTypesMap = this.elementTypes.getAllDataTypesMap();

  constructor(
    private title: Title,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private sharedService: SharedService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private elementTypes: ElementTypesService,
    private editingService: EditingService,
  ) {
    super();
  }

  ngOnInit() {
    this.id = this.uiRouterGlobals.params.id;
    this.dataModelId = this.uiRouterGlobals.params.dataModelId;

    if (this.isGuid(this.id) && (!this.id || !this.dataModelId)) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.title.setTitle('Data Type');

    this.activeTab = this.tabs.getByName(
      this.uiRouterGlobals.params.tabView as string
    ).index;
    this.tabSelected(this.activeTab);

    this.loadingData = true;

    this.resources.dataType.get(this.dataModelId, this.id).subscribe(
      (result) => {
        const data = result.body;

        // If the Id is a path get the actual Id
        this.dataModelId = data.model;
        this.id = data.id;

        this.dataType = data;

        this.watchDataTypeObject();

        this.title.setTitle(`Data Type - ${this.dataType?.label}`);

        this.dataType.classifiers = this.dataType.classifiers || [];
        this.loadingData = false;
        this.showExtraTabs =
          !this.sharedService.isLoggedIn() || !this.dataType.editable;
      },
      () => {
        this.loadingData = false;
      }
    );
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  watchDataTypeObject() {
    this.access = this.securityHandler.elementAccess(this.dataType);
    if (this.access !== undefined) {
      this.showEdit = this.access.showEdit;
    }
  }

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go('dataType', { tabView: tab.name }, { notify: false });
  }

  save(saveItems: Array<DefaultProfileItem>) {
    const resource: DataType = {
      id: this.dataType.id,
      domainType: this.dataType.domainType,
      label: this.dataType.label
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      resource[item.propertyName] = item.value;
    });

    this.resources.dataType
      .update(this.dataModel.id, this.dataType.id, resource)
      .subscribe(
        (res: DataTypeDetailResponse) => {
          this.dataType = res.body;
          this.messageHandler.showSuccess('Data Type updated successfully.');
          this.editingService.stop();
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem updating the Data Type.',
            error
          );
        }
      );
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }
}
