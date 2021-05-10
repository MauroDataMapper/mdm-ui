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
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { Subscription, forkJoin, Observable } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { EditableTerm } from '@mdm/model/termModel';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { DOMAIN_TYPE } from '@mdm/folders-tree/flat-node';
import { EditingService } from '@mdm/services/editing.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import { TermDetail, TermDetailResponse, TerminologyDetail, TerminologyDetailResponse } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.scss']
})
export class TermComponent
  extends ProfileBaseComponent
  implements OnInit, AfterViewInit {
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
  activeTab: any;
  result: TermDetail;
  hasResult = false;
  showEditForm = false;
  editableForm: EditableTerm;
  descriptionView = 'default';
  showEditDescription = false;
  rulesItemCount = 0;
  isLoadingRules = true;
  showEdit = false;
  showDelete = false;
  access: any;


  constructor(
    resources: MdmResourcesService,
    private messageService: MessageService,
    messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private broadcast: BroadcastService,
    private changeRef: ChangeDetectorRef,
    private title: Title,
    dialog: MatDialog,
    editingService: EditingService,
    private securityHandler: SecurityHandlerService
  ) {
    super(resources, dialog, editingService, messageHandler);
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
    this.termDetails(this.parentId);
    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }


  termDetails(id: string) {
    const terminologyId: string = this.uiRouterGlobals.params.terminologyId;

    forkJoin([
      this.resourcesService.terminology.get(terminologyId) as Observable<TerminologyDetailResponse>,
      this.resourcesService.terms.get(terminologyId, id) as Observable<TermDetailResponse>
    ])
      .subscribe(([terminology, term]) => {
        this.terminology = terminology.body;
        this.term = term.body;

        this.resourcesService.catalogueItem
          .listSemanticLinks(DOMAIN_TYPE.Term, this.term.id)
          .subscribe((resp) => {
            this.term.semanticLinks = resp.body.items;
          });

        this.catalogueItem = this.term;
        this.watchTermObject();

        this.UsedProfiles('term', this.term.id);
        this.UnUsedProfiles('term', this.term.id);

        this.term.finalised = this.terminology.finalised;
        this.term.editable = this.terminology.editable;

        this.term.classifiers = this.term.classifiers || [];
        this.term.terminology = this.terminology;
        this.activeTab = this.getTabDetailByName(
          this.uiRouterGlobals.params.tabView
        );

        this.editableForm = new EditableTerm();
        this.editableForm.visible = false;
        this.editableForm.deletePending = false;
        this.setEditableForm();

        this.editableForm.show = () => {
          this.editableForm.visible = true;
        };

        this.editableForm.cancel = () => {
          this.editingService.stop();
          this.setEditableForm();
        };

        this.result = this.term;
        if (this.result.terminology) {
          this.hasResult = true;
        }
        this.messageService.FolderSendMessage(this.result);
        this.messageService.dataChanged(this.result);
        this.changeRef.detectChanges();
      });

    this.activeTab = this.getTabDetailByName(
      this.uiRouterGlobals.params.tabView
    ).index;
    this.tabSelected(this.activeTab);
  };

  setEditableForm() {
    this.editableForm.visible = false;
    this.editableForm.validationError = false;
    this.editableForm.description = this.term.description;
    this.editableForm.url = this.term.url;
    if (this.term.classifiers) {
      this.term.classifiers.forEach((item) => {
        this.editableForm.classifiers.push(item);
      });
    }
    if (this.term.aliases) {
      this.term.aliases.forEach((item) => {
        this.editableForm.aliases.push(item);
      });
    }
  }

  watchTermObject() {
    this.access = this.securityHandler.elementAccess(this.term);
    if (this.access !== undefined) {
      this.showEdit = this.access.showEdit;
      this.showDelete = this.access.showPermanentDelete || this.access.showSoftDelete;
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'description':
        return { index: 0, name: 'description' };
      case 'links':
        return { index: 1, name: 'links' };
      case 'attachments':
        return { index: 2, name: 'attachments' };
      case 'rules':
        return { index: 3, name: 'rules' };

      default:
        return { index: 0, name: 'description' };
    }
  }

  Save(updatedResource) {
    this.broadcast.broadcast('$elementDetailsUpdated', updatedResource);
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'description' };
      case 1:
        return { index: 1, name: 'links' };
      case 2:
        return { index: 2, name: 'attachments' };
      case 3:
        return { index: 3, name: 'rules' };
      default:
        return { index: 0, name: 'description' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go('term', { tabView: tab.name }, { notify: false });
  }

  onCancelEdit() {
    this.editMode = false; // Use Input editor whe adding a new folder.
  }

  formBeforeSave = () => {
    this.editMode = false;

    const classifiers = [];
    this.editableForm.classifiers.forEach((cls) => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach((alias) => {
      aliases.push(alias);
    });

    this.term['aliases'] = aliases;
    this.term['classifiers'] = classifiers;
    this.term['description'] = this.editableForm.description;

    this.resourcesService.term
      .update(this.term.terminology.id, this.term.id, this.term)
      .subscribe(
        () => {
          this.messageHandler.showSuccess('Term updated successfully.');
          this.editingService.stop();
          this.editableForm.visible = false;
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem updating the Term.',
            error
          );
        }
      );
  };

  showDescription = () => {
    this.editingService.start();
    this.showEditDescription = true;
    this.editableForm.show();
  };

  edit = () => {
    this.showEditDescription = false;
    this.editableForm.show();
  };
}
