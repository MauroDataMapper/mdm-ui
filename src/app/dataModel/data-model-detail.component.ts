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
import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { EMPTY } from 'rxjs';
import { MessageService } from '../services/message.service';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { SharedService } from '../services/shared.service';
import { ExportHandlerService } from '../services/handlers/export-handler.service';
import { BroadcastService } from '../services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
  FinaliseModalComponent,
  FinaliseModalResponse
} from '@mdm/modals/finalise-modal/finalise-modal.component';
import { VersioningGraphModalComponent } from '@mdm/modals/versioning-graph-modal/versioning-graph-modal.component';
import { EditingService } from '@mdm/services/editing.service';
import { catchError, finalize } from 'rxjs/operators';
import { ModelMergingModel } from '@mdm/model/model-merging-model';
import {
  DataModelDetail,
  DataModelDetailResponse,
  ModelDomainType,
  ModelUpdatePayload,
  MultiFacetAwareDomainType
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { ValidatorService } from '@mdm/services';
import { Access } from '@mdm/model/access';
import { MergeDiffAdapterService } from '@mdm/merge-diff/merge-diff-adapter/merge-diff-adapter.service';
import { VersioningGraphModalConfiguration } from '@mdm/modals/versioning-graph-modal/versioning-graph-modal.model';

@Component({
  selector: 'mdm-data-model-detail',
  templateUrl: './data-model-detail.component.html',
  styleUrls: ['./data-model-detail.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class DataModelDetailComponent implements OnInit {
  @Input() dataModel: DataModelDetail;
  originalDataModel: DataModelDetail;
  editMode = false;
  isAdminUser: boolean;
  isLoggedIn: boolean;
  deleteInProgress: boolean;
  exporting: boolean;
  processing = false;
  compareToList = [];
  exportList = [];
  downloadLinks = new Array<HTMLAnchorElement>();
  access: Access;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private broadcast: BroadcastService,
    private dialog: MatDialog,
    private exportHandler: ExportHandlerService,
    private title: Title,
    private editingService: EditingService,
    private validatorService: ValidatorService,
    private mergeDiffService: MergeDiffAdapterService
  ) { }

  ngOnInit() {
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.loadExporterList();
    this.dataModelDetails();
    this.access = this.securityHandler.elementAccess(this.dataModel);
    this.title.setTitle(`${this.dataModel?.type} - ${this.dataModel?.label}`);
  }

  dataModelDetails(): any {
    if (this.dataModel.semanticLinks) {
      this.dataModel.semanticLinks.forEach((link) => {
        if (link.linkType === 'New Version Of') {
          this.compareToList.push(link.target);
        }
      });
    }

    if (this.dataModel.semanticLinks) {
      this.dataModel.semanticLinks.forEach((link) => {
        if (link.linkType === 'Superseded By') {
          this.compareToList.push(link.target);
        }
      });
    }

    this.originalDataModel = Object.assign({}, this.dataModel);
  }

  toggleSecuritySection() {
    this.dialog.openSecurityAccess(this.dataModel, 'dataModel');
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  delete(permanent) {
    if (!this.access.showDelete) {
      return;
    }
    this.deleteInProgress = true;

    this.resourcesService.dataModel
      .remove(this.dataModel.id, { permanent })
      .subscribe(
        () => {
          if (permanent) {
            this.broadcast.reloadCatalogueTree();
            this.stateHandler.Go(
              'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
            );
          } else {
            this.broadcast.reloadCatalogueTree();
            this.stateHandler.reload();
          }
        },
        (error) => {
          this.deleteInProgress = false;
          this.messageHandler.showError(
            'There was a problem deleting the Data Model.',
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
          title: 'Are you sure you want to delete this Data Model?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p class="marginless">This Data Model will be marked as deleted and will not be viewable by users </p>
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
              'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Data Model?'
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message: `<p class='marginless'><strong>Note: </strong>All its 'Data Classes', 'Data Elements' and 'Data Types'
                    <p class='marginless'>will be deleted <span class='warning'>permanently</span>.</p>`
          }
        }
      )
      .subscribe(() => this.delete(true));
  }

  restore() {
    if (!this.isAdminUser || !this.dataModel.deleted) {
      return;
    }

    this.processing = true;

    this.resourcesService.dataModel
      .undoSoftDelete(this.dataModel.id)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem restoring the Data Model.',
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
          `The Data Model "${this.dataModel.label}" has been restored.`
        );
        this.stateHandler.reload();
        this.broadcast.reloadCatalogueTree();
      });
  }

  save() {
    const resource: ModelUpdatePayload = {
      id: this.dataModel.id,
      domainType: this.dataModel.domainType,
      label: this.dataModel.label
    };

    if (this.validatorService.validateLabel(this.dataModel.label)) {
      this.resourcesService.dataModel
        .update(this.dataModel.id, resource)
        .subscribe(
          (res: DataModelDetailResponse) => {
            this.messageHandler.showSuccess('Data Model updated successfully.');
            this.editMode = false;
            this.originalDataModel = res.body;
            this.editingService.stop();
            this.broadcast.reloadCatalogueTree();
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Data Model.',
              error
            );
          }
        );
    } else {
      this.messageHandler.showError('There is an error with the label please correct and try again');
    }
  }

  showForm() {
    this.editingService.start();
    this.editMode = true;
  }

  cancel() {
    this.editMode = false;
    this.editingService.stop();
    this.dataModel = Object.assign({}, this.originalDataModel);
  }

  finalise() {
    this.resourcesService.dataModel
      .latestModelVersion(this.dataModel.id)
      .subscribe((response) => {
        const dialog = this.dialog.open<
          FinaliseModalComponent,
          any,
          FinaliseModalResponse
        >(FinaliseModalComponent, {
          data: {
            modelVersion: response.body.modelVersion,
            title: 'Finalise Data Model',
            okBtnTitle: 'Finalise Data Model',
            btnType: 'accent',
            message: `<p class='marginless'>Please select the version you would like this Data Model</p>
                      <p>to be finalised with: </p>`
          }
        });

        dialog.afterClosed().subscribe((dialogResult) => {
          if (dialogResult?.status !== ModalDialogStatus.Ok) {
            return;
          }
          this.processing = true;
          this.resourcesService.dataModel
            .finalise(this.dataModel.id, dialogResult.request)
            .subscribe(
              () => {
                this.processing = false;
                this.messageHandler.showSuccess(
                  'Data Model finalised successfully.'
                );
                this.stateHandler.Go(
                  'datamodel',
                  { id: this.dataModel.id },
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

  newVersion() {
    this.stateHandler.Go(
      'newVersionModel',
      {
        id: this.dataModel.id,
        domainType: this.dataModel.domainType
      }
    );
  }

  compare(dataModel = null) {
    this.stateHandler.NewWindow(
      'modelscomparison',
      {
        sourceId: this.dataModel.id,
        targetId: dataModel ? dataModel.id : null
      },
      null
    );
  }

  merge() {
    if (this.sharedService.features.useMergeUiV2) {
      return this.stateHandler.Go(
        'mergediff',
        {
          sourceId: this.dataModel.id,
          catalogueDomainType: MultiFacetAwareDomainType.DataModels
        });
    }

    return this.stateHandler.Go(
      'modelsmerging',
      new ModelMergingModel(
        this.dataModel.id,
        null,
        ModelDomainType.DataModels
      ),
      null
    );
  }

  showMergeGraph() {
    this.dialog.open<VersioningGraphModalComponent, VersioningGraphModalConfiguration>(
      VersioningGraphModalComponent,
      {
        data: {
          catalogueItem: this.dataModel
        },
        panelClass: 'versioning-graph-modal'
      });
  }

  export(exporter) {
    this.processing = true;
    this.exportHandler
      .exportDataModel([this.dataModel], exporter, 'dataModels')
      .subscribe(
        (dataModel) => {
          if (dataModel != null) {
            const tempDownloadList = Object.assign([], this.downloadLinks);
            const label =
              [this.dataModel].length === 1
                ? [this.dataModel][0].label
                : 'data_models';
            const fileName = this.exportHandler.createFileName(label, exporter);
            const file = new Blob([dataModel.body], {
              type: exporter.fileType
            });
            const link = this.exportHandler.createBlobLink(file, fileName);
            tempDownloadList.push(link);
            this.downloadLinks = tempDownloadList;
            this.processing = false;
          } else {
            this.processing = false;
            this.messageHandler.showError(
              'There was a problem exporting the Data Model.',
              ''
            );
          }
        },
        (error) => {
          this.processing = false;
          this.messageHandler.showError(
            'There was a problem exporting the Data Model.',
            error
          );
        }
      );
  }

  loadExporterList() {
    this.exportList = [];
    this.securityHandler.isAuthenticated().subscribe((dataModel) => {
      if (!dataModel.body.authenticatedSession) {
        return;
      }

      this.resourcesService.dataModel.exporters().subscribe(
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
}
