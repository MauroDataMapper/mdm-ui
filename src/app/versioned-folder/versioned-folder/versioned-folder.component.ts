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
import { PermissionsResponse, SecurableDomainType, Uuid, VersionedFolderDetail, VersionedFolderDetailResponse } from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';
import { ContainerDefaultProfileForm, FormState } from '@mdm/model/editable-forms';
import { AnnotationViewOption, TabCollection, TabDescriptor } from '@mdm/model/ui.model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import { MessageHandlerService, MessageService, SecurityHandlerService, SharedService, StateHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { UIRouterGlobals } from '@uirouter/angular';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mdm-versioned-folder',
  templateUrl: './versioned-folder.component.html',
  styleUrls: ['./versioned-folder.component.scss']
})
export class VersionedFolderComponent extends ProfileBaseComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  parentId: Uuid;
  detail: VersionedFolderDetail;

  activeTab: TabDescriptor;
  editor: FormState<VersionedFolderDetail, ContainerDefaultProfileForm<VersionedFolderDetail>>;
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
    resources: MdmResourcesService,
    private messages: MessageService,
    private shared: SharedService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private title: Title,
    dialog: MatDialog,
    messageHandler: MessageHandlerService,
    editingService: EditingService) {
    super(resources, dialog, editingService, messageHandler);
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

  showForm() {
    this.editor.show();
  };

  cancel() {
    this.editor?.cancel();
  }

  save() {
    this.resourcesService.versionedFolder
      .update(
        this.catalogueItem.id,
        {
          id: this.catalogueItem.id,
          description: this.editor.form.description?.value ?? ''
        })
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
        this.editor.finish(this.detail);
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
    this.resourcesService.versionedFolder
      .get(id)
      .subscribe((response: VersionedFolderDetailResponse) => {
        this.setupDetails(response.body);
        this.createFormState();
      });
  }

  private setupDetails(value: VersionedFolderDetail) {
    this.detail = value;
    this.catalogueItem = this.detail;
    this.access = this.securityHandler.elementAccess(this.detail);

    if (this.shared.isLoggedIn(true)) {
      this.checkPermissions(this.detail.id);
      // TODO: load profiles once backend supports it
      // this.UsedProfiles(ModelDomainType.VERSIONED_FOLDERS, id);
      // this.UnUsedProfiles(ModelDomainType.VERSIONED_FOLDERS, id);
    }
  }

  private createFormState() {
    this.editor = new FormState(this.detail, new ContainerDefaultProfileForm());

    this.editor.onShow
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.editingService.start();
      });

    this.editor.onCancel
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.editingService.stop();
      });

    this.editor.onFinish
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.editingService.stop());
  }

  private checkPermissions(id: Uuid) {
    this.resourcesService.security
      .permissions(SecurableDomainType.VersionedFolders, id)
      .subscribe((response: PermissionsResponse) => {
        Object
          .keys(response.body)
          .forEach((attrname) => {
            this.catalogueItem[attrname] = response.body[attrname];
          });
      });
  }
}
