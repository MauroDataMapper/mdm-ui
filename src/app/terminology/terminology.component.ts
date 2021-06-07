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
  AfterViewInit,
  OnDestroy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { UIRouterGlobals } from '@uirouter/core';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService } from '../services/broadcast.service';
import { McSelectPagination } from '../utility/mc-select/mc-select.component';
import { Subscription } from 'rxjs';
import {
  MessageHandlerService,
  MessageService,
  SecurityHandlerService,
  ValidatorService
} from '@mdm/services';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import { CatalogueItemDomainType, ModelUpdatePayload, TerminologyDetail, TerminologyDetailResponse } from '@maurodatamapper/mdm-resources';
import { TabCollection } from '@mdm/model/ui.model';
import { Access } from '@mdm/model/access';
import { TerminologyDetail, TerminologyDetailResponse } from '@maurodatamapper/mdm-resources';
import { ModelUpdatePayload, TerminologyDetail, TerminologyDetailResponse } from '@maurodatamapper/mdm-resources';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';

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
  activeTab: number;
  loadingData: boolean;
  searchTerm: any;
  pagination: McSelectPagination;
  showEditForm = false;
  editForm = null;
  descriptionView = 'default';
  annotationsView = 'default';
  showSearch = false;
  subscription: Subscription;
  rulesItemCount = 0;
  isLoadingRules = true;
  historyItemCount = 0;
  isLoadingHistory = true;
  showEdit = false;
  showDelete = false;
  showEditDescription = false;
  access: Access;
  tabs = new TabCollection(['description', 'rules', 'annotations', 'history']);

  constructor(
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateService: StateService,
    private title: Title,
    resources: MdmResourcesService,
    private broadcast: BroadcastService,
    private messageService: MessageService,
    dialog: MatDialog,
    messageHandler: MessageHandlerService,
    editingService: EditingService,
    validator: ValidatorService
  ) {
    super(resources, dialog, editingService, messageHandler, validator);
  }

  ngOnInit() {
    const id = this.uiRouterGlobals.params.id;
    if (!id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.activeTab = this.tabs.getByName(this.uiRouterGlobals.params.tabView).index;
    this.tabSelected(this.activeTab);

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

    });

    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  save = (updatedResource?) => {
    this.broadcast.dispatch('elementDetailsUpdated', updatedResource);
    };

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go(
      'terminology',
      { tabView: tab.name },
      { notify: false }
    );
  };


  toggleShowSearch() {
    this.messageService.toggleSearch();
  }


  fetch(text, loadAll, offset, limit) {
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

  onTermSelect(term) {
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
}