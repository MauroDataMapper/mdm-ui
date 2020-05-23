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
import { Component, OnInit } from '@angular/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { StateService } from '@uirouter/core';
import { Title } from '@angular/platform-browser';
import { ResourcesService } from '../services/resources.service';
import { BroadcastService } from '../services/broadcast.service';
import { SharedService } from '../services/shared.service';
import { McSelectPagination } from '../utility/mc-select/mc-select.component';

@Component({
  selector: 'mdm-terminology',
  templateUrl: './terminology.component.html',
  styleUrls: ['./terminology.component.sass']
})
export class TerminologyComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private stateHandler: StateHandlerService,
    private stateService: StateService,
    private title: Title,
    private resources: ResourcesService,
    private broadcastSvc: BroadcastService
  ) {}

  terminology: any;
  diagram: any;
  activeTab: any;
  loadingData: boolean;
  searchTerm: any;
  pagination: McSelectPagination;


  showEditForm = false;
  editForm = null;

  ngOnInit() {
    const id = this.stateService.params.id;

    if (!id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.terminology = null;
    this.diagram = null;

    this.title.setTitle('Terminology');

    this.resources.terminology.get(id, null).subscribe(result => {
      const data = result.body;
      this.terminology = data;
      this.terminology.classifiers = this.terminology.classifiers || [];
      if (this.sharedService.isLoggedIn()) {
        // this.resources.terminology.get(id, 'permissions').subscribe((result) => {
        //    const permissions = result.body;
        //    permissions.forEach((attrName) => {
        //        this.terminology[attrName] = permissions[attrName];
        //    });
        // });
      }
      this.activeTab = this.getTabDetail(this.stateService.params.tabView);
    });
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
      this.resources.dataModel
        .get(this.stateService.params.id, this.activeTab.fetchUrl)
        .then(data => {
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
    // var deferred = $q.defer();

    limit = limit ? limit : 30;
    offset = offset ? offset : 0;


    this.pagination = {
        limit,
        offset
      };

    this.searchTerm = text;

    return this.resources.terminology.get(this.terminology.id, 'terms/search', {
      queryStringParams: {
        search: encodeURIComponent(text),
        limit,
        offset
      }
    });
  };

  onTermSelect = term => {
    this.stateHandler.NewWindow(
      'term',
      { terminologyId: term.terminology, id: term.id },
      null
    );
  }
}
