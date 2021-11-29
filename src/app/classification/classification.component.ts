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
  Input,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '../services/message.service';
import { SharedService } from '../services/shared.service';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { MatTabGroup } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';
import { MessageHandlerService } from '@mdm/services';
import { TabCollection } from '@mdm/model/ui.model';
import { CatalogueItemDomainType, ClassifierDetail, ClassifierDetailResponse, SecurableDomainType, Uuid } from '@maurodatamapper/mdm-resources';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';
import { BaseComponent } from '@mdm/shared/base/base.component';

@Component({
  selector: 'mdm-classification',
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.sass']
})
export class ClassificationComponent
  extends BaseComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  @Input() afterSave: any;
  @Input() editMode = false;

  @Input() mcClassification;
  classifier = null;

  result: ClassifierDetail;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  activeTab: number;
  catalogueItemsCount: any;
  terminologiesCount: any;
  termsCount: any;
  codeSetsCount: any;
  loading = false;
  catalogueItems: any;
  tabs = new TabCollection(['description', 'classifiedElements', 'annotations', 'history']);

  annotationsView = 'default';
  descriptionView = 'default';

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private title: Title,
    private editingService: EditingService,
    private messageHandler: MessageHandlerService) {
    super();
  }

  ngOnInit() {
    if (!this.uiRouterGlobals.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (this.uiRouterGlobals.params.edit === 'true') {
      this.editMode = true;
    }


    this.title.setTitle('Classifier');
    this.classifierDetails(this.uiRouterGlobals.params.id as string);

    this.subscription = this.messageService.changeUserGroupAccess.subscribe(
      (message: boolean) => {
        this.showSecuritySection = message;
      }
    );

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
    this.afterSave = (result: { body: { id: Uuid } }) =>
      this.classifierDetails(result.body.id);

    this.activeTab = this.tabs.getByName(this.uiRouterGlobals.params.tabView as string).index;
    this.tabSelected(this.activeTab);
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }


  classifierDetails(id: Uuid) {
    this.resourcesService.classifier
      .get(id)
      .subscribe((response: ClassifierDetailResponse) => {
        this.result = response.body;
        this.result.domainType = CatalogueItemDomainType.Classifier;
        this.catalogueItem = this.result;

        this.parentId = this.result.id;

        // Will Be added later
        // this.ClassifierUsedProfiles(this.result.id);
        // this.ClassifierUnUsedProfiles(this.result.id);

        if (this.sharedService.isLoggedIn(true)) {
          this.classifierPermissions(id);
        } else {
          this.messageService.FolderSendMessage(this.result);
          this.messageService.dataChanged(this.result);
        }
      });
  }

  classifierPermissions(id: Uuid) {
    this.resourcesService.security
      .permissions(SecurableDomainType.Classifiers, id)
      .subscribe((permissions: { body: { [x: string]: any } }) => {
        Object.keys(permissions.body).forEach((attrname) => {
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

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go('classification', { tabView: tab.name }, { notify: false });
  }

  save(saveItems: Array<DefaultProfileItem>) {

    const resource = {
      id: this.result.id
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      resource[item.propertyName] = item.value;
    });


    this.resourcesService.classifier.update(this.result.id, resource).subscribe(
      (result: ClassifierDetailResponse) => {
        this.messageHandler.showSuccess('Classifier updated successfully.');
        this.editingService.stop();
        this.result = result.body;
        this.catalogueItem = result.body;
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem updating the Classifier.',
          error
        );
      }
    );
  }
}
