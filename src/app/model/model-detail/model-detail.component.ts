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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
  ContainerUpdatePayload, DataModelDetail, Exporter,
  MultiFacetAwareDomainType,
  VersionedFolderDetail,
  VersionedFolderDetailResponse
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { defaultBranchName } from '@mdm/modals/change-branch-name-modal/change-branch-name-modal.component';
import {
  FinaliseModalComponent,
  FinaliseModalResponse
} from '@mdm/modals/finalise-modal/finalise-modal.component';
import { VersioningGraphModalComponent } from '@mdm/modals/versioning-graph-modal/versioning-graph-modal.component';
import { VersioningGraphModalConfiguration } from '@mdm/modals/versioning-graph-modal/versioning-graph-modal.model';
import { Access } from '@mdm/model/access';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  BroadcastService, ExportHandlerService,
  MessageHandlerService,
  SecurityHandlerService,
  StateHandlerService,
  ValidatorService
} from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import {EMPTY, forkJoin, of} from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { getCatalogueItemDomainTypeText } from '@mdm/folders-tree/flat-node';
import {HttpResponse} from '@angular/common/http';

@Component({
  selector: 'mdm-model-detail',
  templateUrl: './model-detail.component.html',
  styleUrls: ['./model-detail.component.scss']
})
export class ModelDetailComponent implements OnInit {
  @Input() detail: VersionedFolderDetail | DataModelDetail;

  @Output() afterSave = new EventEmitter<VersionedFolderDetail>();

  isEditing = false;
  isAdministrator = false;
  isLoggedIn: boolean;
  original: VersionedFolderDetail | DataModelDetail;
  processing = false;
  compareToList = [];
  access: Access;
  downloadLinks = new Array<HTMLAnchorElement>();

  constructor(
    private resourcesService: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private stateHandler: StateHandlerService,
    private exportHandler: ExportHandlerService,
    private broadcast: BroadcastService,
    private dialog: MatDialog,
    private title: Title,
    private editing: EditingService,
    private validator: ValidatorService
  ) {}

  get canChangeBranchName() {
    return this.access.showEdit && this.detail.branchName !== defaultBranchName;
  }

  ngOnInit(): void {
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.securityHandler
      .isAdministrator()
      .subscribe((state) => (this.isAdministrator = state));
    this.access = this.securityHandler.elementAccess(this.detail);
    this.title.setTitle(`${this.getItemType()} - ${this.detail?.label}`);
    this.modelDetails();
  }

  showSecurityDialog() {
    this.dialog.openSecurityAccess(this.detail, 'versionedFolder');
  }

  showForm() {
    this.editing.start();
    this.isEditing = true;
  }

  cancel() {
    this.isEditing = false;
    this.editing.stop();
    this.detail = Object.assign({}, this.original);
  }

  save() {
    if (!this.validator.validateLabel(this.detail.label)) {
      this.messageHandler.showError(
        'There is an error with the label. Please correct and try again.'
      );
      return;
    }

    this.resourcesService.versionedFolder
      .update(this.detail.id, {
        id: this.detail.id,
        label: this.detail.label
      })
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem updating the Versioned Folder.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((response: VersionedFolderDetailResponse) => {
        this.messageHandler.showSuccess(
          'Versioned Folder updated successfully.'
        );
        this.isEditing = false;
        this.original = response.body;
        this.editing.stop();
        this.afterSave.emit(response.body);
        this.broadcast.reloadCatalogueTree();
      });
  }

  restore() {
    if (!this.isAdministrator || !this.detail.deleted) {
      return;
    }

    this.processing = true;

    this.resourcesService.codeSet
      .undoSoftDelete(this.detail.id)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            `There was a problem restoring the ${this.getItemType()}.`,
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
          `The ${this.getItemType()} "${this.detail.label}" has been restored.`
        );
        this.stateHandler.reload();
        this.broadcast.reloadCatalogueTree();
      });
  }


  askForSoftDelete() {
    if (!this.access.showSoftDelete) {
      return;
    }

    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure you want to delete this Versioned Folder?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p class="marginless">This Versioned Folder will be marked as deleted and will not be viewable by users </p>
                    <p class="marginless">except Administrators.</p>`
        }
      })
      .subscribe(() => this.delete(false));
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
              'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Versioned Folder?'
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message: `<p class='marginless'><strong>Note: </strong>All its contents
                    <p class='marginless'>will be deleted <span class='warning'>permanently</span>.</p>`
          }
        }
      )
      .subscribe(() => this.delete(true));
  }

  compare(dataModel = null) {
    this.stateHandler.NewWindow(
      'modelscomparison',
      {
        sourceId: this.detail.id,
        targetId: dataModel ? dataModel.id : null
      },
      null
    );
  }
  finalise() {
    const dialog = this.dialog.open<
      FinaliseModalComponent,
      any,
      FinaliseModalResponse
    >(FinaliseModalComponent, {
      data: {
        title: 'Finalise Versioned Folder',
        okBtnTitle: 'Finalise Versioned Folder',
        btnType: 'accent',
        message: `<p class='marginless'>Please select the version you would like this Versioned Folder</p>
                      <p>to be finalised with: </p>`
      }
    });

    dialog.afterClosed().subscribe((dialogResult) => {
      if (dialogResult?.status !== ModalDialogStatus.Ok) {
        return;
      }
      this.processing = true;
      this.resourcesService.versionedFolder
        .finalise(this.detail.id, dialogResult.request)
        .subscribe(
          () => {
            this.processing = false;
            this.messageHandler.showSuccess(
              'Versioned Folder finalised successfully.'
            );
            this.stateHandler.Go(
              'versionedFolder',
              { id: this.detail.id },
              { reload: true }
            );
          },
          (error) => {
            this.processing = false;
            this.messageHandler.showError(
              'There was a problem finalising the Versioned Folder.',
              error
            );
          }
        );
    });
  }

  newVersion() {
    this.stateHandler.Go('newVersionModel', {
      id: this.detail.id,
      domainType: this.detail.domainType
    });
  }

  merge() {
    return this.stateHandler.Go('mergediff', {
      sourceId: this.detail.id,
      catalogueDomainType: MultiFacetAwareDomainType.VersionedFolders
    });
  }

  showMergeGraph() {
    this.dialog.open<
      VersioningGraphModalComponent,
      VersioningGraphModalConfiguration
    >(VersioningGraphModalComponent, {
      data: {
        catalogueItem: this.detail
      },
      panelClass: 'versioning-graph-modal'
    });
  }

  private delete(permanent: boolean) {
    if (!this.access.showSoftDelete && !this.access.showPermanentDelete) {
      return;
    }

    this.processing = true;

    this.resourcesService.versionedFolder
      .remove(this.detail.id, { permanent })
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem deleting the Versioned Folder.',
            error
          );
          return EMPTY;
        }),
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe(() => {
        this.broadcast.reloadCatalogueTree();
        if (permanent) {
          this.stateHandler.Go(
            'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
          );
        } else {
          this.stateHandler.reload();
        }
      });
  }

  editBranchName() {
    this.dialog
      .openChangeBranchName(this.detail)
      .pipe(
        switchMap((dialogResult) => {
          const payload: ContainerUpdatePayload = {
            id: this.detail.id,
            domainType: this.detail.domainType,
            branchName: dialogResult.branchName
          };

          return this.resourcesService.versionedFolder.update(
            payload.id,
            payload
          );
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
          'Versioned Folder branch name updated successfully.'
        );
        this.stateHandler.Go(
          'versionedFolder',
          { id: this.detail.id },
          { reload: true }
        );
      });
  }

  modelDetails(): any {
    if (this.detail.semanticLinks) {
      this.detail.semanticLinks.forEach((link) => {
        if (link.linkType === 'New Version Of') {
          this.compareToList.push(link.target);
        }
      });
    }

    if (this.detail.semanticLinks) {
      this.detail.semanticLinks.forEach((link) => {
        if (link.linkType === 'Superseded By') {
          this.compareToList.push(link.target);
        }
      });
    }

    this.original = Object.assign({}, this.detail);
  }


  getItemType(): string {
    return getCatalogueItemDomainTypeText(this.detail.domainType, this.detail.type);
  }

  openBulkEdit() {
    this.stateHandler.Go('appContainer.mainApp.bulkEdit', {
      id: this.detail.id,
      domainType: this.detail.domainType
    });
  }

  exportModel() {
    this.dialog
      .openExportModel({ domain: 'dataModels' })
      .pipe(
        switchMap((response) => {
          this.processing = true;
          return forkJoin([
            of(response.exporter),
            this.exportHandler.exportDataModel(
              [this.detail],
              response.exporter,
              'dataModels',
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
      this.detail.label,
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


}
