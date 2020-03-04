import { Injectable, Inject } from '@angular/core';
import { ResourcesService } from '../resources.service';
import { MessageHandlerService } from '../utility/message-handler.service';
import { SharedService } from '../shared.service';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { SecurityHandlerService } from './security-handler.service';
import { BroadcastService } from '../broadcast.service';
import { MatDialog } from '@angular/material/dialog';


@Injectable({
    providedIn: 'root'
})
export class FolderHandlerService {

    constructor(private resoucesService: ResourcesService, private messageHandler: MessageHandlerService, private sharedService: SharedService, private dialog: MatDialog, private securityHandler: SecurityHandlerService, private broadcastSvc: BroadcastService ) { }

    askForSoftDelete(id) {
        let self = this;

        const promise = new Promise((resolve, reject) => {
            if (!this.securityHandler.isAdmin()) {
                reject({ message: 'You should be an Admin!' });
            }

            const dialog = this.dialog.open(ConfirmationModalComponent,
                {
                    hasBackdrop: false,
                    data: {
                        title: 'Folder',
                        message:
                            'Are you sure you want to delete this Folder?<br>The Folder will be marked as deleted and will not be viewable by users except Administrators.'
                    }
                });

            dialog.afterClosed().subscribe(result => {
                if (result.status !== 'ok') {
                   // reject(null); By AS
                    return promise ;
                }
                self.delete(id, false).then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
            });
        });
        return promise;
    }

    askForPermanentDelete(id) {
        let self = this;

        const promise = new Promise((resolve, reject) => {
            if (!this.securityHandler.isAdmin()) {
                reject({ message: 'You should be an Admin!' });
            }

            const dialog = this.dialog.open(ConfirmationModalComponent,
                {
                    hasBackdrop: false,
                    data: {
                        title: 'Folder',
                        message:
                            'Are you sure you want to <span class=\'errorMessage\'>permanently</span> delete this Folder?'
                    }
                });

            dialog.afterClosed().subscribe(result => {
                if (result.status !== 'ok') {
                   // reject(null); Commented by AS as it was throwing error
                    return;
                }
                const dialog2 = this.dialog.open(ConfirmationModalComponent,
                    {
                        hasBackdrop: false,
                        data: {
                            title: 'Folder',
                            message:
                                '<strong>Are you sure?</strong><br>All its \'Data Models\' and \'Folders\' will be deleted <span class=\'errorMessage\'>permanently</span>.'
                        }
                    });

                dialog2.afterClosed().subscribe(result => {
                    if (result.status !== 'ok') {
                        reject(null);
                        return;
                    }
                    self.delete(id, true).then(function(result) {
                        resolve(result);
                    }).catch(function(error) {
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
                let queryString = permanent ? 'permanent=true' : null;
                this.resoucesService.folder.delete(id, null, queryString)
                    .subscribe((result) => {
                        if (permanent === true) {
                            this.broadcastSvc.broadcast('$updateFoldersTree', {type: 'permanentDelete', result});
                        } else {
                            this.broadcastSvc.broadcast('$updateFoldersTree', {type: 'softDelete', result});

                        }
                        resolve(result);
                    }, (error) => {
                        this.messageHandler.showError('There was a problem deleting the Folder.', error);
                        reject(error);
                    });
            }
        });
        return promise;
    }

}
