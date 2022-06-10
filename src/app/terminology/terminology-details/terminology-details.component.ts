/*
Copyright 2020-2022 University of Oxford
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
import { Component, OnInit, Input } from '@angular/core';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { ExportHandlerService } from '@mdm/services/handlers/export-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { SharedService } from '@mdm/services/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
  FinaliseModalComponent,
  FinaliseModalResponse
} from '@mdm/modals/finalise-modal/finalise-modal.component';
import { MessageService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import {
  Exporter,
  ModelUpdatePayload,
  TerminologyDetail,
  TerminologyDetailResponse
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { Access } from '@mdm/model/access';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { EMPTY, forkJoin, of } from 'rxjs';
import { defaultBranchName } from '@mdm/modals/change-branch-name-modal/change-branch-name-modal.component';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'mdm-terminology-details',
  templateUrl: './terminology-details.component.html',
  styleUrls: ['./terminology-details.component.sass']
})
export class TerminologyDetailsComponent implements OnInit {
  @Input() mcTerminology: TerminologyDetail;

  originalTerminology: TerminologyDetail;
  openEditFormVal: any;
  processing = false;
  isLoggedIn = this.sharedService.isLoggedIn();
  deleteInProgress = false;
  errorMessage: string;
  downloadLinks = new Array<HTMLAnchorElement>();
  access: Access;
  editMode = false;

  constructor(
    private sharedService: SharedService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private exportHandler: ExportHandlerService,
    private securityHandler: SecurityHandlerService,
    private broadcast: BroadcastService,
    private title: Title,
    private editingService: EditingService,
    private messageService: MessageService
  ) {}

  get canChangeBranchName() {
    return (
      this.access.showEdit &&
      this.mcTerminology.branchName !== defaultBranchName
    );
  }

  ngOnInit() {
    this.terminologyDetails();
    this.title.setTitle(`Terminology - ${this.mcTerminology?.label}`);
  }

  terminologyDetails() {
    this.originalTerminology = Object.assign({}, this.mcTerminology);
    this.access = this.securityHandler.elementAccess(this.mcTerminology);
  }

  save() {
    const resource: ModelUpdatePayload = {
      id: this.mcTerminology.id,
      label: this.mcTerminology.label,
      domainType: this.mcTerminology.domainType
    };

    this.resources.terminology.update(resource.id, resource).subscribe(
      (res: TerminologyDetailResponse) => {
        this.originalTerminology = res.body;
        this.editMode = false;
        this.editingService.stop();
        this.messageHandler.showSuccess('Terminology updated successfully.');
        this.broadcast.reloadCatalogueTree();
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem updating the Terminology.',
          error
        );
      }
    );
  }

  toggleSecuritySection() {
    this.dialog.openSecurityAccess(this.mcTerminology, 'terminology');
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  exportModel() {
    this.dialog
      .openExportModel({ domain: 'terminologies' })
      .pipe(
        switchMap((response) => {
          this.processing = true;
          return forkJoin([
            of(response.exporter),
            this.exportHandler.exportDataModel(
              [this.mcTerminology],
              response.exporter,
              'terminologies',
              response.parameters
            )
          ]);
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem exporting the model.',
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.processing = false))
      )
      .subscribe(([exporter, response]) => {
        if (response.status === 202) {
          this.handleAsyncExporterResponse();
          return;
        }

        this.handleStandardExporterResponse(exporter, response);
      });
  }

  private handleStandardExporterResponse(
    exporter: Exporter,
    response: HttpResponse<ArrayBuffer>
  ) {
    const fileName = this.exportHandler.createFileName(
      this.mcTerminology.label,
      exporter
    );
    const file = new Blob([response.body], {
      type: exporter.fileType
    });
    const link = this.exportHandler.createBlobLink(file, fileName);
    this.downloadLinks.push(link);
  }

  private handleAsyncExporterResponse() {
    this.messageHandler.showInfo(
      'A new background task to export your model has started. You can continue working while the export continues.'
    );
  }

  delete(permanent: boolean) {
    if (!this.access.showDelete) {
      return;
    }
    this.deleteInProgress = true;
    this.resources.terminology
      .remove(this.mcTerminology.id, { permanent })
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
          this.broadcast.reloadCatalogueTree();
          this.broadcast.dispatch('elementDeleted');
        },
        (error) => {
          this.deleteInProgress = false;
          this.messageHandler.showError(
            'There was a problem deleting the Terminology.',
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
          title: 'Are you sure you want to delete this Terminology?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p class="marginless">This Terminology will be marked as deleted and will not be viewable by users </p>
                    <p class="marginless">except Administrators.</p>`
        }
      })
      .subscribe(() => this.delete(false));
  }

  askForPermanentDelete() {
    if (!this.access.showPermanentDelete) {
      return;
    }

    this.dialog
      .openDoubleConfirmationAsync(
        {
          data: {
            title: 'Permanent deletion',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message:
              "Are you sure you want to <span class='warning'>permanently</span> delete this Terminology?"
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message:
              "<strong>Note: </strong>All its 'Terms' will be deleted <span class='warning'>permanently</span>."
          }
        }
      )
      .subscribe(() => this.delete(true));
  }

  newVersion() {
    this.stateHandler.Go('newversionmodel', {
      id: this.mcTerminology.id,
      domainType: this.mcTerminology.domainType
    });
  }

  finalise() {
    this.resources.terminology
      .latestModelVersion(this.mcTerminology.id)
      .subscribe((response) => {
        this.dialog
          .open<FinaliseModalComponent, any, FinaliseModalResponse>(
            FinaliseModalComponent,
            {
              data: {
                title: 'Finalise Terminology',
                modelVersion: response.body.modelVersion,
                okBtnTitle: 'Finalise Terminology',
                btnType: 'accent',
                message: `<p class='marginless'>Please select the version you would like this Terminology</p>
                      <p>to be finalised with: </p>`
              }
            }
          )
          .afterClosed()
          .subscribe((dialogResult) => {
            if (dialogResult?.status !== ModalDialogStatus.Ok) {
              return;
            }
            this.processing = true;
            this.resources.terminology
              .finalise(this.mcTerminology.id, dialogResult.request)
              .subscribe(
                () => {
                  this.processing = false;
                  this.messageHandler.showSuccess(
                    'Terminology finalised successfully.'
                  );
                  this.stateHandler.Go(
                    'terminology',
                    { id: this.mcTerminology.id },
                    { reload: true }
                  );
                },
                (error) => {
                  this.processing = false;
                  this.messageHandler.showError(
                    'There was a problem finalising the Terminology.',
                    error
                  );
                }
              );
          });
      });
  }

  cancel() {
    this.errorMessage = '';
    this.mcTerminology = Object.assign({}, this.originalTerminology);
    this.editMode = false;
  }

  openBulkEdit() {
    this.stateHandler.Go('appContainer.mainApp.bulkEdit', {
      id: this.mcTerminology.id,
      domainType: this.mcTerminology.domainType
    });
  }

  showForm() {
    this.editingService.start();
    this.editMode = true;
  }

  editBranchName() {
    this.dialog
      .openChangeBranchName(this.mcTerminology)
      .pipe(
        switchMap((dialogResult) => {
          const payload: ModelUpdatePayload = {
            id: this.mcTerminology.id,
            domainType: this.mcTerminology.domainType,
            branchName: dialogResult.branchName
          };

          return this.resources.terminology.update(payload.id, payload);
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem updating the branch name.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          'Terminology branch name updated successfully.'
        );
        this.stateHandler.Go(
          'terminology',
          { id: this.mcTerminology.id },
          { reload: true }
        );
      });
  }
}
