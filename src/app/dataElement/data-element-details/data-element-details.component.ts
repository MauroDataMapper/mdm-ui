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
  OnDestroy,
  OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '@mdm/services/message.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { EditingService } from '@mdm/services/editing.service';
import { DataClass, DataElement, DataElementDetail, DataModel } from '@maurodatamapper/mdm-resources';
import { ValidatorService } from '@mdm/services';
import { Access } from '@mdm/model/access';

@Component({
  selector: 'mdm-data-element-details',
  templateUrl: './data-element-details.component.html',
  styleUrls: ['./data-element-details.component.sass']
})
export class DataElementDetailsComponent
  implements OnInit, OnDestroy {
  @Input() parentDataModel : DataModel;
  @Input() parentDataClass : DataClass;
  @Input() editMode = false;
  result: DataElementDetail;
  subscription: Subscription;
  deleteInProgress: boolean;
  parentLabel = '';
  access: Access;
  errorMessage = '';

  constructor(
    private messageService: MessageService,
    private resourcesService: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private title: Title,
    private broadcast: BroadcastService,
    private dialog: MatDialog,
    private securityHandler: SecurityHandlerService,
    private editingService: EditingService,
    private validatorService: ValidatorService
  ) {
    this.dataElementDetails();
  }

  ngOnInit() { }

  dataElementDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(
      (serverResult) => {
        this.result = serverResult;

        if (this.result.breadcrumbs) {
          this.parentLabel = this.result.breadcrumbs[
            serverResult.breadcrumbs.length - 1
          ].label;
        }

        this.title.setTitle(`Data Element - ${this.result?.label}`);
        this.access = this.securityHandler.elementAccess(this.result);
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // unsubscribe to ensure no memory leaks
  }

  askForPermanentDelete() {
    this.dialog
      .openDoubleConfirmationAsync(
        {
          data: {
            title: 'Permanent deletion',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message: `<p>Are you sure you want to <span class='warning'>permanently</span> delete this Data Element?</p>
                    <p class='marginless'><strong>Note:</strong> You are deleting the <strong><i>${this.result.label}</i></strong> Data Element.</p>`
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message:
              '<strong>Note: </strong> All its contents will be deleted <span class="warning">permanently</span>.'
          }
        }
      )
      .subscribe(() => this.delete());
  }

  delete() {
    this.resourcesService.dataElement
      .remove(this.result.model, this.result.dataClass, this.result.id)
      .subscribe(
        () => {
          this.messageHandler.showSuccess('Data Element deleted successfully.');
          this.broadcast.reloadCatalogueTree();
          this.stateHandler.Go(
            'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
          );
        },
        (error) => {
          this.deleteInProgress = false;
          this.messageHandler.showError(
            'There was a problem deleting the Data Element.',
            error
          );
        }
      );
  }

  save() {

    if (this.validatorService.validateLabel(this.result.label)) {
      const resource: DataElement = {
        id: this.result.id,
        label: this.result.label,
        domainType: this.result.domainType
      };

      this.resourcesService.dataElement
        .update(
          this.parentDataModel.id,
          this.parentDataClass.id,
          this.result.id,
          resource
        )
        .subscribe(
          () => {
            this.editMode = false;
            this.editingService.stop();
            this.messageHandler.showSuccess(
              'Data Element updated successfully.'
            );
            this.broadcast.reloadCatalogueTree();
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Data Element.',
              error
            );
          }
        );
    }
    else{
      this.messageHandler.showError('There is an error with the label please correct and try again');
    }
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  showForm() {
    this.editMode = true;
    this.editingService.start();
  }

  cancel() {
    this.editingService.stop();
    this.dataElementDetails();
    this.editMode = false; // Use Input editor whe adding a new folder.
  }
}
