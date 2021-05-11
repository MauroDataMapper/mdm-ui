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
import { MdmResourcesService } from '@mdm/modules/resources';
import { EditableDataModel } from '@mdm/model/dataModelModel';
import {
  Component,
  OnInit,
  Input,
  ViewChildren,
  QueryList,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';
import { MessageService } from '@mdm/services/message.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { SharedService } from '@mdm/services/shared.service';
import { FavouriteHandlerService } from '@mdm/services/handlers/favourite-handler.service';
import { ExportHandlerService } from '@mdm/services/handlers/export-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { SecurityModalComponent } from '@mdm/modals/security-modal/security-modal.component';
import { EditingService } from '@mdm/services/editing.service';
import { FinaliseModalComponent, FinaliseModalResponse } from '@mdm/modals/finalise-modal/finalise-modal.component';
import { catchError, finalize } from 'rxjs/operators';
import { VersioningGraphModalComponent } from '@mdm/modals/versioning-graph-modal/versioning-graph-modal.component';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { CatalogueItemDomainType, Classifier, ModelUpdatePayload, ReferenceDataModelDetail, ReferenceDataModelDetailResponse } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-reference-data-details',
  templateUrl: './reference-data-details.component.html',
  styleUrls: ['./reference-data-details.component.scss']
})
export class ReferenceDataDetailsComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @Input() afterSave: any;
  @Input() editMode = false;
  @ViewChildren('editableText') editForm: QueryList<any>;
  @ViewChild('aLink', { static: false }) aLink: ElementRef;
  result: ReferenceDataModelDetail;
  hasResult = false;
  subscription: Subscription;
  showSecuritySection: boolean;
  showUserGroupAccess: boolean;
  showEdit: boolean;
  showPermission: boolean;
  showDelete: boolean;
  showSoftDelete: boolean;
  showPermDelete: boolean;
  isAdminUser: boolean;
  isLoggedIn: boolean;
  deleteInProgress: boolean;
  exporting: boolean;
  editableForm: EditableDataModel;
  errorMessage = '';
  processing = false;
  exportError = null;
  exportedFileIsReady = false;
  exportList = [];
  addedToFavourite = false;
  download: any;
  downloadLink: any;
  urlText: any;
  canEditDescription = true;
  showEditDescription = false;
  currentBranch = '';
  branchGraph = [];
  showFinalise = false;
  showNewVersion = false;
  compareToList = [];

  constructor(
    private renderer: Renderer2,
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private broadcastSvc: BroadcastService,
    private dialog: MatDialog,
    private favouriteHandler: FavouriteHandlerService,
    private exportHandler: ExportHandlerService,
    private title: Title,
    private editingService: EditingService
  ) {}

  ngOnInit() {
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.loadExporterList();
    this.ReferenceModelDetails();

    this.editableForm = new EditableDataModel();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.editForm.forEach((x) =>
        x.edit({
          editing: true,
          focus: x.name === 'moduleName' ? true : false
        })
      );
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editForm.forEach((x) => x.edit({ editing: false }));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.setEditableFormData();
      if (this.result.classifiers) {
        this.result.classifiers.forEach((item) => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.result.aliases) {
        this.result.aliases.forEach((item) => {
          this.editableForm.aliases.push(item);
        });
      }
    };

    this.subscription = this.messageService.changeUserGroupAccess.subscribe(
      (message: boolean) => {
        this.showSecuritySection = message;
      }
    );
  }

  ngAfterViewInit(): void {
    this.editForm.changes.subscribe(() => {
      if (this.editMode) {
        this.editForm.forEach((x) =>
          x.edit({
            editing: true,
            focus: x.name === 'moduleName' ? true : false
          })
        );
        this.showForm();
      }
    });
  }

  ReferenceModelDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(
      (serverResult) => {
        if (serverResult.domainType === 'ReferenceDataModel') {
          this.result = serverResult;
          this.setEditableFormData();

          this.getModelGraph(this.result.id);

          if (this.result.classifiers) {
            this.result.classifiers.forEach((item) => {
              this.editableForm.classifiers.push(item);
            });
          }
          if (this.result.aliases) {
            this.result.aliases.forEach((item) => {
              this.editableForm.aliases.push(item);
            });
          }
          if (this.result.semanticLinks) {
            this.result.semanticLinks.forEach((link) => {
              if (link.linkType === 'New Version Of') {
                this.compareToList.push(link.target);
              }
            });
          }

          if (this.result.semanticLinks) {
            this.result.semanticLinks.forEach((link) => {
              if (link.linkType === 'Superseded By') {
                this.compareToList.push(link.target);
              }
            });
          }

          if (this.result != null) {
            this.hasResult = true;
            this.watchReferenceDataModelObject();
          }
          this.title.setTitle(`${this.result?.type} - ${this.result?.label}`);
        }
      }
    );
  }

  watchReferenceDataModelObject() {
    const access: any = this.securityHandler.elementAccess(this.result);
    if (access !== undefined) {
      this.showEdit = access.showEdit;
      this.showPermission = access.showPermission;
      this.showDelete = access.showPermanentDelete || access.showSoftDelete;
      this.showSoftDelete = access.showSoftDelete;
      this.showPermDelete = access.showPermanentDelete;
      this.canEditDescription = access.canEditDescription;
      this.showFinalise = access.showFinalise;
      this.showNewVersion = access.showNewVersion;
    }
    this.addedToFavourite = this.favouriteHandler.isAdded(this.result);
  }

  restore() {
    if (!this.isAdminUser || !this.result.deleted) {
      return;
    }

    this.processing = true;

    this.resourcesService.referenceDataModel
      .undoSoftDelete(this.result.id)
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
          `The Reference Data Model "${this.result.label}" has been restored.`
        );
        this.stateHandler.reload();
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      });
  }

  finalise() {
    this.resourcesService.referenceDataModel
      .latestModelVersion(this.result.id)
      .subscribe((response) => {
        const dialog = this.dialog.open<FinaliseModalComponent, any, FinaliseModalResponse>(FinaliseModalComponent, {
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
            .finalise(this.result.id, dialogResult.request)
            .subscribe(
              () => {
                this.processing = false;
                this.messageHandler.showSuccess(
                  'Reference Data Model finalised successfully.'
                );
                this.stateHandler.Go(
                  'referencedatamodel',
                  { id: this.result.id },
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
    this.dialog.open(SecurityModalComponent, {
      data: {
        element: 'referenceDataModels',
        domainType: 'ReferenceDataModel'
      },
      panelClass: 'security-modal'
    });
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  delete(permanent: boolean) {
    if (!this.showDelete) {
      return;
    }
    this.deleteInProgress = true;

    this.resourcesService.referenceDataModel
      .remove(this.result.id, { permanent })
      .subscribe(
        () => {
          if (permanent) {
            this.broadcastSvc.broadcast('$reloadFoldersTree');
            this.stateHandler.Go(
              'allDataModel',
              { reload: true, location: true },
              null
            );
          } else {
            this.broadcastSvc.broadcast('$reloadFoldersTree');
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

  getModelGraph = (modelId) => {
    this.currentBranch = this.result.branchName;
    this.branchGraph = [
      {
        branchName: 'main',
        label: this.result.label,
        modelId,
        newBranchModelVersion: false,
        newDocumentationVersion: false,
        newFork: false
      }
    ];

    this.resourcesService.referenceDataModel
      .modelVersionTree(modelId)
      .subscribe(
        (res) => {
          this.currentBranch = this.result.branchName;
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
          'referenceDataModels',
          { id: this.branchGraph[val].modelId },
          { reload: true, location: true }
        );
      }
    }
  };

  askForSoftDelete() {
    if (!this.showSoftDelete) {
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
    if (!this.showPermDelete) {
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

  formBeforeSave = () => {
    this.editMode = false;
    this.errorMessage = '';

    const classifiers: Classifier[] = [];
    this.editableForm.classifiers.forEach((cls) => {
      classifiers.push(cls);
    });
    const aliases: string[] = [];
    this.editableForm.aliases.forEach((alias) => {
      aliases.push(alias);
    });

    const resource: ModelUpdatePayload = {
      id: this.result.id,
      domainType: CatalogueItemDomainType.ReferenceDataModel,
      description: this.editableForm.description || ''
    };

    if (!this.showEditDescription) {
      resource.label = this.editableForm.label;
      resource.author = this.editableForm.author;
      resource.organisation = this.editableForm.organisation;
      resource.type = this.result.type;
      resource.aliases = aliases;
      resource.classifiers = classifiers;
    }

    if (this.validateLabel(this.result.label)) {
      this.resourcesService.referenceDataModel
        .update(this.result.id, resource)
        .subscribe(
          (res: ReferenceDataModelDetailResponse) => {
            if (this.afterSave) {
              this.afterSave(res);
            }
            this.result.description = res.body.description;
            this.ReferenceModelDetails();
            this.messageHandler.showSuccess(
              'Reference Data Model updated successfully.'
            );
            this.editingService.stop();
            this.editableForm.visible = false;
            this.editForm.forEach((x) => x.edit({ editing: false }));
            this.broadcastSvc.broadcast('$reloadFoldersTree');
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Reference Data Model.',
              error
            );
          }
        );
    }
  };

  validateLabel(data): any {
    if (!data || (data && data.trim().length === 0)) {
      this.errorMessage = 'Name field cannot be empty';
      return false;
    } else {
      return true;
    }
  }

  showForm() {
    this.editingService.start();
    this.showEditDescription = false;
    this.editableForm.show();
  }

  onCancelEdit() {
    this.errorMessage = '';
    this.editMode = false; // Use Input editor whe adding a new folder.
    this.showEditDescription = false;
  }

  toggleFavourite() {
    if (this.favouriteHandler.toggle(this.result)) {
      this.addedToFavourite = this.favouriteHandler.isAdded(this.result);
    }
  }

  export(exporter) {
    this.exportError = null;
    this.processing = true;
    this.exportedFileIsReady = false;
    this.exportHandler
      .exportDataModel([this.result], exporter, 'referenceDataModels')
      .subscribe(
        (result) => {
          if (result != null) {
            this.exportedFileIsReady = true;
            const label =
              [this.result].length === 1
                ? [this.result][0].label
                : 'reference_models';
            const fileName = this.exportHandler.createFileName(label, exporter);
            const file = new Blob([result.body], { type: exporter.fileType });
            const link = this.exportHandler.createBlobLink(file, fileName);

            this.processing = false;
            this.renderer.appendChild(this.aLink.nativeElement, link);
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
    this.securityHandler.isAuthenticated().subscribe((result) => {
      if (!result.body.authenticatedSession) {
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

  onLabelChange(value: any) {
    if (!this.validateLabel(value)) {
      this.editableForm.validationError = true;
    } else {
      this.editableForm.validationError = false;
      this.errorMessage = '';
    }
  }

  showDescription = () => {
    this.editingService.start();
    this.showEditDescription = true;
    this.editableForm.show();
  };

  newVersion() {
    this.stateHandler.Go(
      'newVersionReferenceDataModel',
      { referenceDataModelId: this.result.id },
      { location: true }
    );
  }

  compare(referenceDataModel = null) {
    this.stateHandler.NewWindow(
      'modelscomparison',
      {
        sourceId: this.result.id,
        targetId: referenceDataModel ? referenceDataModel.id : null
      },
      null
    );
  }

  merge() {
    this.stateHandler.Go(
      'modelsmerging',
      {
        sourceId: this.result.id,
        targetId: null
      },
      null
    );
  }

  showMergeGraph = () => {
    const promise = new Promise<void>((resolve, reject) => {
      const dialog = this.dialog.open(VersioningGraphModalComponent, {
        data: { parentDataModel: this.result.id },
        panelClass: 'versioning-graph-modal'
      });

      dialog.afterClosed().subscribe((result) => {
        if (result != null && result.status === 'ok') {
          resolve();
        } else {
          reject();
        }
      });
    });
    promise.then(() => {}).catch(() => {});
  };

  private setEditableFormData() {
    this.editableForm.description = this.result.description;
    this.editableForm.label = this.result.label;
    this.editableForm.organisation = this.result.organisation;
    this.editableForm.author = this.result.author;
  }
}
