/*
Copyright 2020 University of Oxford

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
  AfterViewInit,
  OnDestroy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { StateService } from '@uirouter/core';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService } from '../services/broadcast.service';
import { McSelectPagination } from '../utility/mc-select/mc-select.component';
import { Subscription } from 'rxjs';
import {
  MessageHandlerService,
  MessageService,
  SecurityHandlerService
} from '@mdm/services';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';
import { EditableDataModel } from '@mdm/model/dataModelModel';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import { CatalogueItemDomainType, ModelUpdatePayload, TerminologyDetail, TerminologyDetailResponse } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-terminology',
  templateUrl: './terminology.component.html',
  styleUrls: ['./terminology.component.sass']
})
export class TerminologyComponent
  extends ProfileBaseComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  terminology: TerminologyDetail;
  diagram: any;
  activeTab: any;
  loadingData: boolean;
  searchTerm: any;
  pagination: McSelectPagination;
  showEditForm = false;
  editForm = null;
  descriptionView = 'default';
  editableForm: EditableDataModel;
  showSearch = false;
  subscription: Subscription;
  rulesItemCount = 0;
  isLoadingRules = true;
  historyItemCount = 0;
  isLoadingHistory = true;
  showEdit = false;
  showDelete = false;
  showEditDescription = false;
  access:any;

  constructor(
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private stateService: StateService,
    private title: Title,
    resources: MdmResourcesService,
    private broadcastSvc: BroadcastService,
    private messageService: MessageService,
    dialog: MatDialog,
    messageHandler: MessageHandlerService,
    editingService: EditingService
  ) {
    super(resources, dialog, editingService, messageHandler);
  }

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    const id = this.stateService.params.id;
    if (!id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetail(this.stateService.params.tabView).index;
    this.tabSelected(this.activeTab);

    this.editableForm = new EditableDataModel();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.setEditableForm();
      this.editingService.start();
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.setEditableForm();
    };

    this.terminology = null;
    this.diagram = null;
    this.title.setTitle('Terminology');
    this.resourcesService.terminology.get(id).subscribe((result: TerminologyDetailResponse) => {
      const data = result.body;
      this.catalogueItem = data;

      this.access = this.securityHandler.elementAccess(data);
      this.showEdit = this.access.showEdit;
      this.showDelete = this.access.showPermanentDelete || this.access.showSoftDelete;

      this.UsedProfiles('terminology', id);
      this.UnUsedProfiles('terminology', id);

      this.terminology = data;
      this.terminology.classifiers = this.terminology.classifiers || [];

      this.editableForm.description = this.terminology.description;

      if (this.terminology.aliases) {
        this.terminology.aliases.forEach((item) => {
          this.editableForm.aliases.push(item);
        });
      }
      this.messageService.FolderSendMessage(data);
      this.messageService.dataChanged(data);
    });

    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
  }

  edit = () => {
    this.showEditDescription = false;
    this.editableForm.show();
  };

  setEditableForm() {
    this.editableForm.description = this.terminology.description;
    if (this.terminology.classifiers) {
      this.terminology.classifiers.forEach((item) => {
        this.editableForm.classifiers.push(item);
      });
    }
  }

  formBeforeSave = () => {
    const resource: ModelUpdatePayload = {
      id: this.terminology.id,
      domainType: CatalogueItemDomainType.Terminology,
      description: this.editableForm.description || ''
    };

    this.editingService.stop();

    if (!this.showEditDescription) {
      resource.label = this.editableForm.label;
      resource.author = this.editableForm.author;
      resource.organisation = this.editableForm.organisation;
      resource.type = this.terminology.type;
      resource.classifiers = this.terminology.classifiers;
      resource.aliases = this.editableForm.aliases;
    }

    this.resourcesService.terminology.update(resource.id, resource).subscribe(
      (res: TerminologyDetailResponse) => {
        const result = res.body;

        this.terminology = result;
        this.terminology.aliases = Object.assign({}, result.aliases || []);
        this.terminology.editAliases = Object.assign(
          {},
          this.terminology.aliases
        );

        this.editableForm.visible = false;
        this.editingService.stop();

        this.messageHandler.showSuccess('Terminology updated successfully.');
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem updating the Terminology.',
          error
        );
      }
    );
  };

  onCancelEdit = () => {
    if (this.terminology) {
      this.terminology.editAliases = Object.assign(
        {},
        this.terminology.aliases
      );
      this.showEditDescription = false;
    }
  };

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  getTabDetail = (tabName) => {
    switch (tabName) {
      case 'description':
        return { index: 0, name: 'description' };
      case 'comments':
        return { index: 1, name: 'comments' };
      case 'attachments':
        return { index: 2, name: 'attachments' };
      case 'history':
        return { index: 3, name: 'history' };
      case 'rules':
        return { index: 4, name: 'rules' };
      default:
        return { index: 0, name: 'properties' };
    }
  };

  getTabDetailIndex = (tabIndex) => {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'description' };
      case 1:
        return { index: 1, name: 'comments' };
      case 2:
        return { index: 2, name: 'attachments' };
      case 3:
        return { index: 3, name: 'history' };
      case 4:
        return { index: 4, name: 'rules' };
      default:
        return { index: 0, name: 'description' };
    }
  };

  save = (updatedResource?) => {
    this.broadcastSvc.broadcast('$elementDetailsUpdated', updatedResource);
  };

  tabSelected = (tabIndex) => {
    const tab = this.getTabDetailIndex(tabIndex);
    this.stateHandler.Go(
      'terminology',
      { tabView: tab.name },
      { notify: false }
    );
  };

  openEditForm = (formName) => {
    this.showEditForm = true;
    this.editForm = formName;
  };

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  closeEditForm = () => {
    this.showEditForm = false;
    this.editForm = null;
  };

  fetch = (text, loadAll, offset, limit) => {
    limit = limit ? limit : 30;
    offset = offset ? offset : 0;
    this.pagination = {
      limit,
      offset
    };

    this.searchTerm = text;
    return this.resourcesService.terms.search(this.terminology.id, {
      search: encodeURIComponent(text),
      limit,
      offset
    });
  };

  onTermSelect = (term) => {
    this.stateHandler.Go(
      'term',
      { terminologyId: term.model, id: term.id },
      null
    );
  };

  ngOnDestroy() {
    if (this.subscription) {
      // unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
    }
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  historyCountEmitter($event) {
    this.isLoadingHistory = false;
    this.historyItemCount = $event;
  }

  showDescription = () => {
    this.editingService.start();
    this.showEditDescription = true;
    this.editableForm.show();
  };
}