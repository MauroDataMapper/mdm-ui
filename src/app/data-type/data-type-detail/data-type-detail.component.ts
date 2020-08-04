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
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { SharedService } from '@mdm/services/shared.service';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { EditableDataModel } from '@mdm/model/dataModelModel';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-data-type-detail',
  templateUrl: './data-type-detail.component.html',
  styleUrls: ['./data-type-detail.component.scss']
})
export class DataTypeDetailComponent implements OnInit, AfterViewInit {
  @Input() mcDataTypeObject: any;
  @Input() mcParentDataModel: any;
  @Input() afterSave: any;
  @Input() openEditForm: any;
  @Input() hideEditButton: any;
  @ViewChildren('editableText') editForm: QueryList<any>;

  deleteInProgress: boolean; // TODO

  constructor(
    private dialog: MatDialog,
    private sharedService: SharedService,
    private elementTypes: ElementTypesService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private changeRef: ChangeDetectorRef,
    private title: Title
  ) { }

  allDataTypes = this.elementTypes.getAllDataTypesArray();
  allDataTypesMap = this.elementTypes.getAllDataTypesMap();
  editableForm: EditableDataModel;
  errorMessage: any;

  ngOnInit() {
    this.editableForm = new EditableDataModel();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;
    this.editableForm.description = this.mcDataTypeObject.description;
    this.editableForm.label = this.mcDataTypeObject.label;
    this.title.setTitle(`Data Type - ${this.mcDataTypeObject?.label}`);

    this.editableForm.show = () => {
      this.editForm.forEach(x => x.edit({
        editing: true,
        focus: x._name === 'moduleName' ? true : false,
      }));
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.editableForm.description = this.mcDataTypeObject.description;
      this.editableForm.label = this.mcDataTypeObject.label;
      if (this.mcDataTypeObject.classifiers) {
        this.mcDataTypeObject.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.mcDataTypeObject.aliases) {
        this.mcDataTypeObject.aliases.forEach(item => {
          this.editableForm.aliases.push(item);
        });
      }
    };
  }

  validateLabel = (data) => {
    if (!data || (data && data.trim().length === 0)) {
      return 'Data Type name can not be empty';
    }
  };

  ngAfterViewInit(): void {
    this.editForm.changes.subscribe(() => {
      this.editForm.forEach(x =>
        x.edit({
          editing: true,
          focus: x._name === 'moduleName' ? true : false,
        })
      );
    });
  }

  formBeforeSave = () => {
    const aliases = [];
    this.editableForm.aliases.forEach(alias => {
      aliases.push(alias);
    });

    const resource = {
      id: this.mcDataTypeObject.id,
      label: this.editableForm.label,
      description: this.editableForm.description,
      aliases,
      domainType: this.mcDataTypeObject.domainType,
      classifiers: this.mcDataTypeObject.classifiers.map(cls => ({ id: cls.id }))
    };
    this.resources.dataType.update(this.mcParentDataModel.id, this.mcDataTypeObject.id, resource).subscribe((res) => {
      const result = res.body;
      if (this.afterSave) {
        this.afterSave(resource);
      }
      this.mcDataTypeObject.aliases = Object.assign([], result.aliases);
      this.mcDataTypeObject.editAliases = Object.assign([], this.mcDataTypeObject.aliases);
      this.mcDataTypeObject.label = result.label;
      this.mcDataTypeObject.description = result.description;
      this.messageHandler.showSuccess('Data Type updated successfully.');
      this.editableForm.visible = false;
    }, error => {
      this.messageHandler.showError('There was a problem updating the Data Type.', error);
    }
    );

    this.changeRef.detectChanges();
  };

  openEditClicked = formName => {
    if (this.openEditForm) {
      this.openEditForm(formName);
    }
  };

  onCancelEdit = () => {
    this.mcDataTypeObject.editAliases = Object.assign([], this.mcDataTypeObject.aliases);
    this.changeRef.detectChanges();
  };

  delete = () => {
    this.resources.dataType.remove(this.mcParentDataModel.id, this.mcDataTypeObject.id).subscribe(() => {
      this.messageHandler.showSuccess('Data Type deleted successfully.');
      this.stateHandler.Go('dataModel', { id: this.mcParentDataModel.id }, { reload: true, location: true });
    }, error => {
      this.messageHandler.showError('There was a problem deleting the Data Type.', error);
    }
    );
  };

  askToDelete = () => {
    if (!this.sharedService.isAdminUser()) {
      return;
    }

    // check if it has DataElements
    this.resources.dataElement.listWithDataType(this.mcParentDataModel.id, this.mcDataTypeObject.id).subscribe((res) => {
      const result = res.body;
      const dataElementsCount = result.count;

      let message = `<p class='marginless'>Are you sure you want to <span class='warning'>permanently</span> delete this Data Type?</p>`;
      if (dataElementsCount > 0) {
        message += `<p>All it's Data Elements <strong>(${dataElementsCount})</strong> will be deleted <span class='warning'>permanently</span> as well:</p>`;

        for (let i = 0; i < Math.min(5, result.items.length); i++) {
          const link = this.elementTypes.getLinkUrl(result.items[i]);
          message += `<div><a target='_blank' href='${link}'>${result.items[i].label}</a></div>`;
        }
        if (result.count > 5) {
          message += ' ...';
        }
      }

      this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: 'Permanent deletion',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message
        }
      }).afterClosed().subscribe((result2) => {
        if (result2 != null && result2.status === 'ok') {
          this.delete();
        } else {
          return;
        }
      });
    });
  };
}
