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
import { SecurityHandlerService, MessageHandlerService } from '@mdm/services';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ApiKeysModalComponent } from '@mdm/modals/api-keys-modal/api-keys-modal.component';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { ClipboardService } from 'ngx-clipboard';

@Component({
   selector: 'mdm-api-keys',
   templateUrl: './api-keys.component.html',
   styleUrls: ['./api-keys.component.scss']
})
export class ApiKeysComponent implements OnInit {
   records: any[] = [];
   displayedColumns = ['name', 'key', 'expiryDate', 'refreshable', 'status', 'actions'];
   currentUser: any;
   totalItemCount = 0;
   isLoadingResults = true;

   constructor(
      private resourcesService: MdmResourcesService,
      private securityHandler: SecurityHandlerService,
      public dialog: MatDialog,
      private title: Title,
      protected clipboardService: ClipboardService,
      private messageHandler: MessageHandlerService,
   ) { }

   ngOnInit(): void {
      this.title.setTitle('API Keys');
      this.currentUser = this.securityHandler.getCurrentUser();
      this.listApiKeys(this.currentUser);
   }

   listApiKeys(currentUser: any) {
      this.isLoadingResults = true;
      this.resourcesService.catalogueUser.listApiKeys(currentUser?.id).subscribe((result) => {
         this.records = result.body.items;
         this.totalItemCount = result.body.count;
         this.isLoadingResults = false;
      }, error => {
         this.records = [];
         this.totalItemCount = 0;
         this.messageHandler.showError('There was a problem loading the API Keys', error);
         this.isLoadingResults = false;
      });
   }

   disableKey = record => {
      this.resourcesService.catalogueUser.disableApiKey(this.currentUser?.id, record.apiKey).subscribe(() => {
         this.messageHandler.showSuccess('API Key disabled successfully.');
         this.listApiKeys(this.currentUser?.id);
      }, error => {
         this.messageHandler.showError('There was a problem updating the API Key.', error);
      });
   };

   enableKey = record => {
      this.resourcesService.catalogueUser.enableApiKey(this.currentUser?.id, record.apiKey).subscribe(() => {
         this.messageHandler.showSuccess('API Key enabled successfully.');
         this.listApiKeys(this.currentUser?.id);
      }, error => {
         this.messageHandler.showError('There was a problem updating the API Key.', error);
      });
   };

   refreshKey = record => {
      const promise = new Promise(() => {
         const dialog = this.dialog.open(ApiKeysModalComponent, {
            data: {
               showName: false,
               showExpiryDay: true,
               showRefreshable: false
            },
            panelClass: 'api-keys-modal'
         });
         dialog.afterClosed().subscribe(result => {
            console.log(result);
            if (result && result.status === 'ok') {
               this.resourcesService.catalogueUser.refreshApiKey(this.currentUser?.id, record.apiKey, result.data.expiresInDays).subscribe(() => {
                  this.messageHandler.showSuccess('API Key enabled successfully.');
                  this.listApiKeys(this.currentUser?.id);
               }, error => {
                  this.messageHandler.showError('There was a problem updating the API Key.', error);
               });
            } else {
               return;
            }
         });
      });
      return promise;
   };

   addApiKey = () => {
      const promise = new Promise(() => {
         const dialog = this.dialog.open(ApiKeysModalComponent, {
            data: {
               showName: true,
               showExpiryDay: true,
               showRefreshable: true
            },
            panelClass: 'api-keys-modal'
         });
         dialog.afterClosed().subscribe(result => {
            console.log(result);
            if (result && result.status === 'ok') {
               this.resourcesService.catalogueUser.saveApiKey(this.currentUser?.id, result.data).subscribe(() => {
                  this.messageHandler.showSuccess('API Key created successfully.');
                  this.listApiKeys(this.currentUser?.id);
               }, error => {
                  this.messageHandler.showError('There was a problem creating this API Key.', error);
               });
            } else {
               return;
            }
         });
      });
      return promise;
   };

   removeKey = record => {
      const promise = new Promise(() => {
         const dialog = this.dialog.open(ConfirmationModalComponent, {
            data: {
               title: 'Are you sure you want to delete this API Key?',
               okBtnTitle: 'Yes, delete',
               btnType: 'warn',
               message: '<p class="marginless">This API Key will be removed and will not be usable anymore.</p>'
            }
         });

         dialog.afterClosed().subscribe(result => {
            if (result != null && result.status === 'ok') {
               this.resourcesService.catalogueUser.removeApiKey(this.currentUser?.id, record.apiKey).subscribe(() => {
                  this.messageHandler.showSuccess('API Key removed successfully.');
                  this.listApiKeys(this.currentUser?.id);
               }, error => {
                  this.messageHandler.showError('There was a problem removing this API Key.', error);
               });
            } else {
               return;
            }
         });
      });
      return promise;
   };

   copyToClipboard = record => {
      this.clipboardService.copyFromContent(record.apiKey);
      this.messageHandler.showSuccess(`API Key (${record.name}) copied successfully!`);
    };
}
