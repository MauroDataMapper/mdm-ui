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
  ChangeDetectorRef,
  AfterViewChecked
} from '@angular/core';
import { Subscription, forkJoin, Observable } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import { MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import {
  Term,
  CatalogueItemDomainType,
  TermDetail,
  TermDetailResponse,
  TerminologyDetail,
  TerminologyDetailResponse,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';
import { TabCollection } from '@mdm/model/ui.model';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';

@Component({
  selector: 'mdm-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.scss']
})
export class TermComponent
  implements OnInit, AfterViewChecked {

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  terminology: TerminologyDetail = null;
  term: TermDetail;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showExtraTabs = false;
  activeTab: number;
  result: TermDetail;
  hasResult = false;
  showEditForm = false;
  descriptionView = 'default';
  annotationsView = 'default';
  showEditDescription = false;
  rulesItemCount = 0;
  codeSetItemCount = 0;
  relationshipItemCount = 0;
  isLoadingRules = true;
  isLoadingCodeSets = true;
  isLoadingRelationships = true;
  showEdit = false;
  showDelete = false;
  access: Access;
  tabs = new TabCollection(['description', 'links', 'rules', 'annotations']);

  constructor(
    private resources: MdmResourcesService,
    private messageService: MessageService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private changeRef: ChangeDetectorRef,
    private title: Title,
    private editingService: EditingService,
    private securityHandler: SecurityHandlerService
  ) {
  }

  ngOnInit() {
    if (!this.uiRouterGlobals.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }
    if (this.uiRouterGlobals.params.edit === 'true') {
      this.editMode = true;
    }

    this.parentId = this.uiRouterGlobals.params.id;
    this.title.setTitle('Term');

    this.activeTab = this.tabs.getByName(this.uiRouterGlobals.params.tabView as Uuid).index;
    this.tabSelected(this.activeTab);

    this.termDetails(this.parentId);
    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
  }

  ngAfterViewChecked(): void {
    if (this.tabGroup && !this.editingService.isTabGroupClickEventHandled(this.tabGroup)) {
      this.editingService.setTabGroupClickEvent(this.tabGroup);
    }
  }

  rulesCountEmitter(count: number) {
    this.isLoadingRules = false;
    this.rulesItemCount = count;
  }

  termDetails(id: string) {
    const terminologyId: string = this.uiRouterGlobals.params.terminologyId;


    forkJoin([
      this.resources.terminology.get(terminologyId) as Observable<
        TerminologyDetailResponse
      >,
      this.resources.terms.get(terminologyId, id) as Observable<
        TermDetailResponse
      >
    ]).subscribe(([terminology, term]) => {
      this.terminology = terminology.body;
      this.term = term.body;

      this.resources.catalogueItem
        .listSemanticLinks(CatalogueItemDomainType.Term, this.term.id)
        .subscribe((resp) => {
          this.term.semanticLinks = resp.body.items;
        });


      this.watchTermObject();

      this.term.finalised = this.terminology.finalised;
      this.term.editable = this.terminology.editable;

      this.term.classifiers = this.term.classifiers || [];
      this.term.terminology = this.terminology;

      this.result = this.term;
      if (this.result.terminology) {
        this.hasResult = true;
      }
      this.messageService.FolderSendMessage(this.result);
      this.messageService.dataChanged(this.result);
      this.changeRef.detectChanges();
    });
  }

  watchTermObject() {
    this.access = this.securityHandler.elementAccess(this.term);
    if (this.access !== undefined) {
      this.showEdit = this.access.showEdit;
      this.showDelete =
        this.access.showPermanentDelete || this.access.showSoftDelete;
    }
  }


  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go('term', { tabView: tab.name }, { notify: false });
  }

  onCancelEdit() {
    this.editMode = false; // Use Input editor whe adding a new folder.
  }

  save(saveItems: Array<DefaultProfileItem>) {

    const resource: Term = {
      id: this.term.id,
      domainType: this.term.domainType,
      code: this.term.code,
      definition: this.term.definition
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      resource[item.propertyName] = item.value;
    });

    this.resources.term
    .update(this.terminology.id, this.term.id, resource)
    .subscribe(
      (result:TermDetailResponse) => {
        this.termDetails(result.body.id);
        this.messageHandler.showSuccess('Term updated successfully.');
        this.editingService.stop();
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem updating the Term.',
          error
        );
      }
    );
  }

  codeSetCountEmitter(count: number) {
    this.isLoadingCodeSets = false;
    this.codeSetItemCount = count;
  }

  onCodeSetSelect(codeset) {
    this.stateHandler.Go(
      'codeset',
      { id: codeset.id },
      null
    );
  }

  relationshipCountEmitter(count: number) {
    this.isLoadingRelationships = false;
    this.relationshipItemCount = count;
  }

  onTermSelect(term) {
    this.stateHandler.Go(
      'term',
      { terminologyId: term.model, id: term.id },
      null
    );
  }
}
