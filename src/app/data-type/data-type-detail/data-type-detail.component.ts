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
  OnInit,
  Input,
} from '@angular/core';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { SharedService } from '@mdm/services/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { EditingService } from '@mdm/services/editing.service';
import { DataModel, DataType, DataTypeDetail, DataTypeDetailResponse } from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';

@Component({
  selector: 'mdm-data-type-detail',
  templateUrl: './data-type-detail.component.html',
  styleUrls: ['./data-type-detail.component.scss']
})
export class DataTypeDetailComponent implements OnInit {
  @Input() dataType: DataTypeDetail;
  @Input() mcParentDataModel: DataModel;

  originalDataType : DataTypeDetail;
  elementType: any;
  access: Access;
  editMode = false;

  constructor(
    private dialog: MatDialog,
    private sharedService: SharedService,
    private elementTypes: ElementTypesService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private editingService: EditingService
  ) { }


  ngOnInit() {
    this.originalDataType = Object.assign({}, this.dataType);
    this.access = this.securityHandler.elementAccess(this.dataType);
  }



  save() {
    const resource: DataType = {
      id: this.dataType.id,
      label: this.dataType.label,
      domainType: this.dataType.domainType
    };

      this.resources.dataType.update(this.mcParentDataModel.id, this.dataType.id, resource).subscribe((res: DataTypeDetailResponse) => {
      this.dataType = res.body;
      this.editMode = false;
      this.messageHandler.showSuccess('Data Type updated successfully.');
      this.editingService.stop();
    }, error => {
      this.messageHandler.showError('There was a problem updating the Data Type.', error);
    }
    );

  };


  showForm() {
    this.editingService.start();
    this.editMode = true;
  }

  cancel(){
    this.editingService.stop();
    this.dataType = Object.assign({}, this.originalDataType);
    this.editMode = false;
  }

  delete(){
    this.resources.dataType.remove(this.mcParentDataModel.id, this.dataType.id).subscribe(() => {
      this.messageHandler.showSuccess('Data Type deleted successfully.');
      this.stateHandler.Go('appContainer.mainApp.twoSidePanel.catalogue.allDataModel');
    }, error => {
      this.messageHandler.showError('There was a problem deleting the Data Type.', error);
    });
  };

  askToDelete(){
    if (!this.sharedService.isAdminUser()) {
      return;
    }

    // check if it has DataElements
    this.resources.dataElement.listWithDataType(this.mcParentDataModel.id, this.dataType.id).subscribe((res) => {
      const result = res.body;
      const dataElementsCount = result.count;

      let message = '<p class=\'marginless\'>Are you sure you want to <span class=\'warning\'>permanently</span> delete this Data Type?</p>';
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

      this.dialog
        .openConfirmationAsync({
          data: {
            title: 'Permanent deletion',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message
          }
        })
        .subscribe(() => this.delete());
    });
  };
}
