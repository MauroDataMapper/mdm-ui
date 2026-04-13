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
import {
  AfterViewChecked,
  OnDestroy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { UIRouterGlobals } from '@uirouter/core';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { McSelectPagination } from '../utility/mc-select/mc-select.component';
import { Subscription } from 'rxjs';
import {
  BroadcastService,
  MessageHandlerService,
  MessageService,
  SecurityHandlerService
} from '@mdm/services';
import { MatTabGroup, MatTab, MatTabContent, MatTabLabel } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';
import {
  ModelUpdatePayload,
  Term,
  TerminologyDetail,
  TerminologyDetailResponse
} from '@maurodatamapper/mdm-resources';
import { TabCollection } from '@mdm/model/ui.model';
import { Access } from '@mdm/model/access';

import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';
import { HistoryComponent } from '../shared/history/history.component';
import { AttachmentListComponent } from '../shared/attachment-list/attachment-list.component';
import { AnnotationListComponent } from '../shared/annotation-list/annotation-list.component';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatFormField } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout/flex';
import { ConstraintsRulesComponent } from '../constraints-rules/constraints-rules.component';
import { TermRelationshipTypeListComponent } from './term-relationship-type-list/term-relationship-type-list.component';
import { TermListComponent } from './term-list/term-list.component';
import { SkeletonBadgeComponent } from '../utility/skeleton-badge/skeleton-badge.component';
import { ProfileDataViewComponent } from '../shared/profile-data-view/profile-data-view.component';
import { ModelHeaderComponent } from '../model-header/model-header.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NgIf } from '@angular/common';

@Component({
    selector: 'mdm-terminology',
    templateUrl: './terminology.component.html',
    styleUrls: ['./terminology.component.sass'],
    standalone: true,
    imports: [NgIf, MatProgressBar, ModelHeaderComponent, MatTabGroup, MatTab, MatTabContent, ProfileDataViewComponent, MatTabLabel, SkeletonBadgeComponent, TermListComponent, TermRelationshipTypeListComponent, ConstraintsRulesComponent, FlexModule, MatFormField, MatSelect, FormsModule, MatOption, AnnotationListComponent, AttachmentListComponent, HistoryComponent]
})
export class TerminologyComponent
  implements OnInit, OnDestroy, AfterViewChecked {
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
  subscription: Subscription;
  rulesItemCount = 0;
  isLoadingRules = true;
  historyItemCount = 0;
  isLoadingHistory = true;
  showEdit = false;
  showDelete = false;
  showEditDescription = false;
  access: Access;
  tabs = new TabCollection([
    'description',
    'terms',
    'relationship-types',
    'rules',
    'annotations',
    'history'
  ]);

  isLoadingTerms = true;
  termsItemCount = 0;
  isLoadingRelationshipTypes = true;
  relationshipTypesItemCount = 0;

  constructor(
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private title: Title,
    private resources: MdmResourcesService,
    private messageService: MessageService,
    private broadcastService: BroadcastService,
    private messageHandler: MessageHandlerService,
    private editingService: EditingService
  ) {}

  ngOnInit() {
    const id: string = this.uiRouterGlobals.params.id;
    if (!id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.activeTab = this.tabs.getByName(
      this.uiRouterGlobals.params.tabView as string
    ).index;
    this.tabSelected(this.activeTab);

    this.terminology = null;
    this.diagram = null;
    this.title.setTitle('Terminology');
    this.resources.terminology
      .get(id)
      .subscribe((result: TerminologyDetailResponse) => {
        const data = result.body;

        this.access = this.securityHandler.elementAccess(data);
        this.showEdit = this.access.showEdit;
        this.showDelete
          = this.access.showPermanentDelete || this.access.showSoftDelete;
        this.terminology = data;
        this.editingService.setTabGroupClickEvent(this.tabGroup);
        this.terminology.classifiers = this.terminology.classifiers || [];
      });
  }

  ngAfterViewChecked(): void {
    if (
      this.tabGroup
      && !this.editingService.isTabGroupClickEventHandled(this.tabGroup)
    ) {
      this.editingService.setTabGroupClickEvent(this.tabGroup);
    }
  }

  save(saveItems: Array<DefaultProfileItem>) {
    const resource: ModelUpdatePayload = {
      id: this.terminology.id,
      domainType: this.terminology.domainType
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      resource[item.propertyName] = item.value;
    });

    this.resources.terminology.update(this.terminology.id, resource).subscribe(
      (res: TerminologyDetailResponse) => {
        this.messageHandler.showSuccess('Terminology updated successfully.');
        this.terminology = res.body;
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem updating the Terminology.',
          error
        );
      }
    );
  }

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go(
      'terminology',
      { tabView: tab.name },
      { notify: false }
    );
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  // This fetch function needs to be a property-based function because it is passed as a property to the
  // mdm-select component for searching for terms
  fetch = (text: string, loadAll, offset: number, limit: number) => {
    limit = limit ? limit : 30;
    offset = offset ? offset : 0;
    this.pagination = {
      limit,
      offset
    };

    this.searchTerm = text;
    return this.resources.terms.search(this.terminology.id, {
      search: encodeURIComponent(text),
      limit,
      offset
    });
  };

  onTermSelect(term: Term) {
    this.stateHandler.Go(
      'term',
      { terminologyId: term.model, id: term.id },
      null
    );
  }

  onTermAdd(term: Term) {
    this.onTermSelect(term);
  }

  onTermDelete() {
    this.broadcastService.reloadCatalogueTree();
  }

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

  termsCountEmitter($event) {
    this.isLoadingTerms = false;
    this.termsItemCount = $event;
  }

  relationshipTypesCountEmitter($event) {
    this.isLoadingRelationshipTypes = false;
    this.relationshipTypesItemCount = $event;
  }
}
