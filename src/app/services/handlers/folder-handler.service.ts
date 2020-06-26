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
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { SecurityHandlerService } from './security-handler.service';
import { BroadcastService } from '../broadcast.service';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class FolderHandlerService {
  constructor(
    private resoucesService: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog,
    private securityHandler: SecurityHandlerService,
    private broadcastSvc: BroadcastService
  ) {}

  askForSoftDelete(id) {
    const promise = new Promise((resolve, reject) => {
      if (!this.securityHandler.isAdmin()) {
        reject({ message: 'You should be an Admin!' });
      }

      const dialog = this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: 'Folder',
          message:
            'Are you sure you want to delete this Folder?<br>The Folder will be marked as deleted and will not be viewable by users except Administrators.'
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          return promise;
        }
        this.delete(id, false).then(result2 => {
            resolve(result2);
          }).catch((error) => {
            reject(error);
          });
      });
    });
    return promise;
  }

  askForPermanentDelete(id) {
    const promise = new Promise((resolve, reject) => {
      if (!this.securityHandler.isAdmin()) {
        reject({ message: 'You should be an Admin!' });
      }

      const dialog = this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: 'Folder',
          message:
            'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Folder?'
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          // reject(null); Commented by AS as it was throwing error
          return;
        }
        const dialog2 = this.dialog.open(ConfirmationModalComponent, {
          data: {
            title: 'Folder',
            message:
              '<strong>Are you sure?</strong><br>All its \'Data Models\' and \'Folders\' will be deleted <span class=\'warning\'>permanently</span>.'
          }
        });

        dialog2.afterClosed().subscribe(result2 => {
          if (result2.status !== 'ok') {
            reject(null);
            return;
          }
          this.delete(id, true).then((result3) => {
              resolve(result3);
            }).catch((error) => {
              reject(error);
            });
        });
      });
    });

    return promise;
  }

  delete(id, permanent) {
    const promise = new Promise((resolve, reject) => {
      if (!this.securityHandler.isAdmin()) {
        reject({ message: 'You should be an Admin!' });
      } else {
        const queryString = permanent ? 'permanent=true' : null;
        this.resoucesService.folder.delete(id, null, queryString).subscribe(result => {
            if (permanent) {
              this.broadcastSvc.broadcast('$updateFoldersTree', {
                type: 'permanentDelete',
                result
              });
            } else {
              this.broadcastSvc.broadcast('$updateFoldersTree', {
                type: 'softDelete',
                result
              });
            }
            resolve(result);
          },
          error => {
            this.messageHandler.showError('There was a problem deleting the Folder.', error);
            reject(error);
          }
        );
      }
    });
    return promise;
  }
}
