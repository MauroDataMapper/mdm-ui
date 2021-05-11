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
AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '../services/message.service';
import { SharedService } from '../services/shared.service';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { EditableDataModel } from '../model/dataModelModel';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import { DataModelDetail, DataModelDetailResponse, ModelUpdatePayload, SecurableDomainType } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-data-model',
  templateUrl: './data-model.component.html',
  styleUrls: ['./data-model.component.scss']
})
export class DataModelComponent
  extends ProfileBaseComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  @ViewChildren('editableText') editForm: QueryList<any>;
  dataModel: DataModelDetail;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;

  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  isEditable: boolean;
  showExtraTabs = false;
  showEdit = false;
  showDelete = false;
  activeTab: any;
  dataModel4Diagram: any;
  cells: any;
  rootCell: any;
  semanticLinks: any[] = [];
  access:any;

  editableForm: EditableDataModel;
  errorMessage = '';

  schemaView = 'list';

  contextView = 'default';
  schemaItemCount = 0;
  typesItemCount = 0;
  isLoadingSchema = true;
  isLoadingTypes = true;
  rulesItemCount = 0;
  isLoadingRules = true;
  historyItemCount = 0;
  isLoadingHistory = true;
  showEditDescription = false;

  constructor(
    resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private title: Title,
    dialog: MatDialog,
    messageHandler: MessageHandlerService,
    editingService: EditingService
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
    this.showExtraTabs = this.sharedService.isLoggedIn();
    this.parentId = this.uiRouterGlobals.params.id;

    this.activeTab = this.getTabDetailByName(this.uiRouterGlobals.params.tabView).index;
    this.tabSelected(this.activeTab);

    this.title.setTitle('Data Model');

    this.dataModelDetails(this.parentId);

    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
    // this.afterSave = (result: { body: { id: any } }) => this.dataModelDetails(result.body.id);
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  watchDataModelObject() {
    this.access = this.securityHandler.elementAccess(this.dataModel);
    if ( this.access !== undefined) {
      this.showEdit =  this.access.showEdit;
      this.showDelete =  this.access.showPermanentDelete ||  this.access.showSoftDelete;
    }
  }

  dataModelDetails(id: any) {
    let arr = [];

    this.resourcesService.dataModel
      .get(id)
      .subscribe(async (result: DataModelDetailResponse) => {
        console.log(result.body);
        this.dataModel = result.body;
        this.catalogueItem = this.dataModel;
        this.watchDataModelObject();
        id = result.body.id;

        this.isEditable = this.dataModel.availableActions?.includes('update');
        this.parentId = this.dataModel.id;

        await this.resourcesService.versionLink
          .list('dataModels', this.dataModel.id)
          .subscribe((response) => {
            if (response.body.count > 0) {
              arr = response.body.items;
              for (const val in arr) {
                if (this.dataModel.id !== arr[val].targetModel.id) {
                  this.semanticLinks.push(arr[val]);
                }
              }
            }
          });

        if (this.sharedService.isLoggedIn(true)) {
          this.DataModelPermissions(id);
          this.UsedProfiles('dataModels', id);
          this.UnUsedProfiles('dataModels', id);
        } else {
          this.messageService.FolderSendMessage(this.dataModel);
          this.messageService.dataChanged(this.dataModel);
        }

        this.editableForm = new EditableDataModel();
        this.editableForm.visible = false;
        this.editableForm.deletePending = false;
        this.setEditableFormData();

        this.editableForm.show = () => {
          this.editingService.start();
          this.editForm.forEach((x) =>
            x.edit({
              editing: true,
              focus: x.name === 'moduleName' ? true : false
            })
          );
          this.editableForm.visible = true;
        };

        this.editableForm.cancel = () => {
          this.editForm.forEach((x) => x.edit({ editing: false }));
          this.editableForm.visible = false;
          this.editableForm.validationError = false;
          this.editingService.stop();
          this.errorMessage = '';
          this.setEditableFormData();
          if (this.dataModel.classifiers) {
            this.dataModel.classifiers.forEach((item) => {
              this.editableForm.classifiers.push(item);
            });
          }
          if (this.dataModel.aliases) {
            this.dataModel.aliases.forEach((item) => {
              this.editableForm.aliases.push(item);
            });
          }
        };

        if (this.dataModel.classifiers) {
          this.dataModel.classifiers.forEach((item) => {
            this.editableForm.classifiers.push(item);
          });
        }
        if (this.dataModel.aliases) {
          this.dataModel.aliases.forEach((item) => {
            this.editableForm.aliases.push(item);
          });
        }
      });
  }

  async DataModelPermissions(id: any) {
    await this.resourcesService.security
      .permissions(SecurableDomainType.DataModels, id)
      .subscribe((permissions: { body: { [x: string]: any } }) => {
        Object.keys(permissions.body).forEach((attrname) => {
          this.dataModel[attrname] = permissions.body[attrname];
        });
        // Send it to message service to receive in child components
        this.messageService.FolderSendMessage(this.dataModel);
        this.messageService.dataChanged(this.dataModel);
      });
  }

  formBeforeSave = () => {
    this.editMode = false;
    this.errorMessage = '';
    this.editingService.stop();

    const classifiers = [];
    this.editableForm.classifiers.forEach(cls => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach(alias => {
      aliases.push(alias);
    });

    const resource: ModelUpdatePayload = {
      id: this.dataModel.id,
      domainType: this.dataModel.domainType,
      description: this.editableForm.description || ''
    };

    if (!this.showEditDescription) {
      resource.label = this.editableForm.label;
      resource.author = this.editableForm.author;
      resource.organisation = this.editableForm.organisation;
      resource.type = this.dataModel.type;
      resource.aliases = aliases;
      resource.classifiers = classifiers;
    }

    this.resourcesService.dataModel.update(this.dataModel.id, resource).subscribe((res: DataModelDetailResponse) => {
      this.messageHandler.showSuccess('Data Model updated successfully.');
      this.editableForm.visible = false;
      this.dataModel.description = res.body.description;
        this.editForm.forEach((x) => x.edit({ editing: false }));
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem updating the Data Model.',
          error
        );
      }
    );
  };


  onCancelEdit() {
    this.errorMessage = '';
    this.editMode = false; // Use Input editor whe adding a new folder.
    this.showEditDescription = false;
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

  schemaCountEmitter($event) {
    this.isLoadingSchema = false;
    this.schemaItemCount = $event;
  }

  typesCountEmitter($event) {
    this.isLoadingTypes = false;
    this.typesItemCount = $event;
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  historyCountEmitter($event) {
    this.isLoadingHistory = false;
    this.historyItemCount = $event;
  }

  addDataClass = () => {
    this.stateHandler.Go('newDataClass', { parentDataModelId: this.dataModel.id, parentDataClassId: null }, null);
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

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'description':
        return { index: 0, name: 'description' };
      case 'schema':
        return { index: 1, name: 'schema' };
      case 'types':
        return { index: 2, name: 'types' };
      case 'context':
        return { index: 3, name: 'context' };
      case 'history':
        return { index: 4, name: 'history' };
      case 'rulesConstraints' : {
        return { index: 5, name: 'rulesConstraints' };
      }
      default:
        return { index: 0, name: 'description' };
    }
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'description' };
      case 1:
        return { index: 1, name: 'schema' };
      case 2:
        return { index: 2, name: 'types' };
      case 3:
        return { index: 3, name: 'context' };
      case 4: {
        return { index: 4, name: 'history' };
      }
      case 5 : {
        return { index: 5, name: 'rulesConstraints' };
      }
      default:
        return { index: 0, name: 'description' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go('dataModel', { tabView: tab.name }, { notify: false });
  }

  private setEditableFormData() {
    this.editableForm.description = this.dataModel.description;
    this.editableForm.label = this.dataModel.label;
    this.editableForm.organisation = this.dataModel.organisation;
    this.editableForm.author = this.dataModel.author;
  }
}
