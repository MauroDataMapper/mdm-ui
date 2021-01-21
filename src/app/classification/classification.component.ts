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
import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FolderResult } from '../model/folderModel';
import { Subscription } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '../services/message.service';
import { SharedService } from '../services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { MatTabGroup } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-classification',
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.sass']
})
export class ClassificationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  @Input() afterSave: any;
  @Input() editMode = false;

  @Input() mcClassification;
  classifier = null;

  result: FolderResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  activeTab: any;
  catalogueItemsCount: any;
  terminologiesCount: any;
  termsCount: any;
  codeSetsCount: any;
  loading = false;
  catalogueItems: any;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private title: Title,
    private editingService: EditingService) { }

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
    this.title.setTitle('Classifier');
    // tslint:disable-next-line: deprecation
    this.classifierDetails(this.stateService.params.id);

    // const promises = [];
    // promises.push(this.resourcesService.classifier.listCatalogueItemsFor(this.stateService.params.id))
    // this.resourcesService.classifier.get(
    //   this.stateService.params.id,
    //   'catalogueItems',
    //   null
    // )
    // );
    // promises.push([]
    // this.resourcesService.classifier.listForCatalogueItem('terminologies', this.stateService.params.id)
    // this.resourcesService.classifier.get(
    //   this.stateService.params.id,
    //   'terminologies',
    //   null
    // )
    // );
    // promises.push(this.resourcesService.classifier.listForCatalogueItem('terms', this.stateService.params.id));
    // this.resourcesService.classifier.get(this.stateService.params.id, 'terms', null)
    // promises.push(
    //   // this.resourcesService.classifier.listForCatalogueItem('codeSets', this.stateService.params.id)
    //   // this.resourcesService.classifier.get(this.stateService.params.id, 'codeSets', null)
    // );

    // forkJoin(promises).subscribe((results: any) => {
    //   console.log(results);
    //   this.catalogueItemsCount = results[0].body.count;
    //   this.terminologiesCount = results[1].body.count;
    //   this.termsCount = results[2].body.count;
    //   this.codeSetsCount = results[3].body.count;

    //   this.loading = false;
    //   this.activeTab = this.getTabDetail('classifiedElements');
    // });

    // this.resourcesService.classifier.listCatalogueItemsFor(this.stateService.params.id).subscribe(result => {

    // });

    this.subscription = this.messageService.changeUserGroupAccess.subscribe(
      (message: boolean) => {
        this.showSecuritySection = message;
      }
    );
    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
    this.afterSave = (result: { body: { id: any } }) => this.classifierDetails(result.body.id);

    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView);
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  classifierDetails(id: any) {
    this.resourcesService.classifier.get(id).subscribe((response: { body: FolderResult }) => {
      this.result = response.body;

      this.parentId = this.result.id;
      if (this.sharedService.isLoggedIn(true)) {
        this.classifierPermissions(id);
      } else {
        this.messageService.FolderSendMessage(this.result);
        this.messageService.dataChanged(this.result);
      }
    });
  }
  classifierPermissions(id: any) {
    this.resourcesService.security.permissions('classifiers', id).subscribe((permissions: { body: { [x: string]: any } }) => {
      Object.keys(permissions.body).forEach(attrname => {
        this.result[attrname] = permissions.body[attrname];
      });
      // Send it to message service to receive in child components
      this.messageService.FolderSendMessage(this.result);
      this.messageService.dataChanged(this.result);
    });
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    if (this.subscription) {
      // unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
    }
  }

  tabSelected(itemsName) {
    this.getTabDetail(itemsName);
    // this.stateHandler.Go("folder", { tabView: tab.name }, { notify: false, location: tab.index !== 0 });
  }

  getTabDetail(tabIndex) {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'access' };
      case 1:
        return { index: 1, name: 'history' };
      default:
        return { index: 0, name: 'access' };
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'classifiedElements':
        return { index: 0, name: 'classifiedElements' };
      case 'classifiedTerminologies':
        return { index: 1, name: 'classifiedTerminologies' };
      case 'classifiedTerms':
        return { index: 2, name: 'classifiedTerms' };
      case 'classifiedCodeSets':
        return { index: 3, name: 'classifiedCodeSets' };
      case 'history': {
        let index = 4;
        if (this.terminologiesCount === 0) {
          index--;
        }
        if (this.termsCount === 0) {
          index--;
        }
        if (this.codeSetsCount === 0) {
          index--;
        }
        return { index, name: 'history' };
      }
    }
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'classifiedElements' };
      case 1:
        return { index: 1, name: 'classifiedTerminologies' };
      case 2:
        return { index: 2, name: 'classifiedTerms' };
      case 3:
        return { index: 3, name: 'classifiedCodeSets' };
      case 4:
        return { index: 4, name: 'history' };
      default:
        return { index: 0, name: 'classifiedElements' };
    }
  }
}
