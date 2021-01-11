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
import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { ExportHandlerService } from '@mdm/services/handlers/export-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { EditableDataModel } from '@mdm/model/dataModelModel';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { SharedService } from '@mdm/services/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { FavouriteHandlerService } from '@mdm/services/handlers/favourite-handler.service';
import { Title } from '@angular/platform-browser';
import { FinaliseModalComponent } from '@mdm/modals/finalise-modal/finalise-modal.component';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-terminology-details',
  templateUrl: './terminology-details.component.html',
  styleUrls: ['./terminology-details.component.sass']
})
export class TerminologyDetailsComponent implements OnInit {
  @Input() mcTerminology: any;
  @Input() hideEditButton: boolean;
  @Output() afterSave = new EventEmitter<any>();
  @Output() openEditFormChanged = new EventEmitter<any>();
  @ViewChild('aLink', { static: false }) aLink: ElementRef;

  openEditFormVal: any;
  securitySection = false;
  processing = false;
  exportError = null;
  exportList = [];
  isAdminUser = this.sharedService.isAdminUser();
  isLoggedIn = this.securityHandler.isLoggedIn();
  exportedFileIsReady = false;
  addedToFavourite = false;
  deleteInProgress = false;
  editableForm: EditableDataModel;
  showEdit: boolean;
  showPermission: boolean;
  showNewVersion: boolean;
  showFinalise: boolean;
  showDelete: boolean;
  showSoftDelete: boolean;
  showPermDelete: boolean;
  errorMessage: string;
  exporting: boolean;
  currentBranch = '';
  branchGraph = [];


  @Input() get openEditForm() {
    return this.openEditFormVal;
  }
  set openEditForm(val) {
    this.openEditFormVal = val;
    this.openEditFormChanged.emit(this.openEditFormVal);
  }

  constructor(
    private sharedService: SharedService,
    private helpDialogueHandler: HelpDialogueHandlerService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private exportHandler: ExportHandlerService,
    private securityHandler: SecurityHandlerService,
    private broadcastSvc: BroadcastService,
    private favouriteHandler: FavouriteHandlerService,
    private title: Title,
    private renderer: Renderer2,
    private editingService: EditingService) {}

  ngOnInit() {
    this.editableForm = new EditableDataModel();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    const access: any = this.securityHandler.elementAccess(this.mcTerminology);
    this.showEdit = access.showEdit;
    this.showPermission = access.showPermission;
    this.showNewVersion = access.showNewVersion;
    this.showFinalise = access.showFinalise;
    this.showDelete = access.showSoftDelete || access.showPermanentDelete;
    this.showSoftDelete = access.showSoftDelete;
    this.showPermDelete = access.showPermanentDelete;

    this.editableForm.show = () => {
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.editableForm.description = this.mcTerminology.description;
      if (this.mcTerminology.classifiers) {
        this.mcTerminology.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
    };

    this.loadExporterList();
    this.getModelGraph(this.mcTerminology.id);
    this.addedToFavourite = this.favouriteHandler.isAdded(this.mcTerminology);
    this.title.setTitle(`Terminology - ${this.mcTerminology?.label}`);
  }

  validateLabel = data => {
    if (!data || (data && data.trim().length === 0)) {
      return 'Terminology name can not be empty';
    }
  };

  getModelGraph = (modelId) => {
    this.currentBranch = this.mcTerminology.branchName;
    this.branchGraph = [
      {
        branchName: 'main',
        label: this.mcTerminology.label,
        modelId,
        newBranchModelVersion: false,
        newDocumentationVersion: false,
        newFork: false
      }
    ];
  };

  onModelChange = () => {
    for (const val in this.branchGraph) {
      if (this.branchGraph[val].branchName === this.currentBranch) {
        this.stateHandler.Go(
          'terminology',
          { id: this.branchGraph[val].id },
          { reload: true, location: true }
        );
      }
    }
  };

  formBeforeSave = () => {
    const resource = {
      id: this.mcTerminology.id,
      label: this.editableForm.label,
      description: this.editableForm.description,
      author: this.editableForm.author,
      organisation: this.editableForm.organisation,
      type: this.mcTerminology.type,
      domainType: this.mcTerminology.domainType,
      aliases: this.mcTerminology.editAliases,

      classifiers: this.mcTerminology.classifiers.map(cls => {
        return { id: cls.id };
      })
    };

    this.resources.terminology.update(resource.id, resource).subscribe(res => {
        const result = res.body;

        if (this.afterSave) {
          this.afterSave.emit(resource);
        }
        this.mcTerminology.aliases = Object.assign({}, result.aliases || []);
        this.mcTerminology.editAliases = Object.assign({}, this.mcTerminology.aliases);

        this.editingService.stop();

        this.messageHandler.showSuccess('Terminology updated successfully.');
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      }, error => {
        this.messageHandler.showError('There was a problem updating the Terminology.', error);
      }
    );
  };

  toggleSecuritySection = () => {
    this.securitySection = !this.securitySection;
  };

  export(exporter) {
    this.exportError = null;
    this.processing = true;
    this.exportedFileIsReady = false;
    this.exportHandler.exportDataModel([this.mcTerminology], exporter, 'terminologies').subscribe(result => {
      if (result != null) {
        this.exportedFileIsReady = true;
        const label = [this.mcTerminology].length === 1 ? [this.mcTerminology][0].label : 'data_models';
        const fileName = this.exportHandler.createFileName(label, exporter);
        const file = new Blob([result.body], { type: exporter.fileType });
        const link = this.exportHandler.createBlobLink(file, fileName);

        this.processing = false;
        this.renderer.appendChild(this.aLink.nativeElement, link);
      } else {
        this.processing = false;
        this.messageHandler.showError('There was a problem exporting this Terminology.', '');
      }
    }, error => {
      this.processing = false;
      this.messageHandler.showError('There was a problem exporting this Terminology.', error);
    });
  }

  resetExportError = () => {
    this.exportError = null;
  };

  delete = (permanent) => {
    if (!this.showDelete) {
      return;
    }
    this.deleteInProgress = true;
    this.resources.terminology.remove(this.mcTerminology.id, { permanent }).subscribe(() => {
        if (permanent) {
          this.stateHandler.Go('allDataModel', { reload: true, location: true }, null);
        } else {
          this.stateHandler.reload();
        }
        this.broadcastSvc.broadcast('$reloadFoldersTree');
        this.broadcastSvc.broadcast('$elementDeleted');
      }, error => {
        this.deleteInProgress = false;
        this.messageHandler.showError('There was a problem deleting the Terminology.', error);
      });
  };

  askForSoftDelete = () => {
    if (!this.showSoftDelete) {
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
  };

  askForPermanentDelete = () => {
    if (!this.showPermDelete) {
      return;
    }

    this.dialog
      .openDoubleConfirmationAsync({
        data: {
          title: 'Permanent deletion',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: 'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Terminology?'
        }
      }, {
        data: {
          title: 'Confirm permanent deletion',
          okBtnTitle: 'Confirm deletion',
          btnType: 'warn',
          message: '<strong>Note: </strong>All its \'Terms\' will be deleted <span class=\'warning\'>permanently</span>.'
        }
      })
      .subscribe(() => this.delete(true));
  };

  openEditClicked = formName => {
    if (this.openEditForm) {
      this.openEditForm(formName);
    }
  };

  newVersion = () => {
    this.stateHandler.Go('newVersionTerminology', { id: this.mcTerminology.id }, { location: true });
  };

  finalise = () => {
    this.resources.terminology.latestModelVersion(this.mcTerminology.id).subscribe(response => {
      this.dialog.open(FinaliseModalComponent, {
          data: {
            title: 'Finalise Terminology',
            modelVersion: response.body.modelVersion,
            okBtnTitle: 'Finalise Terminology',
            btnType: 'accent',
            message: `<p class='marginless'>Please select the version you would like this Terminology</p>
                      <p>to be finalised with: </p>`
          }
        }).afterClosed().subscribe(result => {
          if (result?.status !== 'ok') {
            return;
          }
          this.processing = true;
          const data = {};
          if (result.data.versionList !== 'Custom') {
            data['versionChangeType'] = result.data.versionList;
          } else {
            data['version'] = result.data.versionNumber;
          }

          this.resources.terminology.finalise(this.mcTerminology.id, data).subscribe(() => {
              this.processing = false;
              this.messageHandler.showSuccess('Terminology finalised successfully.');
              this.stateHandler.Go('terminology', { id: this.mcTerminology.id }, { reload: true });
            }, error => {
              this.processing = false;
              this.messageHandler.showError('There was a problem finalising the Terminology.', error);
          });
        });
      });
  };

  onCancelEdit = () => {
    this.mcTerminology.editAliases = Object.assign({}, this.mcTerminology.aliases);
  };

  loadExporterList = () => {
    this.exportList = [];
    this.securityHandler.isAuthenticated().subscribe(result => {
      if (result.body === false) {
        return;
      }
      this.resources.terminology.exporters().subscribe(result2 => {
        this.exportList = result2.body;
      },
      error => {
        this.messageHandler.showError('There was a problem loading exporters list.', error);
      });
    });
  };

  toggleFavourite = () => {
    if (this.favouriteHandler.toggle(this.mcTerminology)) {
      this.addedToFavourite = this.favouriteHandler.isAdded(this.mcTerminology);
    }
  };

  loadHelp = () => {
    this.helpDialogueHandler.open('Terminology_details');
  };

  showForm() {
    this.editingService.start();
    this.editableForm.show();
  }
}
