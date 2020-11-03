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
  ContentChildren,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { DataClassResult, EditableDataClass } from '@mdm/model/dataClassModel';
import { Subscription } from 'rxjs';
import { MessageService } from '@mdm/services/message.service';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from '@mdm/services/validator.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { Title } from '@angular/platform-browser';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';

@Component({
  selector: 'mdm-data-class-details',
  templateUrl: './data-class-details.component.html',
  styleUrls: ['./data-class-details.component.sass']
})
export class DataClassDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('editableText') editForm: QueryList<any>;
  @ContentChildren(MarkdownTextAreaComponent) editForm1: QueryList<any>;

  @Input() editMode = false;
  @Input() afterSave: any;

  result: DataClassResult;
  hasResult = false;
  subscription: Subscription;
  editableForm: EditableDataClass;
  errorMessage = '';
  error = '';
  newMinText: any;
  newMaxText: any;
  showEdit: boolean;
  showFinalise: boolean;
  showPermission: boolean;
  showDelete: boolean;
  deleteInProgress: boolean;
  exporting: boolean;
  showEditMode = false;
  processing = false;
  aliases: any[] = [];
  max: any;
  min: any;
  exportError: any;
  canEditDescription = true;
  showEditDescription = false;

  constructor(
    private messageService: MessageService,
    private resourcesService: MdmResourcesService,
    private validator: ValidatorService,
    private messageHandler: MessageHandlerService,
    private broadcastSvc: BroadcastService,
    private stateHandler: StateHandlerService,
    private title: Title,
    private dialog: MatDialog,
    private securityHandler: SecurityHandlerService
  ) {
    this.DataClassDetails();
  }

  ngOnInit() {
    this.editableForm = new EditableDataClass();
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
      if (this.min === '*') {
        this.min = '-1';
      }

      if (this.max === '*') {
        this.max = '-1';
      }
    };

    this.editableForm.cancel = () => {
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.error = '';

      this.setEditableForm();

      if (this.result.classifiers) {
        this.result.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      this.editableForm.aliases = [];
      this.aliases = [];
      if (this.result.aliases) {
        this.result.aliases.forEach(item => {
          this.aliases.push(item);
          this.editableForm.aliases.push(item);
        });
      }

      if (this.min === '-1') {
        this.min = '*';
      }

      if (this.max === '-1') {
        this.max = '*';
      }
    };
  }



  ngAfterViewInit(): void {
    this.error = '';
    this.editForm.changes.subscribe(() => {
      this.invokeInlineEditor();
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


  DataClassDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(serverResult => {
      this.result = serverResult;


      this.editableForm.description = this.result.description;
      this.editableForm.label = this.result.label;

      if (this.result.classifiers) {
        this.result.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      this.aliases = [];
      if (this.result.aliases) {
        this.result.aliases.forEach(item => {
          this.aliases.push(item);
        });
      }

      if (this.result.minMultiplicity && this.result.minMultiplicity === -1) {
        this.min = '*';
      } else {
        this.min = this.result.minMultiplicity;
      }

      if (this.result.maxMultiplicity && this.result.maxMultiplicity === -1) {
        this.max = '*';
      } else {
        this.max = this.result.maxMultiplicity;
      }

      if (this.result != null) {
        this.hasResult = true;
      }
      this.title.setTitle(`Data Class - ${this.result?.label}`);
      this.watchDataClassObject();
    });
  }

  watchDataClassObject() {
    const access: any = this.securityHandler.elementAccess(this.result);
    if (access !== undefined) {
      this.showEdit = access.showEdit;
      this.showDelete = access.showPermanentDelete || access.showSoftDelete;
      this.canEditDescription = access.canEditDescription;
    }
  }


  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }
  askForPermanentDelete() {

    const promise = new Promise((resolve) => {
      const dialog = this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: 'Permanent deletion',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p>Are you sure you want to <span class='warning'>permanently</span> delete this Data Class?</p>
                    <p class='marginless'><strong>Note:</strong> You are deleting the <strong><i>${this.result.label}</i></strong> Data Class.</p>`
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

  delete() {
    if (!this.result.parentDataClass) {
      this.resourcesService.dataClass.remove(this.result.model, this.result.id).subscribe(() => {
        this.messageHandler.showSuccess('Data Class deleted successfully.');
        this.stateHandler.Go('appContainer.mainApp.twoSidePanel.catalogue.allDataModel');
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      }, error => {
        this.deleteInProgress = false;
        this.messageHandler.showError('There was a problem deleting this Data Class.', error);
      });
    } else {
      this.resourcesService.dataClass.removeChildDataClass(this.result.model, this.result.parentDataClass, this.result.id).subscribe(() => {
        this.messageHandler.showSuccess('Data Class deleted successfully.');
        this.stateHandler.Go('appContainer.mainApp.twoSidePanel.catalogue.allDataModel');
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      }, error => {
        this.deleteInProgress = false;
        this.messageHandler.showError('There was a problem deleting this Data Class.', error);
      });
    }
  }

  formBeforeSave = () => {
    this.error = '';
    this.editMode = false;
    this.errorMessage = '';

    const classifiers = [];
    this.editableForm.classifiers.forEach(cls => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach(alias => {
      aliases.push(alias);
    });
    if (this.validateLabel(this.result.label) && this.validateMultiplicity(this.min, this.max)) {
      if (this.min != null && this.min !== '' && this.max != null && this.max !== '') {
        if (this.newMinText === '*') {
          this.newMinText = -1;
        }

        if (this.max === '*') {
          this.max = -1;
        }
      }
      let resource = {};
      if (!this.showEditDescription) {
        resource = {
          id: this.result.id,
          label: this.editableForm.label,
          description: this.editableForm.description,
          aliases,
          classifiers,
          minMultiplicity: parseInt(this.min, 10),
          maxMultiplicity: parseInt(this.max, 10)
        };
      }

      if (this.showEditDescription) {
        resource = {
          id: this.result.id,
          description: this.editableForm.description || ''
        };
      }

      if (!this.result.parentDataClass) {
        this.resourcesService.dataClass.update(this.result.parentDataModel, this.result.id, resource).subscribe(result => {
          if (this.afterSave) {
            this.afterSave(result);
          }
          this.messageHandler.showSuccess('Data Class updated successfully.');
          this.broadcastSvc.broadcast('$reloadFoldersTree');
          this.editableForm.visible = false;
          this.editForm.forEach(x => x.edit({ editing: false }));
        }, error => {
          this.messageHandler.showError('There was a problem updating the Data Class.', error);
        });
      } else {
        this.resourcesService.dataClass.updateChildDataClass(this.result.model, this.result.parentDataClass, this.result.id, resource).subscribe(result => {
          if (this.afterSave) {
            this.afterSave(result);
          }
          this.messageHandler.showSuccess('Data Class updated successfully.');
          this.broadcastSvc.broadcast('$reloadFoldersTree');
          this.editableForm.visible = false;
          this.editForm.forEach(x => x.edit({ editing: false }));
        }, error => {
          this.messageHandler.showError('There was a problem updating the Data Class.', error);
        });
      }
    }
  };

  validateMultiplicity(minVal, maxVal) {
    let min = '';
    if (minVal != null && minVal !== undefined) {
      min = `${minVal}`;
    }
    let max = '';
    if (maxVal != null && maxVal !== undefined) {
      max = `${maxVal}`;
    }

    const errorMessage = this.validator.validateMultiplicities(min, max);
    if (errorMessage) {
      this.error = errorMessage;
      return false;
    }
    return true;
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  validateLabel(data): any {
    if (!data || (data && data.trim().length === 0)) {
      this.errorMessage = 'DataClass name can not be empty';
      return false;
    } else {
      return true;
    }
  }

  showForm() {
    this.showEditDescription = false;
    this.editableForm.show();
  }

  onCancelEdit() {
    this.errorMessage = '';
    this.error = '';
    this.editMode = false; // Use Input editor whe adding a new folder.
    this.showEditDescription = false;
  }

  onLabelChange(value: any) {
    if (!this.validateLabel(value)) {
      this.editableForm.validationError = true;
    } else {
      this.editableForm.validationError = false;
      this.errorMessage = '';
    }
  }

  isAdmin = () => {
    return this.securityHandler.isAdmin();
  };

  showDescription = () => {
    this.showEditDescription = true;
    this.editableForm.show();
  };

  private setEditableForm() {
    this.editableForm.description = this.result.description;
    this.editableForm.label = this.result.label;
    this.min = this.result.minMultiplicity;
    this.max = this.result.maxMultiplicity;
  }

  private invokeInlineEditor(): void {
    this.editForm.find((inlineEditorComponent: any) => {
      return inlineEditorComponent.name === 'editableText';
    });
  }
}
