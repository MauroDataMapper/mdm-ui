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
import { EditableDataModel } from '../model/dataModelModel';
import {
  Component,
  OnInit,
  Input,
  ViewChildren,
  QueryList,
  ViewChild,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
  AfterViewInit, OnDestroy
} from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';
import { MessageService } from '../services/message.service';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { HelpDialogueHandlerService } from '../services/helpDialogue.service';
import { SharedService } from '../services/shared.service';
import { FavouriteHandlerService } from '../services/handlers/favourite-handler.service';
import { ExportHandlerService } from '../services/handlers/export-handler.service';
import { BroadcastService } from '../services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { FinaliseModalComponent, FinaliseModalResponse } from '@mdm/modals/finalise-modal/finalise-modal.component';
import { VersioningGraphModalComponent } from '@mdm/modals/versioning-graph-modal/versioning-graph-modal.component';
import { SecurityModalComponent } from '../modals/security-modal/security-modal.component';
import { EditingService } from '@mdm/services/editing.service';
import { catchError, finalize } from 'rxjs/operators';
import { ModelMergingModel } from '@mdm/model/model-merging-model';
import { ModelDomainType } from '@mdm/model/model-domain-type';
import { DataModelDetail, DataModelDetailResponse, ModelUpdatePayload } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

@Component({
  selector: 'mdm-data-model-detail',
  templateUrl: './data-model-detail.component.html',
  styleUrls: ['./data-model-detail.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class DataModelDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() afterSave: any;
  @Input() editMode = false;
  @ViewChildren('editableText') editForm: QueryList<any>;
  @ViewChild('aLink', { static: false }) aLink: ElementRef;
  result: DataModelDetail;
  hasResult = false;
  subscription: Subscription;
  showSecuritySection: boolean;
  showUserGroupAccess: boolean;
  showEdit: boolean;
  showFinalise: boolean;
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
  showEditMode = false;
  processing = false;
  showNewVersion = false;
  compareToList = [];
  exportError = null;
  exportedFileIsReady = false;
  exportList = [];
  addedToFavourite = false;
  download: any;
  downloadLink: any;
  urlText: any;
  canEditDescription = true;
  showEditDescription = false;
  branchGraph = [];
  currentBranch = '';

  constructor(
    private renderer: Renderer2,
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private broadcastSvc: BroadcastService,
    private helpDialogueService: HelpDialogueHandlerService,
    private dialog: MatDialog,
    private favouriteHandler: FavouriteHandlerService,
    private exportHandler: ExportHandlerService,
    private title: Title,
    private editingService: EditingService
  ) { }

  ngOnInit() {

    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.loadExporterList();
    this.DataModelDetails();

    this.editableForm = new EditableDataModel();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.editForm.forEach(x =>
        x.edit({
          editing: true,
          focus: x.name === 'moduleName' ? true : false
        })
      );
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.setEditableFormData();
      if (this.result.classifiers) {
        this.result.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.result.aliases) {
        this.result.aliases.forEach(item => {
          this.editableForm.aliases.push(item);
        });
      }
    };

    this.subscription = this.messageService.changeUserGroupAccess.subscribe((message: boolean) => {
      this.showSecuritySection = message;
    });
  }

  ngAfterViewInit(): void {
    this.editForm.changes.subscribe(() => {
      if (this.editMode) {
        this.editForm.forEach(x => x.edit({
          editing: true,
          focus: x.name === 'moduleName' ? true : false
        }));
        this.showForm();
      }
    });
  }


  DataModelDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(serverResult => {
      this.result = serverResult;
      this.setEditableFormData();
      if(this.result.domainType === 'DataModel') {
         this.getModelGraph(this.result.id);
      }
      if (this.result.classifiers) {
        this.result.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.result.aliases) {
        this.result.aliases.forEach(item => {
          this.editableForm.aliases.push(item);
        });
      }
      if (this.result.semanticLinks) {
        this.result.semanticLinks.forEach(link => {
          if (link.linkType === 'New Version Of') {
            this.compareToList.push(link.target);
          }
        });
      }

      if (this.result.semanticLinks) {
        this.result.semanticLinks.forEach(link => {
          if (link.linkType === 'Superseded By') {
            this.compareToList.push(link.target);
          }
        });
      }

      if (this.result != null) {
        this.hasResult = true;
        this.watchDataModelObject();
      }
      this.title.setTitle(`${this.result?.type} - ${this.result?.label}`);
    });
  }

  watchDataModelObject() {
    const access: any = this.securityHandler.elementAccess(this.result);
    if (access !== undefined) {
      this.showEdit = access.showEdit;
      this.showPermission = access.showPermission;
      this.showDelete = access.showPermanentDelete || access.showSoftDelete;
      this.showFinalise = access.showFinalise;
      this.showNewVersion = access.showNewVersion;
      this.showSoftDelete = access.showSoftDelete;
      this.showPermDelete = access.showPermanentDelete;
      this.canEditDescription = access.canEditDescription;
    }
    this.addedToFavourite = this.favouriteHandler.isAdded(this.result);
  }

  toggleSecuritySection() {
    this.dialog.open(SecurityModalComponent, {
      data: {
        element: 'dataModel',
        domainType: 'DataModel'
      }, panelClass: 'security-modal'
    });
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  getModelGraph = modelId => {
    this.resourcesService.dataModel.modelVersionTree(modelId).subscribe(res => {
      this.currentBranch = this.result.branchName;
      this.branchGraph = res.body;
    }, error => {
      this.messageHandler.showError('There was a problem getting the Model Version Tree.', error);
    });
  };

  onModelChange = () => {
    for (const val in this.branchGraph) {
      if (this.branchGraph[val].branchName === this.currentBranch) {
        this.stateHandler.Go('datamodel', { id: this.branchGraph[val].modelId }, { reload: true, location: true });
      }
    }
  };

  delete(permanent) {
    if (!this.showDelete) {
      return;
    }
    this.deleteInProgress = true;

    this.resourcesService.dataModel.remove(this.result.id, { permanent }).subscribe(() => {
      if (permanent) {
        this.broadcastSvc.broadcast('$reloadFoldersTree');
        this.stateHandler.Go('appContainer.mainApp.twoSidePanel.catalogue.allDataModel');
      } else {
        this.broadcastSvc.broadcast('$reloadFoldersTree');
        this.stateHandler.reload();
      }
    }, error => {
      this.deleteInProgress = false;
      this.messageHandler.showError('There was a problem deleting the Data Model.', error);
    });
  }

  askForSoftDelete() {
    if (!this.showSoftDelete) {
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
    if (!this.showPermDelete) {
      return;
    }

    this.dialog
      .openDoubleConfirmationAsync({
        data: {
          title: 'Permanent deletion',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: 'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Data Model?'
        }
      }, {
        data: {
          title: 'Confirm permanent deletion',
          okBtnTitle: 'Confirm deletion',
          btnType: 'warn',
          message: `<p class='marginless'><strong>Note: </strong>All its 'Data Classes', 'Data Elements' and 'Data Types'
                    <p class='marginless'>will be deleted <span class='warning'>permanently</span>.</p>`
        }
      })
      .subscribe(() => this.delete(true));
  }

  restore() {
    if (!this.isAdminUser || !this.result.deleted) {
      return;
    }

    this.processing = true;

    this.resourcesService.dataModel
      .undoSoftDelete(this.result.id)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem restoring the Data Model.', error);
          return EMPTY;
        }),
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(`The Data Model "${this.result.label}" has been restored.`);
        this.stateHandler.reload();
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      });
  }

  formBeforeSave() {
    this.editMode = false;
    this.errorMessage = '';

    const classifiers = [];
    this.editableForm.classifiers.forEach(cls => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach(alias => {
      aliases.push(alias);
    });

    const resource: ModelUpdatePayload = {
      id: this.result.id,
      domainType: this.result.domainType,
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
      this.resourcesService.dataModel.update(this.result.id, resource).subscribe((res: DataModelDetailResponse) => {
        this.messageHandler.showSuccess('Data Model updated successfully.');
        this.editableForm.visible = false;
        this.result.description = res.body.description;
        this.editForm.forEach(x => x.edit({ editing: false }));
        this.editingService.stop();
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      }, error => {
        this.messageHandler.showError('There was a problem updating the Data Model.', error);
      });
    }
  };

  validateLabel(data): any {
    if (!data || (data && data.trim().length === 0)) {
      this.errorMessage = 'DataModel name can not be empty';
      return false;
    } else {
      return true;
    }
  }

  showForm() {
    this.showEditDescription = false;
    this.editingService.start();
    this.editableForm.show();
  }

  onCancelEdit() {
    this.errorMessage = '';
    this.editMode = false; // Use Input editor whe adding a new folder.
    this.showEditDescription = false;
  }

  loadHelp() {
    this.helpDialogueService.open('Edit_model_details');
  }

  toggleFavourite() {
    if (this.favouriteHandler.toggle(this.result)) {
      this.addedToFavourite = this.favouriteHandler.isAdded(this.result);
    }
  }

  finalise() {
    const promise = new Promise(() => {
      this.resourcesService.dataModel.latestModelVersion(this.result.id).subscribe(response => {
        const dialog = this.dialog.open<FinaliseModalComponent, any, FinaliseModalResponse>(FinaliseModalComponent, {
          data: {
            modelVersion: response.body.modelVersion,
            title: 'Finalise Data Model',
            okBtnTitle: 'Finalise Data Model',
            btnType: 'accent',
            message: `<p class='marginless'>Please select the version you would like this Data Model</p>
                      <p>to be finalised with: </p>`
          }
        });

        dialog.afterClosed().subscribe(dialogResult => {
          if (dialogResult?.status !== ModalDialogStatus.Ok) {
            return;
          }
          this.processing = true;
          this.resourcesService.dataModel.finalise(this.result.id, dialogResult.request).subscribe(() => {
            this.processing = false;
            this.messageHandler.showSuccess('Data Model finalised successfully.');
            this.stateHandler.Go('datamodel', { id: this.result.id }, { reload: true });
          }, error => {
            this.processing = false;
            this.messageHandler.showError('There was a problem finalising the Data Model.', error);
          });
        });
      });
    });
    return promise;
  }

  newVersion() {
    this.stateHandler.Go('newVersionDataModel', { dataModelId: this.result.id }, { location: true });
  }

  compare(dataModel = null) {
    this.stateHandler.NewWindow('modelscomparison',
      {
        sourceId: this.result.id,
        targetId: dataModel ? dataModel.id : null
      },
      null
    );
  }

  merge = () => {
    this.stateHandler.Go('modelsmerging', new ModelMergingModel(this.result.id, null, ModelDomainType.DATA_MODELS),   null);
  };

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
    promise.then(() => {
    }).catch(() => { });
  };

  export(exporter) {
    this.exportError = null;
    this.processing = true;
    this.exportedFileIsReady = false;
    this.exportHandler.exportDataModel([this.result], exporter, 'dataModels').subscribe(result => {
      if (result != null) {
        this.exportedFileIsReady = true;
        const label = [this.result].length === 1 ? [this.result][0].label : 'data_models';
        const fileName = this.exportHandler.createFileName(label, exporter);
        const file = new Blob([result.body], { type: exporter.fileType });
        const link = this.exportHandler.createBlobLink(file, fileName);

        this.processing = false;
        this.renderer.appendChild(this.aLink.nativeElement, link);
      } else {
        this.processing = false;
        this.messageHandler.showError('There was a problem exporting the Data Model.', '');
      }
    }, error => {
      this.processing = false;
      this.messageHandler.showError('There was a problem exporting the Data Model.', error);
    });
  }

  loadExporterList() {
    this.exportList = [];
    this.securityHandler.isAuthenticated().subscribe(result => {
      if (!result.body.authenticatedSession) {
        return;
      }

      this.resourcesService.dataModel.exporters().subscribe(res => {
        this.exportList = res.body;
      }, error => {
        this.messageHandler.showError('There was a problem loading exporters list.', error);
      });
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

  private setEditableFormData() {
    this.editableForm.description = this.result.description;
    this.editableForm.label = this.result.label;
    this.editableForm.organisation = this.result.organisation;
    this.editableForm.author = this.result.author;
  }

}