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
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MatTabGroup } from '@angular/material/tabs';
import { SharedService } from '@mdm/services/shared.service';
import { MessageService } from '@mdm/services/message.service';
import { StateService, UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import { EditableDataModel } from '@mdm/model/dataModelModel';
import { MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { MatDialog } from '@angular/material/dialog';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import { CatalogueItemDomainType, Classifier, ModelUpdatePayload, ReferenceDataModelDetail, ReferenceDataModelDetailResponse, SecurableDomainType } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-reference-data',
  templateUrl: './reference-data.component.html',
  styleUrls: ['./reference-data.component.scss']
})
export class ReferenceDataComponent  extends ProfileBaseComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  referenceModel: ReferenceDataModelDetail;
  showSecuritySection: boolean;
  subscription: Subscription;
  parentId: string;
  isEditable: boolean;
  showExtraTabs = false;
  activeTab: any;
  semanticLinks: any[] = [];
  schemaView = 'list';
  descriptionView = 'default';
  contextView = 'default';
  editableForm: EditableDataModel;
  errorMessage = '';
  showEdit = false;
  showDelete = false;
  access:any;

  typesItemCount = 0;
  isLoadingTypes = true;
  dataItemCount = 0;
  isLoadingData = true;
  elementsItemCount = 0;
  isLoadingElements = true;
  rulesItemCount = 0;
  isLoadingRules = true;
  showEditDescription = false;

  constructor(
    resourcesService: MdmResourcesService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    editingService: EditingService,
    dialog: MatDialog,
    messageHandler: MessageHandlerService,
    private title: Title
  ) {
    super(resourcesService, dialog, editingService, messageHandler);
  }

  ngOnInit(): void {
    this.parentId = this.uiRouterGlobals.params.id;
    if (!this.parentId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.showExtraTabs = this.sharedService.isLoggedIn();
    this.title.setTitle('Reference Data Model');

    this.referenceModelDetails(this.parentId);
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  typesCountEmitter($event) {
    this.isLoadingTypes = false;
    this.typesItemCount = $event;
  }

  dataCountEmitter($event) {
    this.isLoadingData = false;
    this.dataItemCount = $event;
  }

  elementsCountEmitter($event) {
    this.isLoadingElements = false;
    this.elementsItemCount = $event;
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  referenceModelDetails(id: string) {
    this.resourcesService.referenceDataModel
      .get(id)
      .subscribe((result: ReferenceDataModelDetailResponse) => {
        this.referenceModel = result.body;
        this.catalogueItem = this.referenceModel;
        this.isEditable = this.referenceModel.availableActions.includes(
          'update'
        );
        this.parentId = this.referenceModel.id;

        this.editableForm = new EditableDataModel();
        this.editableForm.visible = false;
        this.editableForm.deletePending = false;

        this.watchRefDataModelObject();

        this.editableForm.show = () => {
          this.editingService.start();
          this.editableForm.visible = true;
        };

        this.editableForm.cancel = () => {
          this.editingService.stop();

          this.editableForm.visible = false;
          this.editableForm.validationError = false;
          this.errorMessage = '';
          this.setEditableFormData();
          if (this.referenceModel.classifiers) {
            this.referenceModel.classifiers.forEach((item) => {
              this.editableForm.classifiers.push(item);
            });
          }
          if (this.referenceModel.aliases) {
            this.referenceModel.aliases.forEach((item) => {
              this.editableForm.aliases.push(item);
            });
          }
        };

        this.UsedProfiles('referenceDataModels',this.referenceModel.id);
        this.UnUsedProfiles('referenceDataModels',this.referenceModel.id);

        if (this.sharedService.isLoggedIn(true)) {
          this.ReferenceModelPermissions(id);
        } else {
          this.messageService.dataChanged(this.referenceModel);
          this.messageService.FolderSendMessage(this.referenceModel);
        }
        this.messageService.dataChanged(this.referenceModel);

        if (this.tabGroup) {
          this.tabGroup.realignInkBar();
        }
        this.activeTab = this.getTabDetailByName(
          this.uiRouterGlobals.params.tabView
        ).index;
        this.tabSelected(this.activeTab);
      });
  }

  ReferenceModelPermissions(id: any) {
    this.resourcesService.security
      .permissions(SecurableDomainType.ReferenceDataModels, id)
      .subscribe((permissions: { body: { [x: string]: any } }) => {
        Object.keys(permissions.body).forEach((attrname) => {
          this.referenceModel[attrname] = permissions.body[attrname];
        });
        // Send it to message service to receive in child components
        this.messageService.FolderSendMessage(this.referenceModel);
        this.messageService.dataChanged(this.referenceModel);
      });
  }

  onCancelEdit() {
    this.errorMessage = '';
    this.showEditDescription = false;
    this.editingService.stop();
  }

  showDescription = () => {
    this.editingService.start();
    this.showEditDescription = true;
    this.editableForm.show();
  };

  setEditableFormData() {
    this.editableForm.description = this.referenceModel.description;
    this.editableForm.label = this.referenceModel.label;
    this.editableForm.organisation = this.referenceModel.organisation;
    this.editableForm.author = this.referenceModel.author;
  }

  formBeforeSave = () => {
    this.errorMessage = '';
    this.editingService.stop();

    const classifiers: Classifier[] = [];
    this.editableForm.classifiers.forEach((cls) => {
      classifiers.push(cls);
    });
    const aliases: string[] = [];
    this.editableForm.aliases.forEach((alias) => {
      aliases.push(alias);
    });

    let resource: ModelUpdatePayload = {
      id: this.referenceModel.id,
      domainType: CatalogueItemDomainType.ReferenceDataModel,
      description: this.editableForm.description || ''
    };

    if (!this.showEditDescription) {
      resource.label = this.editableForm.label;
      resource.author = this.editableForm.author;
      resource.organisation = this.editableForm.organisation;
      resource.type = this.referenceModel.type;
      resource.aliases = aliases;
      resource.classifiers = classifiers;
    }    

    this.resourcesService.referenceDataModel
      .update(this.referenceModel.id, resource)
      .subscribe(
        (res) => {
          this.referenceModel.description = res.body.description;
          this.messageHandler.showSuccess(
            'Reference Data Model updated successfully.'
          );
          this.editingService.stop();
          this.editableForm.visible = false;
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem updating the Reference Data Model.',
            error
          );
        }
      );
  };

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe(); // unsubscribe to ensure no memory leaks
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'description':
        return { index: 0, name: 'description' };
      case 'elements':
        return { index: 1, name: 'elements' };
      case 'types':
        return { index: 2, name: 'types' };
      case 'data':
        return { index: 3, name: 'data' };
      case 'comments':
        return { index: 4, name: 'comments' };
      case 'history':
        return { index: 5, name: 'history' };
      case 'attachments':
        return { index: 6, name: 'attachments' };
      case 'rules':
        return { index: 7, name: 'rules' };
      default:
        return { index: 0, name: 'description' };
    }
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'description' };
      case 1:
        return { index: 1, name: 'elements' };
      case 2:
        return { index: 2, name: 'types' };
      case 3:
        return { index: 3, name: 'data' };
      case 4:
        return { index: 4, name: 'comments' };
      case 5:
        return { index: 5, name: 'history' };
      case 6:
        return { index: 6, name: 'attachments' };
      case 7:
        return { index: 7, name: 'rules' };
      default:
        return { index: 0, name: 'description' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go(
      'referencedatamodel',
      { tabView: tab.name },
      { notify: false }
    );
    this.activeTab = tab.index;
  }

  watchRefDataModelObject() {
    this.access = this.securityHandler.elementAccess(this.referenceModel);
    if (this.access !== undefined) {
      this.showEdit = this.access.showEdit;
      this.showDelete = this.access.showPermanentDelete || this.access.showSoftDelete;
    }
  }

  edit = () => {
    this.showEditDescription = false;
    this.editableForm.show();
   };
}
