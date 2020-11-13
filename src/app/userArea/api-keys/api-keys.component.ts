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
import { Component, OnInit } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SecurityHandlerService } from '@mdm/services';
import { Title } from '@angular/platform-browser';
import { NewFolderModalComponent } from '@mdm/modals/new-folder-modal/new-folder-modal.component';
import { MatDialog } from '@angular/material/dialog';

const dataSource = [
  {
    id: '6e6af281-a781-4555-9d87-87de91b8f67b',
    apiKey: '6e6af281-a781-4555-9d87-87de91b8f67b',
    name: 'default',
    expiryDate: '2020-11-15',
    expired: false,
    disabled: false,
    refreshable: false,
    createdDate: '2020-11-13'
},
{
    id: '4d536277-bdef-4e14-b441-432e093dd0fb',
    apiKey: '4d536277-bdef-4e14-b441-432e093dd0fb',
    name: 'wobble',
    expiryDate: '2020-11-14',
    expired: false,
    disabled: false,
    refreshable: true,
    createdDate: '2020-11-13'
},
{
  id: '4d536277-bdef-4e14-b441-432e093dd0fb',
  apiKey: '4d536277-bdef-4e14-b441-432e093dd0fb',
  name: 'bond',
  expiryDate: '2020-11-14',
  expired: true,
  disabled: true,
  refreshable: false,
  createdDate: '2020-11-13'
}
];

@Component({
  selector: 'mdm-api-keys',
  templateUrl: './api-keys.component.html',
  styleUrls: ['./api-keys.component.scss']
})
export class ApiKeysComponent implements OnInit {
  records: any[] = dataSource;
  displayedColumns = ['name', 'key', 'expiryDate', 'refreshable', 'status', 'actions'];

  constructor(
    private resourcesService: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    public dialog: MatDialog,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.title.setTitle('API Keys');
  }


  toggleDeactivate = record => {
    console.log(record);
  };

  addApiKey = () => {
    const promise = new Promise(() => {
      const dialog = this.dialog.open(NewFolderModalComponent, {
        data: {
          inputValue: 'Asda',
          modalTitle: 'Create a new Folder',
          okBtn: 'Add folder',
          btnType: 'primary',
          inputLabel: 'Folder name',
          message: 'Please enter the name of your Folder. <br> <strong>Note:</strong> This folder will be added at the top of the Tree'
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result) {
          console.log('all good');
        } else {
          return;
        }
      });
    });
    return promise;
  };
}
