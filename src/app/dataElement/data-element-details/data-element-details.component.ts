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
import { Subscription } from 'rxjs';
import { MessageService } from '@mdm/services/message.service';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from '@mdm/services/validator.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { DataElementResult, EditableDataElement } from '@mdm/model/dataElementModel';
import { McSelectPagination } from '@mdm/utility/mc-select/mc-select.component';
import { Title } from '@angular/platform-browser';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { GridService } from '@mdm/services/grid.service';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';

@Component({
  selector: 'mdm-data-element-details',
  templateUrl: './data-element-details.component.html',
  styleUrls: ['./data-element-details.component.sass']
})
export class DataElementDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  result: DataElementResult;
  hasResult = false;
  subscription: Subscription;
  editableForm: EditableDataElement;
  @Input() afterSave: any;
  @ViewChildren('editableText') editForm: QueryList<any>;
  @ContentChildren(MarkdownTextAreaComponent) editForm1: QueryList<any>;
  @ViewChildren('editableMinText') editFormMinText: QueryList<any>;
  @Input() parentDataModel;
  @Input() parentDataClass;
  pagination: McSelectPagination;
  errorMessage = '';
  error = '';
  dataTypeErrors = '';
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
  exportError: any;
  @Input() editMode = false;
  aliases: any[] = [];
  max: any;
  min: any;
  showNewInlineDataType = false;
  newInlineDataType = null;
  dataTypes: any;
  isValid = false;
  newlyAddedDataType = {
    label: '',
    description: '',

    metadata: [],
    domainType: 'PrimitiveType',
    enumerationValues: [],
    classifiers: [],
    referencedDataClass: '',
    referencedTerminology: ''
  };

  canEditDescription = true;
  showEditDescription = false;

  constructor(
    private messageService: MessageService,
    private resourcesService: MdmResourcesService,
    private validator: ValidatorService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private title: Title,
    private broadcastSvc: BroadcastService,
    private gridService: GridService,
    private dialog: MatDialog,
    private securityHandler: SecurityHandlerService
  ) {
    this.DataElementDetails();
  }

  toggleShowNewInlineDataType() {
    this.showNewInlineDataType = !this.showNewInlineDataType;
    this.error = '';
    this.dataTypeErrors = '';
  }

  ngOnInit() {
    // TODO  - check if this is actually used?
    // if (this.parentDataModel) {
    //   this.fetchDataTypes(null, null, null, null).subscribe(result => {
    //     this.dataTypes = result.body.items;
    //   });
    // }
    this.editableForm = new EditableDataElement();
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

      this.editableForm.label = this.result.label;
      this.editableForm.description = this.result.description;
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
    // Subscription emits changes properly from component creation onward & correctly invokes `this.invokeInlineEditor` if this.inlineEditorToInvokeName is defined && the QueryList has members
    this.editForm.changes.subscribe((queryList: QueryList<any>) => {
      this.invokeInlineEditor();
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
    this.editForm.find((inlineEditorComponent: any) => {
      return inlineEditorComponent.name === 'editableText';
    });
  }

  DataElementDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(serverResult => {
      this.result = serverResult;
      this.editableForm.label = this.result.label;
      this.editableForm.description = this.result.description;
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
      this.title.setTitle(`Data Element - ${this.result?.label}`);
      this.watchDataElementObject();
    });
  }
  watchDataElementObject() {
    const access: any = this.securityHandler.elementAccess(this.result);
    if (access !== undefined) {
      this.showEdit = access.showEdit;
      this.showDelete = access.showPermanentDelete || access.showSoftDelete;
      this.canEditDescription = access.canEditDescription;
    }
  }

  fetchDataTypes = (text, loadAll, offset, limit) => {
    const options = this.gridService.constructOptions(limit, offset, 'label', 'asc', { label: text });
    this.pagination = {
      limit: options['limit'],
      offset: options['offset']
    };
    return this.resourcesService.dataType.list(this.parentDataModel.id, options);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // unsubscribe to ensure no memory leaks
  }
  askForPermanentDelete() {

    const promise = new Promise((resolve, reject) => {
      const dialog = this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: `Permanent deletion`,
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p>Are you sure you want to <span class='warning'>permanently</span> delete this Data Element?</p>
                    <p class='marginless'><strong>Note:</strong> You are deleting the <strong><i>${this.result.label}</i></strong> Data Element.</p>`
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          return;
        }
        const dialog2 = this.dialog.open(ConfirmationModalComponent, {
          data: {
            title: `Confirm permanent deletion`,
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message: `<strong>Note: </strong> All its contents will be deleted <span class='warning'>permanently</span>.`
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
    this.resourcesService.dataElement.remove(this.result.model, this.result.dataClass, this.result.id).subscribe(() => {
      this.messageHandler.showSuccess('Data Class deleted successfully.');
      this.stateHandler.Go('appContainer.mainApp.twoSidePanel.catalogue.allDataModel');
    }, error => {
      this.deleteInProgress = false;
      this.messageHandler.showError('There was a problem deleting the Data Model.', error);
    });
  }

  formBeforeSave() {
    if (!this.validate()) {
      return;
    }

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

      let dataType;
      if (!this.showNewInlineDataType) {
        dataType = { id: this.result.dataType['id'] };
      } else {
        dataType = this.newlyAddedDataType;
      }
      let resource = {};
      if (!this.showEditDescription) {
        resource = {
          id: this.result.id,
          label: this.editableForm.label,
          description: this.editableForm.description || '',
          domainType: this.result.domainType,
          aliases,
          dataType,
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
      this.resourcesService.dataElement.update(this.parentDataModel.id, this.parentDataClass.id, this.result.id, resource).subscribe(result => {
        if (this.afterSave) {
          this.afterSave(result);
        }
        this.messageHandler.showSuccess('Data Element updated successfully.');
        this.broadcastSvc.broadcast('$reloadFoldersTree');
        this.editableForm.visible = false;
        this.editForm.forEach(x => x.edit({ editing: false }));
      }, error => {
        this.messageHandler.showError('There was a problem updating the Data Element.', error);
      });
    }
  }

  validate() {
    let isValid = true;

    if (!this.showNewInlineDataType) {
      return true;
    }
    if (!this.newlyAddedDataType.label || this.newlyAddedDataType.label.trim().length === 0) {
      isValid = false;
    }
    // Check if for EnumerationType, at least one value is added
    if (this.newlyAddedDataType.domainType === 'EnumerationType' && this.newlyAddedDataType.enumerationValues.length === 0) {
      isValid = false;
    }
    // Check if for ReferenceType, the dataClass is selected
    if (this.newlyAddedDataType.domainType === 'ReferenceType' && !this.newlyAddedDataType.referencedDataClass) {
      isValid = false;
    }

    // Check if for TerminologyType, the terminology is selected
    if (this.newlyAddedDataType.domainType === 'TerminologyType' && !this.newlyAddedDataType.referencedTerminology) {
      isValid = false;
    }

    this.isValid = isValid;
    if (!this.isValid) {
      this.dataTypeErrors = '';
      this.dataTypeErrors = 'Please fill in all required values for the new Data Type';
      return false;
    } else {
      return true;
    }
  }

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
      this.errorMessage = 'DataElement name can not be empty';
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

  onDataTypeSelect(dataType) {
    this.result.dataType = dataType;
  }
  isAdmin = () => {
    return this.securityHandler.isAdmin();
  }

  showDescription = () => {
    this.showEditDescription = true;
    this.editableForm.show();
  }
}
