import { Injectable } from '@angular/core';
import { ResourcesService } from '../resources.service';
import { MessageHandlerService } from '../utility/message-handler.service';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { SecurityHandlerService } from './security-handler.service';
import { BroadcastService } from '../broadcast.service';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class FolderHandlerService {
  constructor(
    private resoucesService: ResourcesService,
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
        hasBackdrop: true,
        data: {
          title: 'Folder',
          message:
            'Are you sure you want to delete this Folder?<br>The Folder will be marked as deleted and will not be viewable by users except Administrators.'
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result.status !== 'ok') {
          return promise;
        }
        this.delete(id, false).then(function(result) { resolve(result);
          })
          .catch((error) => {
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
        hasBackdrop: true,
        data: {
          title: 'Folder',
          message:
            'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Folder?'
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result.status !== 'ok') {
          // reject(null); Commented by AS as it was throwing error
          return;
        }
        const dialog2 = this.dialog.open(ConfirmationModalComponent, {
          hasBackdrop: true,
          data: {
            title: 'Folder',
            message:
              '<strong>Are you sure?</strong><br>All its \'Data Models\' and \'Folders\' will be deleted <span class=\'warning\'>permanently</span>.'
          }
        });

        dialog2.afterClosed().subscribe(result => {
          if (result.status !== 'ok') {
            reject(null);
            return;
          }
          this.delete(id, true)
            .then((result) => {
              resolve(result);
            })
            .catch((error) => {
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
        this.resoucesService.folder.delete(id, null, queryString).subscribe(
          result => {
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
            this.messageHandler.showError(
              'There was a problem deleting the Folder.',
              error
            );
            reject(error);
          }
        );
      }
    });
    return promise;
  }
}
