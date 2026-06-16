/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { MdmResourcesService } from '@mdm/modules/resources';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UIRouterGlobals } from '@uirouter/core';
import { MessageService } from '../services/message.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../services/shared.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import {
  BroadcastService,
  MessageHandlerService,
  SecurityHandlerService
} from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import {
  FolderDetail,
  FolderDetailResponse,
  PermissionsResponse,
  SecurableDomainType,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';
import { TabCollection } from '@mdm/model/ui.model';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';
import { BaseComponent } from '@mdm/shared/base/base.component';
import { HistoryComponent } from '../shared/history/history.component';
import { AttachmentListComponent } from '../shared/attachment-list/attachment-list.component';
import { AnnotationListComponent } from '../shared/annotation-list/annotation-list.component';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatFormField } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout/flex';
import { ConstraintsRulesComponent } from '../constraints-rules/constraints-rules.component';
import { SkeletonBadgeComponent } from '../utility/skeleton-badge/skeleton-badge.component';
import { ProfileDataViewComponent } from '../shared/profile-data-view/profile-data-view.component';
import { CatalogueItemSearchComponent } from '../catalogue-search/catalogue-item-search/catalogue-item-search.component';
import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';
import { ModelHeaderComponent } from '../model-header/model-header.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'mdm-folder',
    templateUrl: './folder.component.html',
    styleUrls: ['./folder.component.css'],
    standalone: true,
    imports: [NgIf, ModelHeaderComponent, MatTabGroup, MatTab, MatTabLabel, CatalogueItemSearchComponent, MatTabContent, ProfileDataViewComponent, SkeletonBadgeComponent, ConstraintsRulesComponent, FlexModule, MatFormField, MatSelect, FormsModule, MatOption, AnnotationListComponent, AttachmentListComponent, HistoryComponent]
})
export class FolderComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  readonly domainType = 'folders';

  folder: FolderDetail;
  processing = false;
  showSecuritySection: boolean;
  subscription: Subscription;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  activeTab: number;
  showExtraTabs = false;
  showEdit = false;
  showDelete = false;
  showEditDescription = false;
  historyItemCount = 0;
  isLoadingHistory = true;
  rulesItemCount = 0;
  isLoadingRules = true;
  access: Access;
  annotationsView = 'default';
  tabs = new TabCollection([
    'search',
    'description',
    'rules',
    'annotations',
    'history'
  ]);

  constructor(
    private resources: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private broadcast: BroadcastService,
    private title: Title,
    private editingService: EditingService,
    private messageHandler: MessageHandlerService
  ) {
    super();
  }

  ngOnInit() {
    if (
      this.isGuid(this.uiRouterGlobals.params.id as string)
      && !this.uiRouterGlobals.params.id
    ) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (this.uiRouterGlobals.params.edit === 'true') {
      this.editMode = true;
    }
    this.title.setTitle('Folder');
    this.showExtraTabs = this.sharedService.isLoggedIn();

    this.folderDetails(this.uiRouterGlobals.params.id as Uuid);
    this.subscription = this.messageService.changeUserGroupAccess.subscribe(
      (message: boolean) => {
        this.showSecuritySection = message;
      }
    );
    this.afterSave = (result: { body: { id: Uuid } }) =>
      this.folderDetails(result.body.id);

    const tabView: string = this.uiRouterGlobals.params.tabView;
    this.activeTab = this.tabs.getByName(tabView ?? 'description').index;

    this.tabSelected(this.activeTab);
  }

  folderDetails(id: string) {
    this.resources.folder.get(id).subscribe((result: FolderDetailResponse) => {
      this.folder = result.body;
      this.catalogueItem = this.folder;

      this.parentId = this.folder.id;

      this.access = this.securityHandler.elementAccess(this.folder);
      this.showEdit = this.access.showEdit;
      this.showDelete
        = this.access.showPermanentDelete || this.access.showSoftDelete;

      if (this.sharedService.isLoggedIn(true)) {
        this.folderPermissions(id);
      }
    });
  }

  folderPermissions(id: Uuid) {
    this.resources.security
      .permissions(SecurableDomainType.Folders, id)
      .subscribe((permissions: PermissionsResponse) => {
        Object.keys(permissions.body).forEach((attrname) => {
          this.folder[attrname] = permissions.body[attrname];
        });
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      // unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
    }
  }

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go('folder', { tabView: tab.name }, { notify: false });
  }

  save(folderUpdates: Array<DefaultProfileItem>) {
    const resource = {
      id: this.folder.id,
      label: this.folder.label,
      domainType: this.folder.domainType
    };

    folderUpdates.forEach((item) => {
      resource[item.propertyName] = item.value;
    });

    this.resources.folder.update(resource.id, resource).subscribe(
      (res) => {
        this.folder = res.body;
        this.catalogueItem = res.body;
        this.editingService.stop();

        this.messageHandler.showSuccess('Folder updated successfully.');
        this.broadcast.reloadCatalogueTree();
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem updating the folder.',
          error
        );
      }
    );
  }

  historyCountEmitter($event) {
    this.isLoadingHistory = false;
    this.historyItemCount = $event;
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }
}
