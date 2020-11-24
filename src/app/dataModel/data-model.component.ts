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
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Subscription } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '../services/message.service';
import { SharedService } from '../services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { DataModelResult, EditableDataModel } from '../model/dataModelModel';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-data-model',
  templateUrl: './data-model.component.html',
  styleUrls: ['./data-model.component.scss']
})
export class DataModelComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  @ViewChildren('editableText') editForm: QueryList<any>;
  dataModel: DataModelResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  isEditable: boolean;
  showExtraTabs = false;
  activeTab: any;
  dataModel4Diagram: any;
  cells: any;
  rootCell: any;
  semanticLinks: any[] = [];

  editableForm: EditableDataModel;
  errorMessage = '';
  displayedColumns = ['author', 'description', 'organisation', 'type', 'classifications'];

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
    this.showExtraTabs = this.sharedService.isLoggedIn();
    // tslint:disable-next-line: deprecation
    this.parentId = this.stateService.params.id;

    this.title.setTitle('Data Model');

    this.dataModelDetails(this.parentId);

    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
      this.showSearch = message;
    });
    // this.afterSave = (result: { body: { id: any } }) => this.dataModelDetails(result.body.id);
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  dataModelDetails(id: any) {
    let arr = [];
    this.resourcesService.dataModel.get(id).subscribe(async (result: { body: DataModelResult }) => {
      this.dataModel = result.body;
      this.dataModel.description = 'Proin scelerisque ante sed lorem pretium fringilla. Etiam tempor imperdiet velit vel tempor. Aenean imperdiet tortor et laoreet aliquet. Integer consequat lobortis est vel auctor. Duis pulvinar tincidunt velit, in pharetra nibh. Quisque vestibulum metus quis eros rutrum, quis tempor velit ornare. In id efficitur urna. Aenean aliquet sem blandit nibh suscipit mattis. Suspendisse eget consectetur ex. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla gravida neque id pharetra dignissim.';

      id = result.body.id;

      this.isEditable = this.dataModel['availableActions'].includes('update');
      this.parentId = this.dataModel.id;

      await this.resourcesService.versionLink.list('dataModels', this.dataModel.id).subscribe(response => {
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
      } else {
        this.messageService.FolderSendMessage(this.dataModel);
        this.messageService.dataChanged(this.dataModel);
      }

      this.tabGroup.realignInkBar();
      // tslint:disable-next-line: deprecation
      this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;
      this.tabSelected(this.activeTab);

      this.editableForm = new EditableDataModel();
      this.editableForm.visible = false;
      this.editableForm.deletePending = false;

      this.editableForm.show = () => {
        this.editForm.forEach(x =>
          x.edit({
            editing: true,
            focus: x.name === 'moduleName' ? true : false
          })
        );
        this.editableForm.visible = true;
      };

      this.editableForm.cancel = () => {
        this.editForm.forEach(x => x.edit({ editing: false }));
        this.editableForm.visible = false;
        this.editableForm.validationError = false;
        this.errorMessage = '';
        this.setEditableFormData();
        if (this.dataModel.classifiers) {
          this.dataModel.classifiers.forEach(item => {
            this.editableForm.classifiers.push(item);
          });
        }
        if (this.dataModel.aliases) {
          this.dataModel.aliases.forEach(item => {
            this.editableForm.aliases.push(item);
          });
        }
      };

      if (this.dataModel.classifiers) {
        this.dataModel.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.dataModel.aliases) {
        this.dataModel.aliases.forEach(item => {
          this.editableForm.aliases.push(item);
        });
      }
    });
  }

  async DataModelPermissions(id: any) {
    await this.resourcesService.security.permissions('dataModels', id).subscribe((permissions: { body: { [x: string]: any } }) => {
      Object.keys(permissions.body).forEach(attrname => {
        this.dataModel[attrname] = permissions.body[attrname];
      });
      // Send it to message service to receive in child components
      this.messageService.FolderSendMessage(this.dataModel);
      this.messageService.dataChanged(this.dataModel);
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

  getTabDetailByName(tabName) {
    console.log(tabName);
    switch (tabName) {
      case 'description':
        return { index: 0, name: 'description' };
      case 'schema':
        return { index: 1, name: 'schema' };
      case 'types':
        return { index: 2, name: 'types' };
      case 'history':
        if (this.dataModel.type === 'Data Asset') {
          return { index: 4, name: 'history' };
        }
        return { index: 3, name: 'history' };
      case 'context':
        if (this.dataModel.type === 'Data Asset') {
          return { index: 3, name: 'context' };
        }
      case 'rulesConstraints' : {
        return { index: 10, name: 'rulesConstraints' };
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
        if (this.dataModel.type === 'Data Asset') {
          return { index: 3, name: 'context' };
        } else {
          return { index: 3, name: 'history' };
        }
      case 4: {
        if (this.dataModel.type === 'Data Asset') {
          return { index: 4, name: 'history' };
        }
        break;
      }
      case 10 : {
        return { index: 10, name: 'rulesConstraints' };
      }
      default:
        return { index: 0, name: 'description' };
    }
  }

  tabSelected(index) {
    console.log(index);
    const tab = this.getTabDetailByIndex(index);

    this.stateHandler.Go('dataModel', { tabView: tab.name }, { notify: false });
    this.activeTab = tab.index;

    if (tab.name === 'diagram') {
      return;
    }
  }

  private setEditableFormData() {
    this.editableForm.description = this.dataModel.description;
    this.editableForm.label = this.dataModel.label;
    this.editableForm.organisation = this.dataModel.organisation;
    this.editableForm.author = this.dataModel.author;
  }
}
