/*
Copyright 2020-2025 University of Oxford and NHS England

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
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MatTabGroup, MatTab, MatTabContent } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import { MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import {
  DataClass,
  DataClassDetail,
  DataClassDetailResponse
} from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';
import { TabCollection } from '@mdm/model/ui.model';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';
import { BaseComponent } from '@mdm/shared/base/base.component';
import { HistoryComponent } from '@mdm/shared/history/history.component';
import { AttachmentListComponent } from '@mdm/shared/attachment-list/attachment-list.component';
import { AnnotationListComponent } from '@mdm/shared/annotation-list/annotation-list.component';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatFormField } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout/flex';
import { ConstraintsRulesComponent } from '@mdm/constraints-rules/constraints-rules.component';
import { SummaryMetadataTableComponent } from '@mdm/shared/summary-metadata/summary-metadata-table/summary-metadata-table.component';
import { ElementLinkListComponent } from '@mdm/shared/element-link-list/element-link-list.component';
import { DataClassComponentsListComponent } from '@mdm/shared/data-class-components-list/data-class-components-list.component';
import { ProfileDataViewComponent } from '@mdm/shared/profile-data-view/profile-data-view.component';
import { ModelHeaderComponent } from '@mdm/model-header/model-header.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NgIf } from '@angular/common';

@Component({
    selector: 'mdm-data-class',
    templateUrl: './data-class.component.html',
    styleUrls: ['./data-class.component.sass'],
    standalone: true,
    imports: [NgIf, MatProgressBar, ModelHeaderComponent, MatTabGroup, MatTab, MatTabContent, ProfileDataViewComponent, DataClassComponentsListComponent, ElementLinkListComponent, SummaryMetadataTableComponent, ConstraintsRulesComponent, FlexModule, MatFormField, MatSelect, FormsModule, MatOption, AnnotationListComponent, AttachmentListComponent, HistoryComponent]
})
export class DataClassComponent
  extends BaseComponent
  implements OnInit, AfterViewChecked {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  dataClass: DataClassDetail;
  showSecuritySection: boolean;
  showExtraTabs = false;
  activeTab: number;
  parentDataClass = { id: null };
  parentDataModel = {};
  isEditable: boolean;
  max: any;
  min: any;
  error = '';
  aliases: any[] = [];
  access: Access;
  tabs = new TabCollection([
    'description',
    'elements',
    'context',
    'data',
    'rules',
    'annotations',
    'history'
  ]);

  descriptionView = 'default';
  annotationsView = 'default';

  showEditDescription = false;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private uiRouterGlobals: UIRouterGlobals,
    private sharedService: SharedService,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private title: Title,
    private editingService: EditingService,
    private messageHandler: MessageHandlerService
  ) {
    super();
  }

  ngOnInit() {
    if (
      this.isGuid(this.uiRouterGlobals.params.id as string)
      && (!this.uiRouterGlobals.params.id
        || !this.uiRouterGlobals.params.dataModelId)
    ) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (
      this.uiRouterGlobals.params.id
      && this.uiRouterGlobals.params.dataClassId
      && this.uiRouterGlobals.params.dataClassId.trim() !== ''
    ) {
      this.parentDataClass = { id: this.uiRouterGlobals.params.dataClassId };
    }

    this.activeTab = this.tabs.getByName(
      this.uiRouterGlobals.params.tabView as string
    ).index;
    this.tabSelected(this.activeTab);

    this.showExtraTabs = this.sharedService.isLoggedIn();

    this.title.setTitle('Data Class');

    this.dataClassDetails(
      this.uiRouterGlobals.params.dataModelId as string,
      this.uiRouterGlobals.params.id as string,
      this.parentDataClass.id as string
    );
  }

  ngAfterViewChecked(): void {
    if (
      this.tabGroup
      && !this.editingService.isTabGroupClickEventHandled(this.tabGroup)
    ) {
      this.editingService.setTabGroupClickEvent(this.tabGroup);
    }
  }

  dataClassDetails(model: string, id: string, parentDataClass?: string) {
    if (!parentDataClass) {
      this.resourcesService.dataClass
        .get(model, id)
        .subscribe((result: DataClassDetailResponse) => {
          this.dataClass = result.body;

          this.access = this.securityHandler.elementAccess(this.dataClass);

          this.catalogueItem = this.dataClass;
          this.isEditable = this.dataClass.availableActions?.includes('update');

          this.parentDataModel = {
            id: result.body.model,
            finalised: this.dataClass.breadcrumbs[0].finalised
          };

          this.messageService.FolderSendMessage(this.dataClass);
          this.messageService.dataChanged(this.dataClass);

          if (
            this.dataClass.minMultiplicity
            && this.dataClass.minMultiplicity === -1
          ) {
            this.min = '*';
          }
 else {
            this.min = this.dataClass.minMultiplicity;
          }

          if (
            this.dataClass.maxMultiplicity
            && this.dataClass.maxMultiplicity === -1
          ) {
            this.max = '*';
          }
 else {
            this.max = this.dataClass.maxMultiplicity;
          }
        });
    }
 else {
      this.resourcesService.dataClass
        .getChildDataClass(model, parentDataClass, id)
        .subscribe((result: DataClassDetailResponse) => {
          this.dataClass = result.body;
          this.parentDataModel = {
            id: result.body.model,
            finalised: this.dataClass.breadcrumbs[0].finalised
          };
          this.isEditable = this.dataClass.availableActions?.includes('update');

          this.messageService.FolderSendMessage(this.dataClass);
          this.messageService.dataChanged(this.dataClass);
          this.catalogueItem = this.dataClass;
          this.access = this.securityHandler.elementAccess(this.dataClass);
        });
    }
  }

  save(saveItems: DefaultProfileItem[]) {
    this.error = '';

    const resource: DataClass = {
      id: this.dataClass.id,
      label: this.dataClass.label,
      domainType: this.dataClass.domainType
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      if (item.maxMultiplicity !== undefined) {
        if ((item.minMultiplicity as string) === '*') {
          item.minMultiplicity = -1;
        }

        if ((item.maxMultiplicity as string) === '*') {
          item.maxMultiplicity = -1;
        }

        resource.minMultiplicity = item.minMultiplicity as number;
        resource.maxMultiplicity = item.maxMultiplicity;
      }
 else {
        resource[item.propertyName] = item.value;
      }
    });

    if (!this.dataClass.parentDataClass) {
      this.resourcesService.dataClass
        .update(this.dataClass.model, this.dataClass.id, resource)
        .subscribe(
          (result: DataClassDetailResponse) => {
            this.dataClass = result.body;
            this.catalogueItem = result.body;
            this.messageHandler.showSuccess('Data Class updated successfully.');
            this.editingService.stop();
            this.messageService.dataChanged(result.body);
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Data Class.',
              error
            );
          }
        );
    }
 else {
      this.resourcesService.dataClass
        .updateChildDataClass(
          this.dataClass.model,
          this.dataClass.parentDataClass,
          this.dataClass.id,
          resource
        )
        .subscribe(
          (result: DataClassDetailResponse) => {
            this.messageHandler.showSuccess('Data Class updated successfully.');
            this.editingService.stop();
            this.dataClass = result.body;
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Data Class.',
              error
            );
          }
        );
    }
  }

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go('dataClass', { tabView: tab.name }, { notify: false });
  }
}
