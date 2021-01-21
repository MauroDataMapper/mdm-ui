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
import { Injectable } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '../utility/message-handler.service';
import { ConfirmationModalStatus } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { BroadcastService } from '../broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FolderHandlerService {
  constructor(
    private resourcesService: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog,
    private broadcastSvc: BroadcastService
  ) {}

  askForSoftDelete(id): Observable<void> {
    return this.dialog
      .openConfirmation({
        data: {
          title: 'Are you sure you want to delete this Folder?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p class="marginless">This Folder will be marked as deleted and will not be viewable by users </p>
                    <p class="marginless">except Administrators.</p>`
        }
      })
      .afterClosed()
      .pipe(
        filter(result => result.status === ConfirmationModalStatus.Ok),
        map(() => this.delete(id, false))
      );          
  }

  askForPermanentDelete(id): Observable<void> {
    return this.dialog
      .openConfirmation({
        data: {
          title: 'Permanent deletion',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: 'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Folder?'
        }
      })
      .afterClosed()
      .pipe(
        filter(result => result.status === ConfirmationModalStatus.Ok),
        mergeMap(() => {
          return this.dialog.openConfirmation({
            data: {
              title: 'Confirm permanent deletion',
              okBtnTitle: 'Confirm deletion',
              btnType: 'warn',
              message: '<strong>Note: </strong> All its \'Data Models\' and \'Folders\' will be deleted <span class=\'warning\'>permanently</span>.'
            }
          })
          .afterClosed()
          .pipe(
            filter(result2 => result2.status === ConfirmationModalStatus.Ok),
            map(() => this.delete(id, true))
          )
        })        
      );      
  }

  delete(id, permanent = false) {
    this.resourcesService.folder.remove(id, { permanent }).subscribe(() => {
      this.messageHandler.showSuccess('Successfully Deleted Folder');
    }, error => {
      this.messageHandler.showError('There was a problem deleting the Folder.', error);
    });    
  }
}
