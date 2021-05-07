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
import { FolderResult, Editable } from '../model/folderModel';
import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  ViewChildren,
  QueryList,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../services/message.service';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { FolderHandlerService } from '../services/handlers/folder-handler.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { SharedService } from '../services/shared.service';
import { BroadcastService } from '../services/broadcast.service';
import { DialogPosition, MatDialog } from '@angular/material/dialog';
import { ElementSelectorDialogueService } from '../services/element-selector-dialogue.service';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { EditingService } from '@mdm/services/editing.service';
import { SecurityModalComponent } from '@mdm/modals/security-modal/security-modal.component';

@Component({
  selector: 'mdm-folder-detail',
  templateUrl: './folder-detail.component.html',
  styleUrls: ['./folder-detail.component.scss']
})
export class FolderDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() afterSave: any;
  @Input() editMode = false;
  @ViewChildren('editableText') editForm: QueryList<any>;
  result: FolderResult;
  hasResult = false;
  subscription: Subscription;
  showSecuritySection: boolean;
  showUserGroupAccess: boolean;
  showEdit: boolean;
  showPermission: boolean;
  showDelete: boolean;
  showPermDelete: boolean;
  showSoftDelete: boolean;
  isAdminUser: boolean;
  isLoggedIn: boolean;
  deleteInProgress: boolean;
  exporting: boolean;
  editableForm: Editable;
  errorMessage = '';
  showEditMode = false;
  processing: boolean;


  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private securityHandler: SecurityHandlerService,
    private messageHandlerService: MessageHandlerService ,
    private folderHandler: FolderHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private elementDialogueService: ElementSelectorDialogueService,
    private broadcastSvc: BroadcastService,
    private title: Title,
    private editingService: EditingService,
    private dialog: MatDialog) {
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.FolderDetails();
  }

  public showAddElementToMarkdown() {
    // Remove from here & put in markdown
    this.elementDialogueService.open('Search_Help', 'left' as DialogPosition);
  }

  ngOnInit() {
    this.editableForm = new Editable();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.editForm.forEach(x =>
        x.edit({
          editing: true,
          focus: x._name === 'moduleName' ? true : false
        })
      );
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.errorMessage = '';
      this.editableForm.label = this.result.label;
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.editableForm.description = this.result.description;
    };

    this.subscription = this.messageService.changeUserGroupAccess.subscribe((message: boolean) => {
      this.showSecuritySection = message;
    });
  }

  ngAfterViewInit(): void {
    // Subscription emits changes properly from component creation onward & correctly invokes `this.invokeInlineEditor` if this.inlineEditorToInvokeName is defined && the QueryList has members
    this.editForm.changes.subscribe(() => {
      if (this.editMode) {
        this.editForm.forEach(x =>
          x.edit({
            editing: true,
            focus: x._name === 'moduleName' ? true : false
          })
        );
        this.showForm();
      }
    });
  }


  FolderDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(serverResult => {
        this.result = serverResult;
        this.editableForm.label = this.result.label;
        this.editableForm.description = this.result.description;
        const access: any = this.securityHandler.folderAccess(this.result);
        this.showEdit = access.showEdit;
        this.showPermission = access.showPermission;
        this.showDelete = access.showPermanentDelete || access.showSoftDelete;
        this.showPermDelete = access.showPermanentDelete;
        this.showSoftDelete = access.showSoftDelete;
        if (this.result != null) {
          this.hasResult = true;
          this.watchFolderObject();
        }
        this.title.setTitle('Folder - ' + this.result?.label);
      }
    );
  }

  watchFolderObject() {
    const access = this.securityHandler.folderAccess(this.result);
    this.showEdit = access.showEdit;
    this.showPermission = access.showPermission;
    this.showDelete = access.showPermanentDelete || access.showSoftDelete;
    this.showPermDelete = access.showPermanentDelete;
    this.showSoftDelete = access.showSoftDelete;
  }

  toggleSecuritySection() {
    this.dialog.open(SecurityModalComponent, {
      data: {
        element: 'result',
        domainType: 'Folder'
      }, panelClass: 'security-modal'
    });
  }
  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  askForSoftDelete() {
    if (!this.showDelete) {
      return;
    }

    this.folderHandler
      .askForSoftDelete(this.result.id)
      .subscribe(() => {
        this.stateHandler.reload();
      });
  }

  askForPermanentDelete(): any {
    if (!this.showPermDelete) {
      return;
    }

    this.folderHandler
      .askForPermanentDelete(this.result.id)
      .subscribe(() => {
        this.broadcastSvc.broadcast('$reloadFoldersTree');
        this.stateHandler.Go('appContainer.mainApp.twoSidePanel.catalogue.allDataModel');
      });
  }

  formBeforeSave = () => {
    this.editMode = false;
    this.errorMessage = '';

    const resource = {
      id: this.result.id,
      label: this.editableForm.label,
      description: this.editableForm.description
    };

    if (this.validateLabel(this.result.label)) {
      this.resourcesService.folder.update(resource.id, resource).subscribe(result => {
          if (this.afterSave) {
            this.afterSave(result);
          }
          this.messageHandlerService.showSuccess('Folder updated successfully.');
          this.editingService.stop();
          this.editableForm.visible = false;
          this.editForm.forEach(x => x.edit({ editing: false }));
          this.broadcastSvc.broadcast('$reloadFoldersTree');
          this.stateHandler.reload();
        }, error => {
          this.messageHandlerService.showError('There was a problem updating the Folder.', error);
      });
    }
  };

  validateLabel(data): any {
    if (!data || (data && data.trim().length === 0)) {
      this.errorMessage = 'DataModel name can not be empty';
      return false;
    } else {
      return true;
    }
  }

  showForm() {
    this.editingService.start();
    this.editableForm.show();
  }

  onCancelEdit() {
    this.editMode = false; // Use Input editor whe adding a new folder.
    this.errorMessage = '';
  }

  onLabelChange(value: any) {
    if (!this.validateLabel(value)) {
      this.editableForm.validationError = true;
    } else {
      this.editableForm.validationError = false;
    }
  }
}
