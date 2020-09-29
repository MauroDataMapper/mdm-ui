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
  ChangeDetectorRef
} from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { TermResult } from '@mdm/model/termModel';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.scss']
})
export class TermComponent implements OnInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  terminology = null;
  term: TermResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  result: TermResult;
  hasResult = false;
  showEditForm = false;
  editForm = null;
  constructor(
    private resources: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private broadcast: BroadcastService,
    private changeRef: ChangeDetectorRef,
    private title: Title
  ) { }

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    if (!this.stateService.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }
    // tslint:disable-next-line: deprecation
    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }
    // tslint:disable-next-line: deprecation
    this.parentId = this.stateService.params.id;
    this.title.setTitle('Term');
    this.termDetails(this.parentId);
    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
      this.showSearch = message;
    });
    this.afterSave = (result: { body: { id: any } }) => this.termDetails(result.body.id);
  }

  termDetails = async id => {
    const terms = [];

    terms.push(this.resources.terminology.get(this.stateService.params.terminologyId));
    terms.push(this.resources.terminology.terms.get(this.stateService.params.terminologyId, this.stateService.params.id));

    forkJoin(terms).subscribe((results: any) => {
      this.terminology = results[0].body;
      this.term = results[1].body;

      this.resources.catalogueItem.listSemanticLinks(DOMAIN_TYPE.Term, this.term.id).subscribe(resp => {
        this.term.semanticLinks = resp.body.items;
      });

      this.term.finalised = this.terminology.finalised;
      this.term.editable = this.terminology.editable;

      this.term.classifiers = this.term.classifiers || [];
      this.term.terminology = this.terminology;
      this.activeTab = this.getTabDetailByName(
        // tslint:disable-next-line: deprecation
        this.stateService.params.tabView
      );
      this.result = this.term;
      if (this.result.terminology) { this.hasResult = true; }
      this.messageService.FolderSendMessage(this.result);
      this.messageService.dataChanged(this.result);
      this.changeRef.detectChanges();
    });

    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;
    this.tabSelected(this.activeTab);
  };

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'properties':
        return { index: 0, name: 'properties' };
      case 'comments':
        return { index: 1, name: 'comments' };
      case 'links':
        return { index: 2, name: 'links' };
      case 'attachments':
        return { index: 3, name: 'attachments' };

      default:
        return { index: 0, name: 'properties' };
    }
  }

  Save(updatedResource) {
    this.broadcast.broadcast('$elementDetailsUpdated', updatedResource);
  }
  openEditForm = (formName) => {
    this.showEditForm = true;
    this.editForm = formName;
  };

  closeEditForm = () => {
    this.showEditForm = false;
    this.editForm = null;
  };

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'properties' };
      case 1:
        return { index: 1, name: 'comments' };
      case 2:
        return { index: 2, name: 'links' };
      case 3:
        return { index: 3, name: 'attachments' };
      default:
        return { index: 0, name: 'properties' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go(
      'term',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
    this.activeTab = tab.index;
  }
}
