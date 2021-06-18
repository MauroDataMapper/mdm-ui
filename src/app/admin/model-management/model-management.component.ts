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
import { Component, OnInit } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ContainerDomainType } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-model-management',
  templateUrl: './model-management.component.html',
  styleUrls: ['./model-management.component.sass'],
})
export class ModelManagementComponent implements OnInit {
  filterElement: string;
  filterStatus = 'all';
  selectedElements: Array<any>;
  selectedElementsCount = 0;
  reloading = false;
  deleteInProgress = false;
  deleteSuccessMessage: string;
  folders: any;

  constructor(
    private resourcesService: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog,
    private title: Title
  ) { }

  ngOnInit() {
    this.selectedElements = [];
    this.selectedElementsCount = 0;
    this.filterStatus = 'all';
    this.filterElement = '';
    this.loadFolders();
    this.title.setTitle('Model management');
  }

  onFilterChange = () => {
    // if (this.filterElement === '') {
    //   this.filterStatus = '';
    // }
    this.loadFolders();
  };

  loadFolders = () => {
    this.reloading = true;
    const options = {
      queryStringParams: {
        includeDocumentSuperseded: true,
        includeModelSuperseded: true,
        includeDeleted: true,
      },
    };
    let url = this.resourcesService.tree.list(ContainerDomainType.Folders, options.queryStringParams);

    if (this.filterStatus === 'all') {
      url = this.resourcesService.tree.list(ContainerDomainType.Folders, options.queryStringParams);
    } else if (this.filterStatus === 'includeDeleted') {
      url = this.resourcesService.admin.deletedModels('folders', 'dataModels');
    } else if (this.filterStatus === 'includeDocumentSuperseded') {
      url = this.resourcesService.admin.documentationSupersededModels('folders', 'dataModels');
    } else if (this.filterStatus === 'includeModelSuperseded') {
      url = this.resourcesService.admin.modelSupersededModels('folders', 'dataModels');
    }

    url.subscribe((resp) => {
      this.folders = {
        children: resp.body,
        isRoot: true,
      };
      for (const entry of this.folders.children) {
        entry.checked = false;
        this.markChildren(entry);
      }
      this.reloading = false;
    }, (err) => {
      this.reloading = false;
      this.messageHandler.showError('There was a problem loading tree.', err);
    });
  };

  markChildren = (node) => {
    if (this.selectedElements) {
      if (this.selectedElements[node.id]) {
        node.checked = true;
      }
    }

    if (node.children) {
      for (const entry of node.children) {
        this.markChildren(entry);
      }
    }
  };

  onNodeChecked = (node) => {
    const currentIdx = this.selectedElements.findIndex(
      (x) => x.node.id === node.node.id
    );
    if (currentIdx === -1) {
      this.selectedElements.push(node);
      this.selectedElementsCount++;
      this.removeChildren(node);
    } else {
      this.selectedElements.splice(currentIdx, 1);
      this.selectedElementsCount--;
      this.removeChildren(node);
    }
  };

  resetSettings = () => {
    this.loadFolders();
    this.selectedElements = [];
    this.selectedElementsCount = 0;
    this.deleteSuccessMessage = null;
  };

  askForPermanentDelete() {
    if (!this.securityHandler.isAdmin()) {
      this.messageHandler.showError('Only Admins are allowed to delete records!');
      return;
    }

    let message = 'Are you sure you want to <span class=\'warning\'>permanently</span> delete these records?';
    if (this.selectedElementsCount === 1) {
      message = 'Are you sure you want to <span class=\'warning\'>permanently</span> delete this record?';
    }

    let confirmTitle = 'Are you sure you want to delete these records?';
    const confirmMessage = `<p class='marginless'><strong>Note: </strong>All 'Data Classes', 'Data Elements' and 'Data Types'
                          <p class='marginless'>will be deleted <span class='warning'>permanently</span>.</p>`;
    if (this.selectedElementsCount === 1) {
      confirmTitle = 'Are you sure you want to delete this record?';
    }

    this.dialog
      .openDoubleConfirmationAsync({
        data: {
          title: 'Delete permanently',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message,
        }
      }, {
        data: {
          title: confirmTitle,
          okBtnTitle: 'Confirm deletion',
          btnType: 'warn',
          message: confirmMessage,
        }
      })
      .subscribe(() => this.delete(true));
  }

  delete(permanent?) {
    const dataModelResources = {
      permanent,
      ids: [],
    };

    for (const id in this.selectedElements) {
      if (this.selectedElements[id].domainType === 'DataModel') {
        dataModelResources.ids.push(this.selectedElements[id].id);
      }
    }

    this.deleteInProgress = true;
    this.resourcesService.dataModel.removeAll({}, { body: dataModelResources }).subscribe(() => {
      if (permanent) {
        this.deleteSuccessMessage = `${this.selectedElementsCount} Data Model(s) deleted successfully.`;
        this.deleteInProgress = false;

        setTimeout(() => {
          this.resetSettings();
        }, 2000);
      } else {
        this.deleteSuccessMessage = `${this.selectedElementsCount} Data Model(s) marked as deleted successfully.`;
        this.deleteInProgress = false;

        setTimeout(() => {
          this.resetSettings();
        }, 2000);
      }
    }, (error) => {
      this.deleteInProgress = false;
      this.messageHandler.showError('There was a problem deleting the Data Model(s).', error);
    });
  }

  askForSoftDelete() {
    if (!this.securityHandler.isAdmin()) {
      this.messageHandler.showError('Only Admins are allowed to delete records!');
      return;
    }

    let title = 'Are you sure you want to delete these records?';
    let message = `<p class="marginless">They will be marked as deleted and will not be viewable by users</p>
                   <p class="marginless">except Administrators.</p>`;
    if (this.selectedElementsCount === 1) {
      title = 'Are you sure you want to delete this record?';
      message = `<p class="marginless">It will be marked as deleted and will not be viewable by users</p>
                 <p class="marginless">except Administrators.</p>`;
    }

    this.dialog
      .openConfirmationAsync({
        data: {
          title,
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message,
        }
      })
      .subscribe(() => this.delete(false));
  }

  private removeChildren(node: any) {
    if (node.hasChildren && node.children) {
      let i = 0;
      while (i < node.children.length) {
        const childIdx = this.selectedElements.findIndex((y) => y.node.id === node.children[i].id);
        if (childIdx >= 0) {
          this.selectedElements.splice(childIdx, 1);
          this.selectedElementsCount--;
        }
        i++;
      }
    }
  }
}
