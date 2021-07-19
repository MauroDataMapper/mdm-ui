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
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { Uuid, VersionedFolderDetail, VersionedFolderDetailResponse } from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';
import { AnnotationViewOption, TabCollection, TabDescriptor } from '@mdm/model/ui.model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, MessageService, SecurityHandlerService, SharedService, StateHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { BaseComponent } from '@mdm/shared/base/base.component';
import { UIRouterGlobals } from '@uirouter/angular';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'mdm-versioned-folder',
  templateUrl: './versioned-folder.component.html',
  styleUrls: ['./versioned-folder.component.scss']
})
export class VersionedFolderComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  parentId: Uuid;
  detail: VersionedFolderDetail;

  activeTab: TabDescriptor;
  access: Access;

  showSearch = false;
  showExtraTabs = false;

  annotationsView: AnnotationViewOption = 'default';
  historyItemCount = 0;
  isLoadingHistory = true;
  rulesItemCount = 0;
  isLoadingRules = true;
  tabs = new TabCollection(['description', 'rules', 'annotations', 'history']);

  private subscriptions: Subscription[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(
    private resources: MdmResourcesService,
    private messages: MessageService,
    private shared: SharedService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private title: Title,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private editingService: EditingService) {
    super();
  }

  ngOnInit(): void {
    // Feature toggle guard
    if (!this.shared.features.useVersionedFolders) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (!this.uiRouterGlobals.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.showExtraTabs = this.shared.isLoggedIn();
    this.parentId = this.uiRouterGlobals.params.id;

    this.activeTab = this.tabs.getByName(this.uiRouterGlobals.params.tabView);
    this.tabSelected(this.activeTab);

    this.title.setTitle('Versioned Folder');

    this.loadDetails(this.parentId);

    this.subscriptions.push(
      this.messages.changeSearch.subscribe((show: boolean) => {
        this.showSearch = show;
      }));
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  tabSelected(tab: TabDescriptor | number) {
    const selected = typeof tab === 'number' ? this.tabs.getByIndex(tab) : tab;
    this.stateHandler.Go(
      'versionedFolder',
      { tabView: selected.name },
      { notify: false });
  }

  toggleShowSearch() {
    this.messages.toggleSearch();
  }
  save(saveItems: Array<DefaultProfileItem>) {
    const resource = {
      id: this.detail.id,
      domainType: this.detail.domainType
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      resource[item.propertyName] = item.value;
    });

    this.resources.versionedFolder
      .update(this.detail.id,resource)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem updating the Versioned Folder.', error);
          return EMPTY;
        })
      )
      .subscribe((response: VersionedFolderDetailResponse) => {
        this.messageHandler.showSuccess('Versioned Folder updated successfully.');
        this.detail = response.body;
        this.catalogueItem = response.body;
      });
  }

  afterDetailsSaved(next: VersionedFolderDetail) {
    this.setupDetails(next);
  }

  historyCountEmitter(value: number) {
    this.isLoadingHistory = false;
    this.historyItemCount = value;
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  private loadDetails(id: Uuid) {
    this.resources.versionedFolder
      .get(id)
      .subscribe((response: VersionedFolderDetailResponse) => {
        this.setupDetails(response.body);
      });
  }

  private setupDetails(value: VersionedFolderDetail) {
    this.detail = value;
    this.catalogueItem = this.detail;
    this.access = this.securityHandler.elementAccess(this.detail);

    if (this.shared.isLoggedIn(true)) {
      // TODO remove once BE is ready
      // this.UsedProfiles(ModelDomainType.VERSIONED_FOLDERS, this.detail.id);
      // this.UnUsedProfiles(ModelDomainType.VERSIONED_FOLDERS, this.detail.id);
    }
  }
}
