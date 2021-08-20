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
import { MdmResourcesService } from '@mdm/modules/resources';
import { Component, OnInit, Input } from '@angular/core';
import { EMPTY } from 'rxjs';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { SharedService } from '@mdm/services/shared.service';
import { ExportHandlerService } from '@mdm/services/handlers/export-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import {
  FinaliseModalComponent,
  FinaliseModalResponse
} from '@mdm/modals/finalise-modal/finalise-modal.component';
import { catchError, finalize } from 'rxjs/operators';
import { VersioningGraphModalComponent } from '@mdm/modals/versioning-graph-modal/versioning-graph-modal.component';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import {
  CatalogueItemDomainType,
  ModelUpdatePayload,
  ReferenceDataModelDetail,
  ReferenceDataModelDetailResponse
} from '@maurodatamapper/mdm-resources';
import { ValidatorService } from '@mdm/services';
import { Access } from '@mdm/model/access';

@Component({
  selector: 'mdm-reference-data-details',
  templateUrl: './reference-data-details.component.html',
  styleUrls: ['./reference-data-details.component.scss']
})
export class ReferenceDataDetailsComponent implements OnInit {
  @Input() refDataModel: ReferenceDataModelDetail;
  originalRefDataModel: ReferenceDataModelDetail;
  showEdit = false;
  isAdminUser: boolean;
  isLoggedIn: boolean;
  deleteInProgress: boolean;
  exporting: boolean;
  errorMessage = '';
  processing = false;
  exportError = null;
  exportList = [];
  compareToList = [];
  downloadLinks = new Array<HTMLAnchorElement>();
  access: Access;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private broadcast: BroadcastService,
    private dialog: MatDialog,
    private exportHandler: ExportHandlerService,
    private title: Title,
    private editingService: EditingService,
    private validatorService: ValidatorService
  ) {}

  ngOnInit() {
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.loadExporterList();
    this.ReferenceModelDetails();
    this.originalRefDataModel = Object.assign({}, this.refDataModel);
  }

  ReferenceModelDetails(): any {
    if (this.refDataModel.semanticLinks) {
      this.refDataModel.semanticLinks.forEach((link) => {
        if (link.linkType === 'New Version Of') {
          this.compareToList.push(link.target);
        }
      });
    }

    if (this.refDataModel.semanticLinks) {
      this.refDataModel.semanticLinks.forEach((link) => {
        if (link.linkType === 'Superseded By') {
          this.compareToList.push(link.target);
        }
      });
    }

    this.access = this.securityHandler.elementAccess(this.refDataModel);
    this.title.setTitle(
      `${this.refDataModel?.type} - ${this.refDataModel?.label}`
    );
  }

  restore() {
    if (!this.isAdminUser || !this.refDataModel.deleted) {
      return;
    }

    this.processing = true;

    this.resourcesService.referenceDataModel
      .undoSoftDelete(this.refDataModel.id)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem restoring the Reference Data Model.',
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
          `The Reference Data Model "${this.refDataModel.label}" has been restored.`
        );
        this.stateHandler.reload();
        this.broadcast.reloadCatalogueTree();
      });
  }

  finalise() {
    this.resourcesService.referenceDataModel
      .latestModelVersion(this.refDataModel.id)
      .subscribe((response) => {
        const dialog = this.dialog.open<
          FinaliseModalComponent,
          any,
          FinaliseModalResponse
        >(FinaliseModalComponent, {
          data: {
            modelVersion: response.body.modelVersion,
            title: 'Finalise Reference Data Model',
            okBtnTitle: 'Finalise Reference Data Model',
            btnType: 'accent',
            message: `<p class='marginless'>Please select the version you would like this Reference Data Model</p>
                      <p>to be finalised with: </p>`
          }
        });

        dialog.afterClosed().subscribe((dialogResult) => {
          if (dialogResult?.status !== ModalDialogStatus.Ok) {
            return;
          }
          this.processing = true;
          this.resourcesService.referenceDataModel
            .finalise(this.refDataModel.id, dialogResult.request)
            .subscribe(
              () => {
                this.processing = false;
                this.messageHandler.showSuccess(
                  'Reference Data Model finalised successfully.'
                );
                this.stateHandler.Go(
                  'referencedatamodel',
                  { id: this.refDataModel.id },
                  { reload: true }
                );
              },
              (error) => {
                this.processing = false;
                this.messageHandler.showError(
                  'There was a problem finalising the Data Model.',
                  error
                );
              }
            );
        });
      });
  }

  toggleSecuritySection() {
    this.dialog.openSecurityAccess(this.refDataModel, 'referenceDataModel');
  }

  delete(permanent: boolean) {
    if (!this.access.showDelete) {
      return;
    }
    this.deleteInProgress = true;

    this.resourcesService.referenceDataModel
      .remove(this.refDataModel.id, { permanent })
      .subscribe(
        () => {
          this.broadcast.reloadCatalogueTree();
          if (permanent) {
            this.stateHandler.Go(
              'allDataModel',
              { reload: true, location: true },
              null
            );
          } else {
            this.stateHandler.reload();
          }
        },
        (error) => {
          this.deleteInProgress = false;
          this.messageHandler.showError(
            'There was a problem deleting the Reference Data Model.',
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
          title: 'Are you sure you want to delete this Reference Data Model?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p class="marginless">This Reference Data Model will be marked as deleted and will not be viewable by users </p>
                    <p class="marginless">except Administrators.</p>`
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
            title: 'Permanent deletion',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message:
              'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Reference Data Model?'
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message: `<p class='marginless'><strong>Note: </strong>All its 'Types', 'Elements' and 'Data Values'
                      <p class='marginless'>will be deleted <span class='warning'>permanently</span>.</p>`
          }
        }
      )
      .subscribe(() => this.delete(true));
  }

  save() {
    this.showEdit = false;
    this.errorMessage = '';

    const resource: ModelUpdatePayload = {
      id: this.refDataModel.id,
      domainType: CatalogueItemDomainType.ReferenceDataModel,
      label: this.refDataModel.label
    };

    if (this.validatorService.validateLabel(this.refDataModel.label)) {
      this.resourcesService.referenceDataModel
        .update(this.refDataModel.id, resource)
        .subscribe(
          (res: ReferenceDataModelDetailResponse) => {
            this.refDataModel = res.body;
            this.ReferenceModelDetails();
            this.messageHandler.showSuccess(
              'Reference Data Model updated successfully.'
            );
            this.editingService.stop();
            this.broadcast.reloadCatalogueTree();
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Reference Data Model.',
              error
            );
          }
        );
    }
  }

  enableEdit() {
    this.editingService.start();
    this.showEdit = true;
  }

  cancel() {
    this.refDataModel = Object.assign({}, this.originalRefDataModel);
    this.errorMessage = '';
    this.editingService.stop();
    this.showEdit = false;
  }

  export(exporter) {
    this.exportError = null;
    this.processing = true;

    this.exportHandler
      .exportDataModel([this.refDataModel], exporter, 'referenceDataModels')
      .subscribe(
        (refDataModel) => {
          if (refDataModel != null) {
            const tempDownloadList = Object.assign([], this.downloadLinks);
            const label =
              [this.refDataModel].length === 1
                ? [this.refDataModel][0].label
                : 'reference_models';
            const fileName = this.exportHandler.createFileName(label, exporter);
            const file = new Blob([refDataModel.body], {
              type: exporter.fileType
            });
            const link = this.exportHandler.createBlobLink(file, fileName);
            tempDownloadList.push(link);
            this.downloadLinks = tempDownloadList;
            this.processing = false;
          } else {
            this.processing = false;
            this.messageHandler.showError(
              'There was a problem exporting the Reference Data Model.',
              ''
            );
          }
        },
        (error) => {
          this.processing = false;
          this.messageHandler.showError(
            'There was a problem exporting the Reference Data Model.',
            error
          );
        }
      );
  }

  loadExporterList() {
    this.exportList = [];
    this.securityHandler.isAuthenticated().subscribe((refDataModel) => {
      if (!refDataModel.body.authenticatedSession) {
        return;
      }

      this.resourcesService.referenceDataModel.exporters().subscribe(
        (res) => {
          this.exportList = res.body;
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

  newVersion() {
    this.stateHandler.Go(
      'newversionmodel',
      {
        id: this.refDataModel.id,
        domainType: this.refDataModel.domainType
      }
    );
  }

  compare(referenceDataModel = null) {
    this.stateHandler.NewWindow(
      'modelscomparison',
      {
        sourceId: this.refDataModel.id,
        targetId: referenceDataModel ? referenceDataModel.id : null
      },
      null
    );
  }

  merge() {
    if (this.sharedService.features.useMergeUiV2) {
      return this.stateHandler.Go(
        'mergediff',
        {
          sourceId: this.refDataModel.id,
          catalogueDomainType: this.refDataModel.domainType
        });
    }

    return this.stateHandler.Go(
      'modelsmerging',
      {
        sourceId: this.refDataModel.id,
        targetId: null
      },
      null
    );
  }

  showMergeGraph() {
    const dialog = this.dialog.open(VersioningGraphModalComponent, {
      data: { parentDataModel: this.refDataModel.id },
      panelClass: 'versioning-graph-modal'
    });

    dialog.afterClosed().subscribe((refDataModel) => {
      if (refDataModel != null && refDataModel.status === 'ok') {
      }
    });
  }
}
