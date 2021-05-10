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
  Input,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { Editable } from '../model/folderModel';
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
import { MatDialog } from '@angular/material/dialog';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import { ClassifierDetail, ClassifierDetailResponse, SecurableDomainType } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-classification',
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.sass']
})
export class ClassificationComponent
  extends ProfileBaseComponent
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
  activeTab: any;
  catalogueItemsCount: any;
  terminologiesCount: any;
  termsCount: any;
  codeSetsCount: any;
  loading = false;
  catalogueItems: any;

  descriptionView = 'default';
  editableForm: Editable;

  constructor(
    resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private title: Title,
    editingService: EditingService,
    messageHandler: MessageHandlerService,
    dialog: MatDialog
  ) {
    super(resourcesService, dialog, editingService, messageHandler);
  }

  ngOnInit() {
    if (!this.uiRouterGlobals.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (this.uiRouterGlobals.params.edit === 'true') {
      this.editMode = true;
    }

    this.editableForm = new Editable();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.editingService.start();
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editableForm.label = this.result.label;
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.editableForm.description = this.result.description;
    };

    this.title.setTitle('Classifier');
    this.classifierDetails(this.uiRouterGlobals.params.id);

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
    this.afterSave = (result: { body: { id: any } }) =>
      this.classifierDetails(result.body.id);

    this.activeTab = this.getTabDetailByName(this.uiRouterGlobals.params.tabView);
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  showForm() {
    this.editingService.start();
    this.editableForm.show();
  }

  onCancelEdit() {
    this.editMode = false; // Use Input editor whe adding a new folder.
  }

  classifierDetails(id: any) {
    this.resourcesService.classifier
      .get(id)
      .subscribe((response: ClassifierDetailResponse) => {
        this.result = response.body;
        this.catalogueItem = this.result;

        this.parentId = this.result.id;
        this.editableForm.description = this.result.description;

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
  classifierPermissions(id: any) {
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

  tabSelected(itemsName) {
    this.getTabDetail(itemsName);
    // this.stateHandler.Go("folder", { tabView: tab.name }, { notify: false, location: tab.index !== 0 });
  }

  edit = () => {
     this.editableForm.show();
  };

  formBeforeSave = () => {
    this.editMode = false;
    this.editingService.stop();

    const resource = {
      id: this.result.id,
      description: this.editableForm.description
    };

    this.resourcesService.classifier.update(this.result.id, resource).subscribe(
      (result: ClassifierDetailResponse) => {
        this.messageHandler.showSuccess('Classifier updated successfully.');
        this.editingService.stop();
        this.editableForm.visible = false;
        this.result = result.body;
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem updating the Classifier.',
          error
        );
      }
    );
  };

  getTabDetail(tabIndex) {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'description' };
      case 1:
        return { index: 1, name: 'classifiedElements' };
      case 2:
        return { index: 2, name: 'history' };
      default:
        return { index: 0, name: 'access' };
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'description':
        return { index: 0, name: 'description' };
      case 'classifiedElements':
        return { index: 1, name: 'classifiedElements' };
      case 'history':
        return { index: 2, name: 'history' };
      default:
        return { index: 0, name: 'description' };
    }
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'description' };
      case 1:
        return { index: 1, name: 'classifiedElements' };
      case 2:
        return { index: 2, name: 'history' };
      default:
        return { index: 0, name: 'description' };
    }
  }
}
