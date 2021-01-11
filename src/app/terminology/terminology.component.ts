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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { StateService } from '@uirouter/core';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService } from '../services/broadcast.service';
import { McSelectPagination } from '../utility/mc-select/mc-select.component';
import { MatTabGroup } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';
import { EditableTerm } from '@mdm/model/termModel';

@Component({
  selector: 'mdm-terminology',
  templateUrl: './terminology.component.html',
  styleUrls: ['./terminology.component.sass']
})
export class TerminologyComponent implements OnInit, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  terminology: any;
  diagram: any;
  activeTab: any;
  loadingData: boolean;
  searchTerm: any;
  pagination: McSelectPagination;
  showEditForm = false;
  editForm = null;
  allUsedProfiles: any[] = [];
  descriptionView = 'default';
  currentProfileDetails: any[];
  editableForm: EditableTerm;


  constructor(
    private stateHandler: StateHandlerService,
    private stateService: StateService,
    private title: Title,
    private resources: MdmResourcesService,
    private broadcastSvc: BroadcastService,
    private editingService: EditingService) { }

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    const id = this.stateService.params.id;
    if (!id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }
    this.editableForm = new EditableTerm();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;
    this.terminology = null;
    this.diagram = null;
    this.title.setTitle('Terminology');
    this.resources.terminology.get(id).subscribe(result => {
      const data = result.body;
      this.terminology = data;
      this.terminology.classifiers = this.terminology.classifiers || [];
      // tslint:disable-next-line: deprecation
      this.activeTab = this.getTabDetail(this.stateService.params.tabView);
    });
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  changeProfile() {
    if(this.descriptionView !== 'default' && this.descriptionView !== 'other' && this.descriptionView !== 'addnew') {
      const splitDescription = this.descriptionView.split('/');
      this.resources.profile.profile('referenceDataModels', this.terminology.id, splitDescription[0], splitDescription[1]).subscribe(body => {
        this.currentProfileDetails = body.body;
       });
    } else {
      this.currentProfileDetails = null;
    }
  }

  getTabDetail = tabName => {
    switch (tabName) {
      case 'properties':
        return { index: 0, name: 'properties' };
      case 'comments':
        return { index: 1, name: 'comments' };
      case 'attachments':
        return { index: 2, name: 'attachments' };
      case 'history':
        return { index: 3, name: 'history' };
      default:
        return { index: 0, name: 'properties' };
    }
  };

  getTabDetailIndex = tabIndex => {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'properties' };
      case 1:
        return { index: 1, name: 'comments' };
      case 2:
        return { index: 2, name: 'attachments' };
      case 3:
        return { index: 3, name: 'history' };
      default:
        return { index: 0, name: 'properties' };
    }
  };

  save = (updatedResource?) => {
    this.broadcastSvc.broadcast('$elementDetailsUpdated', updatedResource);
  };

  tabSelected = tabIndex => {
    const tab = this.getTabDetailIndex(tabIndex);
    this.stateHandler.Go(
      'terminologyNew',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
    this[tab.name] = [];
    this.activeTab = tab.index;

    if (this.activeTab && this.activeTab.fetchUrl) {
      this[this.activeTab.name] = [];
      this.loadingData = true;
      // tslint:disable-next-line: deprecation
      this.resources.dataModel.get(this.stateService.params.id, this.activeTab.fetchUrl).then(data => {
        this[this.activeTab.name] = data || [];
        this.loadingData = false;
      });
    }
  };

  openEditForm = formName => {
    this.showEditForm = true;
    this.editForm = formName;
  };

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
    return this.resources.terminology.terms.search(this.terminology.id, { search: encodeURIComponent(text), limit, offset });
  };

  onTermSelect = term => {
    this.stateHandler.NewWindow('term', { terminologyId: term.terminology, id: term.id }, null);
  };
}
