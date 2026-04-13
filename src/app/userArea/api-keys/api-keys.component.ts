/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { ApiKeysModalComponent, ApiKeysModalConfiguration, ApiKeysModalResponse } from '@mdm/modals/api-keys-modal/api-keys-modal.component';
import { ClipboardService } from 'ngx-clipboard';
import { filter, mergeMap } from 'rxjs/operators';
import { EditingService } from '@mdm/services/editing.service';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatDivider } from '@angular/material/divider';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { NgIf, NgClass } from '@angular/common';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'mdm-api-keys',
    templateUrl: './api-keys.component.html',
    styleUrls: ['./api-keys.component.scss'],
    standalone: true,
    imports: [FlexModule, MatButton, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, NgIf, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, MatDivider, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, ExtendedModule, NgxSkeletonLoaderModule]
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
    private editingService: EditingService) { }

  ngOnInit(): void {
    this.title.setTitle('API Keys');
    this.currentUser = this.securityHandler.getCurrentUser();
    this.listApiKeys(this.currentUser);
  }

  listApiKeys(currentUser: any) {
    if (!currentUser) {
      this.records = [];
      this.totalItemCount = 0;
      return;
    }

    this.isLoadingResults = true;
    this.resourcesService.catalogueUser.listApiKeys(currentUser.id as string).subscribe((result) => {
      this.records = result.body.items;
      this.totalItemCount = result.body.count;
      this.isLoadingResults = false;
    }, (error) => {
      this.records = [];
      this.totalItemCount = 0;
      this.messageHandler.showError('There was a problem loading the API Keys', error);
      this.isLoadingResults = false;
    });
  }

  disableKey = (record) => {
    if (!this.currentUser) {
      return;
    }
    this.resourcesService.catalogueUser.disableApiKey(this.currentUser.id as string, record.apiKey as string).subscribe(() => {
      this.messageHandler.showSuccess('API Key disabled successfully.');
      this.listApiKeys(this.currentUser);
    }, (error) => {
      this.messageHandler.showError('There was a problem updating the API Key.', error);
    });
  };

  enableKey = (record) => {
    if (!this.currentUser) {
      return;
    }
    this.resourcesService.catalogueUser.enableApiKey(this.currentUser.id as string, record.apiKey as string).subscribe(() => {
      this.messageHandler.showSuccess('API Key enabled successfully.');
      this.listApiKeys(this.currentUser);
    }, (error) => {
      this.messageHandler.showError('There was a problem updating the API Key.', error);
    });
  };

  refreshKey = (record) => {
    if (!this.currentUser) {
      return;
    }
    this.editingService
      .openDialog<ApiKeysModalComponent, ApiKeysModalConfiguration, ApiKeysModalResponse>(ApiKeysModalComponent, {
        data: {
          showName: false,
          showExpiryDay: true,
          showRefreshable: false
        },
        panelClass: 'api-keys-modal'
      })
      .afterClosed()
      .pipe(
        filter(result => result && result.status === ModalDialogStatus.Ok),
        mergeMap(result => this.resourcesService.catalogueUser.refreshApiKey(this.currentUser.id as string, record.apiKey as string, result.data.expiresInDays))
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('API Key enabled successfully.');
        this.listApiKeys(this.currentUser);
      }, (error) => {
        this.messageHandler.showError('There was a problem updating the API Key.', error);
      });
  };

  addApiKey = () => {
    if (!this.currentUser) {
      return;
    }
    this.editingService
      .openDialog<ApiKeysModalComponent, ApiKeysModalConfiguration, ApiKeysModalResponse>(ApiKeysModalComponent, {
        data: {
          showName: true,
          showExpiryDay: true,
          showRefreshable: true
        },
        panelClass: 'api-keys-modal'
      })
      .afterClosed()
      .pipe(
        filter(result => result && result.status === ModalDialogStatus.Ok),
        mergeMap(result => this.resourcesService.catalogueUser.saveApiKey(this.currentUser.id as string, result.data))
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('API Key created successfully.');
        this.listApiKeys(this.currentUser);
      }, (error) => {
        this.messageHandler.showError('There was a problem creating this API Key.', error);
      });
  };

  removeKey = (record) => {
    if (!this.currentUser) {
      return;
    }
    this.dialog.openConfirmationAsync({
      data: {
        title: 'Are you sure you want to delete this API Key?',
        okBtnTitle: 'Yes, delete',
        btnType: 'warn',
        message: '<p class="marginless">This API Key will be removed and will not be usable anymore.</p>'
      }
    })
    .pipe(
      mergeMap(() => this.resourcesService.catalogueUser.removeApiKey(this.currentUser.id as string, record.apiKey as string))
    )
    .subscribe(() => {
      this.messageHandler.showSuccess('API Key removed successfully.');
      this.listApiKeys(this.currentUser);
    }, (error) => {
      this.messageHandler.showError('There was a problem removing this API Key.', error);
    });
  };

  copyToClipboard = (record) => {
    this.clipboardService.copyFromContent(record.apiKey as string);
    this.messageHandler.showSuccess(`API Key (${record.name}) copied successfully!`);
  };
}
