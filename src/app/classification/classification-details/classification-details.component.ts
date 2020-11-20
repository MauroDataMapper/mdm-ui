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
  QueryList,
  ViewChildren,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { FolderHandlerService } from '@mdm/services/handlers/folder-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { SharedService } from '@mdm/services/shared.service';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { Editable, FolderResult } from '@mdm/model/folderModel';
import { Subscription } from 'rxjs';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { DialogPosition } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mdm-classification-details',
  templateUrl: './classification-details.component.html',
  styleUrls: ['./classification-details.component.sass']
})
export class ClassificationDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() afterSave: any;
  @Input() editMode = false;
  @Input() mcClassification = false;
  @ViewChildren('editableText') editForm: QueryList<any>;
  result: FolderResult;
  hasResult = false;
  subscription: Subscription;
  showSecuritySection: boolean;
  showUserGroupAccess: boolean;
  showEdit: boolean;
  showPermission: boolean;
  showDelete: boolean;
  showSoftDelete: boolean;
  showPermDelete: boolean;
  isAdminUser: boolean;
  isLoggedIn: boolean;
  deleteInProgress: boolean;
  exporting: boolean;
  editableForm: Editable;
  errorMessage = '';
  showEditMode = false;
  processing = false;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private folderHandler: FolderHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private elementDialogueService: ElementSelectorDialogueService,
    private broadcaseSvc: BroadcastService,
    private title: Title,
    private dialog: MatDialog,
  ) {
    // securitySection = false;
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.ClassifierDetails();
  }

  public showAddElementToMarkdown() {
    // Remove from here & put in markdown
    this.elementDialogueService.open(
      'Search_Help',
      'left' as DialogPosition
    );
  }

  ngOnInit() {
    this.editableForm = new Editable();
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
      this.errorMessage = '';
      this.editableForm.label = this.result.label;
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.editableForm.description = this.result.description;
    };

    this.subscription = this.messageService.changeUserGroupAccess.subscribe(
      (message: boolean) => {
        this.showSecuritySection = message;
      }
    );
  }

  ngAfterViewInit(): void {
    this.editForm.changes.subscribe(() => {
      this.invokeInlineEditor();
      // setTimeout work-around prevents Angular change detection `ExpressionChangedAfterItHasBeenCheckedError` https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4

      if (this.editMode) {
        this.editForm.forEach(x =>
          x.edit({
            editing: true,
            focus: x.name === 'moduleName' ? true : false
          })
        );
        this.showForm();
      }
    });
  }

  ClassifierDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(
      serverResult => {
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
          this.watchClassificationObject();
        }
        this.title.setTitle(`Classifier - ${this.result?.label}`);
      }
    );
  }

  watchClassificationObject() {
    const access = this.securityHandler.folderAccess(this.result);
    this.showEdit = access.showEdit;
    this.showPermission = access.showPermission;
    this.showDelete = access.showPermanentDelete || access.showSoftDelete;
    this.showPermDelete = access.showPermanentDelete;
    this.showSoftDelete = access.showSoftDelete;
  }

  toggleSecuritySection() {
    this.messageService.toggleUserGroupAccess();
  }
  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  askForSoftDelete() {
    if (!this.securityHandler.isAdmin()) {
      return;
    }

    this.folderHandler.askForSoftDelete(this.result.id).then(() => {
      this.stateHandler.reload();
    });
  }

  askForPermanentDelete() {
    if (!this.showPermDelete) {
      return;
    }
    const promise = new Promise((resolve) => {
      const dialog = this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: 'Permanent deletion',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p>Are you sure you want to <span class='warning'>permanently</span> delete this Classifier?</p>
                    <p class='marginless'><strong>Note:</strong> You are deleting the <strong><i>${this.result.label}</i></strong> classifier.</p>`
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          return;
        }
        const dialog2 = this.dialog.open(ConfirmationModalComponent, {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message: '<strong>Note: </strong> All its contents will be deleted <span class=\'warning\'>permanently</span>.'
          }
        });

        dialog2.afterClosed().subscribe(result2 => {
          if (result2.status !== 'ok') {
            return;
          }
          resolve(this.delete());
        });
      });
    });

    return promise;
  }

  formBeforeSave = () => {
    this.editMode = false;
    this.errorMessage = '';
    this.editForm.forEach(x => (this.result.label = x.getHotState().value));

    const resource = {
      label: this.editableForm.label,
      description: this.editableForm.description
    };

    if (this.validateLabel(this.editableForm.label)) {
      this.resourcesService.classifier.update(this.result.id, resource).subscribe(result => {
        if (this.afterSave) {
          this.afterSave(result);
        }
        this.messageHandler.showSuccess('Classifier updated successfully.');
        this.editableForm.visible = false;
        this.editForm.forEach(x => x.edit({ editing: false }));
      }, error => {
        this.messageHandler.showError('There was a problem updating the Classifier.', error);
      });
    }
  };

  validateLabel(data): any {
    if (!data || (data && data.trim().length === 0)) {
      this.errorMessage = 'Classification Label can not be empty';
      return false;
    } else {
      return true;
    }
  }

  showForm() {
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

  delete() {
    this.resourcesService.classifier.remove(this.result.id).subscribe(() => {
      this.messageHandler.showSuccess('Classifier deleted successfully.');
      this.broadcaseSvc.broadcast('$reloadFoldersTree');
      this.stateHandler.Go('allDataModel', { reload: true, location: true }, null);
    }, error => {
      this.messageHandler.showError('There was a problem deleting this Classification.', error);
    }
    );
  }

  private invokeInlineEditor(): void {
    this.editForm.find((inlineEditorComponent: any) => {
      return inlineEditorComponent.name === 'editableText';
    });
  }
}
