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
  Input} from '@angular/core';
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
  ModelUpdatePayload,
  TerminologyDetail,
  TerminologyDetailResponse} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { Access } from '@mdm/model/access';

@Component({
  selector: 'mdm-terminology-details',
  templateUrl: './terminology-details.component.html',
  styleUrls: ['./terminology-details.component.sass']
})
export class TerminologyDetailsComponent implements OnInit {
  @Input() mcTerminology: TerminologyDetail;

  originalTerminology:TerminologyDetail;
  openEditFormVal: any;
  processing = false;
  exportError = null;
  exportList = [];
  isAdminUser = this.sharedService.isAdminUser();
  isLoggedIn = this.sharedService.isLoggedIn();
  exportedFileIsReady = false;
  deleteInProgress = false;
  errorMessage: string;
  exporting: boolean;
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

  ngOnInit() {
    this.terminologyDetails();
    this.title.setTitle(`Terminology - ${this.mcTerminology?.label}`);
  }

  terminologyDetails() {
    this.originalTerminology = Object.assign({},this.mcTerminology);
    this.access = this.securityHandler.elementAccess(this.mcTerminology);
    this.loadExporterList();
  }

  save(){
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

  export(exporter) {
    this.exportError = null;
    this.processing = true;
    this.exportedFileIsReady = false;
    this.exportHandler
      .exportDataModel([this.mcTerminology], exporter, 'terminologies')
      .subscribe(
        (result) => {
          if (result != null) {
            this.exportedFileIsReady = true;
            const tempDownloadList = Object.assign([], this.downloadLinks);
            const label =
              [this.mcTerminology].length === 1
                ? [this.mcTerminology][0].label
                : 'data_models';
            const fileName = this.exportHandler.createFileName(label, exporter);
            const file = new Blob([result.body], { type: exporter.fileType });
            const link = this.exportHandler.createBlobLink(file, fileName);
            tempDownloadList.push(link);
            this.downloadLinks = tempDownloadList;

            this.processing = false;
          } else {
            this.processing = false;
            this.messageHandler.showError(
              'There was a problem exporting this Terminology.',
              ''
            );
          }
        },
        (error) => {
          this.processing = false;
          this.messageHandler.showError(
            'There was a problem exporting this Terminology.',
            error
          );
        }
      );
  }

  resetExportError() {
    this.exportError = null;
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
              'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Terminology?'
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message:
              '<strong>Note: </strong>All its \'Terms\' will be deleted <span class=\'warning\'>permanently</span>.'
          }
        }
      )
      .subscribe(() => this.delete(true));
  }

  newVersion() {
    this.stateHandler.Go(
      'newversionmodel',
      {
        id: this.mcTerminology.id,
        domainType: this.mcTerminology.domainType
      }
    );
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

  loadExporterList() {
    this.exportList = [];
    this.securityHandler.isAuthenticated().subscribe((result) => {
      if (!result.body.authenticatedSession) {
        return;
      }
      this.resources.terminology.exporters().subscribe(
        (result2) => {
          this.exportList = result2.body;
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem loading exporters list.',
            error
          );
        }
      );
    });
  }

  showForm() {
    this.editingService.start();
    this.editMode = true;
  }
}
