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
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';

@Component({
  selector: 'mdm-data-class-details',
  templateUrl: './data-class-details.component.html',
  styleUrls: ['./data-class-details.component.sass']
})
export class DataClassDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  result: DataClassResult;
  hasResult = false;
  subscription: Subscription;
  editableForm: EditableDataClass;
  @Input() afterSave: any;
  @ViewChildren('editableText') editForm: QueryList<any>;
  @ContentChildren(MarkdownTextAreaComponent) editForm1: QueryList<any>;
  @ViewChildren('editableMinText') editFormMinText: QueryList<any>;
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
  @Input() editMode = false;
  aliases: any[] = [];
  max: any;
  min: any;
  exportError: any;

  constructor(
    private messageService: MessageService,
    private resourcesService: MdmResourcesService,
    private validator: ValidatorService,
    private messageHandler: MessageHandlerService,
    private broadcastSvc: BroadcastService,
    private stateHandler: StateHandlerService,
    private title: Title,
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
          focus: x._name === 'moduleName' ? true : false
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

  private setEditableForm() {
    this.editableForm.description = this.result.description;
    this.editableForm.label = this.result.label;
    this.min = this.result.minMultiplicity;
    this.max = this.result.maxMultiplicity;
  }

  ngAfterViewInit(): void {
    this.error = '';
    // Subscription emits changes properly from component creation onward & correctly invokes `this.invokeInlineEditor` if this.inlineEditorToInvokeName is defined && the QueryList has members
    this.editForm.changes.subscribe((queryList: QueryList<any>) => {
      this.invokeInlineEditor();
      // setTimeout work-around prevents Angular change detection `ExpressionChangedAfterItHasBeenCheckedError` https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4

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

  private invokeInlineEditor(): void {
    const inlineEditorToInvoke = this.editForm.find(
      (inlineEditorComponent: any) => {
        return inlineEditorComponent.name === 'editableText';
      }
    );
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
            // this.editableForm.aliases.push(item);
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
      }
    );
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  delete() {
    this.resourcesService.dataClass.delete(this.result.parentDataModel, this.result.parentDataClass, this.result.id).subscribe(() => {
      this.messageHandler.showSuccess('Data Class deleted successfully.');
      this.stateHandler.Go('dataModel', { id: this.result.parentDataModel, reload: true, location: true }, null);
      this.broadcastSvc.broadcast('$reloadFoldersTree');
    },
    error => {
      this.deleteInProgress = false;
      this.messageHandler.showError('There was a problem deleting the Data Model.', error);
    });
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
      if (this.min != null && this.min !== '' && this.max != null && this.max !== '' ) {
        if (this.newMinText === '*') {
          this.newMinText = -1;
        }

        if (this.max === '*') {
          this.max = -1;
        }
      }
      const resource = {
        id: this.result.id,
        label: this.editableForm.label,
        description: this.editableForm.description,
        aliases,
        classifiers,
        minMultiplicity: parseInt(this.min, 10),
        maxMultiplicity: parseInt(this.max, 10)
      };
      this.resourcesService.dataClass.put(
          this.result.parentDataModel,
          this.result.parentDataClass,
          resource.id,
          null,
          { resource }
        ).subscribe(result => {
            if (this.afterSave) {
              this.afterSave(result);
            }
            this.messageHandler.showSuccess('Data Class updated successfully.');
            this.broadcastSvc.broadcast('$reloadFoldersTree');
            this.editableForm.visible = false;
            this.editForm.forEach(x => x.edit({ editing: false }));
          },
          error => {
            this.messageHandler.showError('There was a problem updating the Data Class.', error);
          }
        );
    }
  };

  validateMultiplicity(minVal, maxVal) {
    let min = '';
    if (minVal != null && minVal !== undefined) {
      min = minVal + '';
    }
    let max = '';
    if (maxVal != null && maxVal !== undefined) {
      max = maxVal + '';
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
    this.editableForm.show();
  }

  onCancelEdit() {
    this.errorMessage = '';
    this.error = '';
    this.editMode = false; // Use Input editor whe adding a new folder.
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
  }
}
