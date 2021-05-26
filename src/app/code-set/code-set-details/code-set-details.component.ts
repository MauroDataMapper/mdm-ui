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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { SharedService } from '@mdm/services/shared.service';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { FavouriteHandlerService } from '@mdm/services/handlers/favourite-handler.service';
import { DialogPosition, MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
  FinaliseModalComponent,
  FinaliseModalResponse
} from '@mdm/modals/finalise-modal/finalise-modal.component';
import { SecurityModalComponent } from '@mdm/modals/security-modal/security-modal.component';
import { EditingService } from '@mdm/services/editing.service';
import { catchError, finalize } from 'rxjs/operators';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import {
  CodeSetDetail,
  CodeSetDetailResponse,
  CodeSetUpdatePayload
} from '@maurodatamapper/mdm-resources';
import { ValidatorService } from '@mdm/services';

@Component({
  selector: 'mdm-code-set-details',
  templateUrl: './code-set-details.component.html',
  styleUrls: ['./code-set-details.component.scss']
})
export class CodeSetDetailsComponent implements OnInit, OnDestroy {
  @Input() editMode = false;

  codeSetDetail: CodeSetDetail;
  subscription: Subscription;
  showSecuritySection: boolean;
  isAdminUser: boolean;
  deleteInProgress: boolean;
  processing = false;
  addedToFavourite = false;
  currentBranch = '';
  branchGraph = [];
  access: any;

  constructor(
    private resourcesService: MdmResourcesService,
    private validatorService: ValidatorService,
    private messageService: MessageService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private elementDialogueService: ElementSelectorDialogueService,
    private broadcastSvc: BroadcastService,
    private dialog: MatDialog,
    private favouriteHandler: FavouriteHandlerService,
    private title: Title,
    private editingService: EditingService
  ) {
    this.isAdminUser = this.sharedService.isAdmin;
     this.codeSetDetails();
  }

  public showAddElementToMarkdown() {
    // Remove from here & put in markdown
    this.elementDialogueService.open('Search_Help', 'left' as DialogPosition);
  }

  ngOnInit() {
    this.subscription = this.messageService.changeUserGroupAccess.subscribe(
      (message: boolean) => {
        this.showSecuritySection = message;
      }
    );
  }

  codeSetDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(
      (serverResult) => {
        if (serverResult.domainType !== 'CodeSet') {
          return;
        }
        this.codeSetDetail = serverResult;
        this.access = this.securityHandler.elementAccess(this.codeSetDetail);
        this.getModelGraph(this.codeSetDetail.id);
        this.title.setTitle(`Code Set - ${this.codeSetDetail?.label}`);
      }
    );
  }

  toggleSecuritySection() {
    this.dialog.open(SecurityModalComponent, {
      data: {
        element: 'result',
        domainType: 'codeSets'
      },
      panelClass: 'security-modal'
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  delete(permanent: boolean) {
    if (!this.access.showDelete) {
      return;
    }
    this.deleteInProgress = true;

    this.resourcesService.codeSet
      .remove(this.codeSetDetail.id, { permanent })
      .subscribe(
        () => {
          if (permanent) {
            this.stateHandler.Go(
              'allDataModel',
              { reload: true, location: true },
              null
            );
          } else {
            this.stateHandler.reload();
          }
          this.broadcastSvc.broadcast('$reloadFoldersTree');
        },
        (error) => {
          this.deleteInProgress = false;
          this.messageHandler.showError(
            'There was a problem deleting the Code Set.',
            error
          );
        }
      );
  }

  askForSoftDelete() {
    if (!this.access.showSoftDelete) {
      return;
    }

    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure you want to delete this Code Set?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p class='marginless'>This Code Set will be marked as deleted and will not be visible to users,</p>
                    <p class='marginless'>except Administrators.</p>`
        }
      })
      .subscribe(() => {
        this.processing = true;
        this.delete(false);
        this.processing = false;
      });
  }

  askForPermanentDelete(): any {
    if (!this.access.showPermanentDelete) {
      return;
    }

    this.dialog
      .openDoubleConfirmationAsync(
        {
          data: {
            title: 'Delete permanently',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message:
              'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Code Set?'
          }
        },
        {
          data: {
            title: 'Are you sure you want to delete this Code Set?',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message:
              '<strong>Note: </strong>It will be deleted <span class=\'warning\'>permanently</span>.'
          }
        }
      )
      .subscribe(() => this.delete(true));
  }

  restore() {
    if (!this.isAdminUser || !this.codeSetDetail.deleted) {
      return;
    }

    this.processing = true;

    this.resourcesService.codeSet
      .undoSoftDelete(this.codeSetDetail.id)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem restoring the Code Set.',
            error
          );
          return EMPTY;
        }),
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          `The Code Set "${this.codeSetDetail.label}" has been restored.`
        );
        this.stateHandler.reload();
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      });
  }

  getModelGraph = (codesetId) => {
    this.currentBranch = this.codeSetDetail.branchName;
    this.branchGraph = [
      {
        branchName: 'main',
        label: this.codeSetDetail.label,
        codesetId,
        newBranchModelVersion: false,
        newDocumentationVersion: false,
        newFork: false
      }
    ];

    this.resourcesService.codeSet.modelVersionTree(codesetId).subscribe(
      (res) => {
        this.currentBranch = this.codeSetDetail.branchName;
        this.branchGraph = res.body;
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem getting the Model Version Tree.',
          error
        );
      }
    );
  };

  onModelChange = () => {
    for (const val in this.branchGraph) {
      if (this.branchGraph[val].branchName === this.currentBranch) {
        this.stateHandler.Go(
          'codeset',
          { id: this.branchGraph[val].modelId },
          { reload: true, location: true }
        );
      }
    }
  };

  save() {
    if (this.validatorService.validateLabel(this.codeSetDetail.label)) {
      const resource: CodeSetUpdatePayload = {
        id: this.codeSetDetail.id,
        label: this.codeSetDetail.label,
        domainType: this.codeSetDetail.domainType
      };

      this.resourcesService.codeSet.update(this.codeSetDetail.id, resource).subscribe(
        (res: CodeSetDetailResponse) => {
          this.editMode = false;
          this.editingService.stop();
          this.codeSetDetail = res.body;
          this.messageHandler.showSuccess('Code Set updated successfully.');
          this.broadcastSvc.broadcast('$reloadFoldersTree');
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem updating the Code Set.',
            error
          );
        }
      );
    }
    else{
      this.messageHandler.showError('There is an error with the label please correct and try again');
    }
  }

  showForm() {
    this.editingService.start();
    this.editMode = true;
  }

  cancel() {
    this.editMode = false; // Use Input editor whe adding a new folder.
    this.editingService.stop();
    this.codeSetDetails();
  }

  toggleFavourite() {
    if (this.favouriteHandler.toggle(this.codeSetDetail)) {
      this.addedToFavourite = this.favouriteHandler.isAdded(this.codeSetDetail);
    }
  }

  finalise() {
    this.resourcesService.codeSet
      .latestModelVersion(this.codeSetDetail.id)
      .subscribe((response) => {
        const dialog = this.dialog.open<
          FinaliseModalComponent,
          any,
          FinaliseModalResponse
        >(FinaliseModalComponent, {
          data: {
            title: 'Finalise Code Set',
            modelVersion: response.body.modelVersion,
            okBtnTitle: 'Finalise Code Set',
            btnType: 'accent',
            message: `<p class='marginless'>Please select the version you would like this Code Set</p>
                        <p>to be finalised with: </p>`
          }
        });

        dialog.afterClosed().subscribe((dialogResult) => {
          if (dialogResult?.status !== ModalDialogStatus.Ok) {
            return;
          }
          this.processing = true;
          this.resourcesService.codeSet
            .finalise(this.codeSetDetail.id, dialogResult.request)
            .subscribe(
              () => {
                this.processing = false;
                this.messageHandler.showSuccess(
                  'Code Set finalised successfully!'
                );
                this.stateHandler.Go(
                  'codeset',
                  { id: this.codeSetDetail.id },
                  { reload: true }
                );
              },
              (error) => {
                this.processing = false;
                this.messageHandler.showError(
                  'There was a problem finalising the CodeSet.',
                  error
                );
              }
            );
        });
      });
  }

  newVersion() {
    this.stateHandler.Go(
      'newVersionModel',
      { id: this.codeSetDetail.id, domainType: 'codeSet' },
      { location: true }
    );
  }
}
