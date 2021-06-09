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
import {
  Component,
  Input,
  OnInit} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from '@mdm/services/validator.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { EditingService } from '@mdm/services/editing.service';
import {
  DataClass,
  DataClassDetail,
  DataClassDetailResponse
} from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';

@Component({
  selector: 'mdm-data-class-details',
  templateUrl: './data-class-details.component.html',
  styleUrls: ['./data-class-details.component.sass']
})
export class DataClassDetailsComponent implements OnInit {
  @Input() dataClass: DataClassDetail;
  editMode = false;
  originalDataClass: DataClassDetail;
  hasResult = false;
  deleteInProgress: boolean;
  exportError: any;
  parentLabel = '';
  access: Access;

  constructor(
    private resourcesService: MdmResourcesService,
    private validator: ValidatorService,
    private messageHandler: MessageHandlerService,
    private broadcast: BroadcastService,
    private stateHandler: StateHandlerService,
    private title: Title,
    private dialog: MatDialog,
    private securityHandler: SecurityHandlerService,
    private editingService: EditingService
  ) {}

  ngOnInit() {
    this.originalDataClass = Object.assign({}, this.dataClass);
    this.dataClassDetails();
  }

  dataClassDetails(): any {
    this.resourcesService.dataModel
      .get(this.dataClass.model)
      .subscribe((dataClass) => {
        this.parentLabel = dataClass.body.label;
      });

    this.title.setTitle(`Data Class - ${this.dataClass?.label}`);
    this.access = this.securityHandler.elementAccess(this.dataClass);
  }

  askForPermanentDelete() {
    this.dialog
      .openDoubleConfirmationAsync(
        {
          data: {
            title: 'Permanent deletion',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message: `<p>Are you sure you want to <span class='warning'>permanently</span> delete this Data Class?</p>
                    <p class='marginless'><strong>Note:</strong> You are deleting the <strong><i>${this.dataClass.label}</i></strong> Data Class.</p>`
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message:
              '<strong>Note: </strong> All its contents will be deleted <span class=\'warning\'>permanently</span>.'
          }
        }
      )
      .subscribe(() => this.delete());
  }

  delete() {
    if (!this.dataClass.parentDataClass) {
      this.resourcesService.dataClass
        .remove(this.dataClass.model, this.dataClass.id)
        .subscribe(
          () => {
            this.messageHandler.showSuccess('Data Class deleted successfully.');
            this.broadcast.reloadCatalogueTree();
            this.stateHandler.Go(
              'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
            );
          },
          (error) => {
            this.deleteInProgress = false;
            this.messageHandler.showError(
              'There was a problem deleting this Data Class.',
              error
            );
          }
        );
    } else {
      this.resourcesService.dataClass
        .removeChildDataClass(
          this.dataClass.model,
          this.dataClass.parentDataClass,
          this.dataClass.id
        )
        .subscribe(
          () => {
            this.messageHandler.showSuccess('Data Class deleted successfully.');
            this.broadcast.reloadCatalogueTree();
            this.stateHandler.Go(
              'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
            );
          },
          (error) => {
            this.deleteInProgress = false;
            this.messageHandler.showError(
              'There was a problem deleting this Data Class.',
              error
            );
          }
        );
    }
  }

  save() {

    if (
      this.validator.validateLabel(this.dataClass.label)) {

      const resource: DataClass = {
        id: this.dataClass.id,
        label: this.dataClass.label,
        domainType: this.dataClass.domainType
      };

      if (!this.dataClass.parentDataClass) {
        this.resourcesService.dataClass
          .update(this.dataClass.model, this.dataClass.id, resource)
          .subscribe(
            (dataClass: DataClassDetailResponse) => {
              this.messageHandler.showSuccess(
                'Data Class updated successfully.'
              );
              this.originalDataClass = dataClass.body;
              this.editMode = false;
              this.broadcast.reloadCatalogueTree();
              this.editingService.stop();
           },
            (error) => {
              this.messageHandler.showError(
                'There was a problem updating the Data Class.',
                error
              );
            }
          );
      } else {
        this.resourcesService.dataClass
          .updateChildDataClass(
            this.dataClass.model,
            this.dataClass.parentDataClass,
            this.dataClass.id,
            resource
          )
          .subscribe(
            (dataClass: DataClassDetailResponse) => {
              this.messageHandler.showSuccess(
                'Data Class updated successfully.'
              );
              this.editMode = false;
              this.editingService.stop();
              this.dataClass = dataClass.body;
              this.broadcast.reloadCatalogueTree();
            },
            (error) => {
              this.messageHandler.showError(
                'There was a problem updating the Data Class.',
                error
              );
            }
          );
      }
    }
  }


  showForm() {
    this.editingService.start();
    this.editMode = true;
  }

  cancel() {
    this.dataClass = Object.assign({}, this.originalDataClass);
    this.editMode = false;
    this.editingService.stop();
  }


  isAdmin() {
    return this.securityHandler.isAdmin();
  }
}
