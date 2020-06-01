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
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { ExportHandlerService } from '@mdm/services/handlers/export-handler.service';
import { ResourcesService } from '@mdm/services/resources.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { EditableDataModel } from '@mdm/model/dataModelModel';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { SharedService } from '@mdm/services/shared.service';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FavouriteHandlerService } from '@mdm/services/handlers/favourite-handler.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-terminology-details',
  templateUrl: './terminology-details.component.html',
  styleUrls: ['./terminology-details.component.sass']
})
export class TerminologyDetailsComponent implements OnInit {
  @Input() mcTerminology: any;
  @Input() hideEditButton: boolean;

  @Output() afterSave = new EventEmitter<any>();

  openEditFormVal: any;
  @Output() openEditFormChanged = new EventEmitter<any>();
  @Input()
  get openEditForm() {
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
    private resources: ResourcesService,
    private exportHandler: ExportHandlerService,
    private securityHandler: SecurityHandlerService,
    private broadcastSvc: BroadcastService,
    private favouriteHandler: FavouriteHandlerService,
    private title: Title
  ) {}

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
  errorMessage: string;
  exporting: boolean;

  ngOnInit() {
    this.editableForm = new EditableDataModel();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    const access: any = this.securityHandler.elementAccess(this.mcTerminology);
    this.showEdit = access.showEdit;
    this.showPermission = access.showPermission;
    this.showNewVersion = access.showNewVersion;
    this.showFinalise = access.showFinalise;
    this.showDelete = access.showDelete;

    this.editableForm.show = () => {
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
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
    this.addedToFavourite = this.favouriteHandler.isAdded(this.mcTerminology);
    this.title.setTitle(`Terminology - ${this.mcTerminology?.label}`);
  }

  validateLabel = data => {
    if (!data || (data && data.trim().length === 0)) {
      return 'Terminology name can not be empty';
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

    this.resources.terminology.put(resource.id, null, { resource }).subscribe(res => {
        const result = res.body;

        if (this.afterSave) {
          this.afterSave.emit(resource);
        }
        this.mcTerminology.aliases = Object.assign({}, result.aliases || []);
        this.mcTerminology.editAliases = Object.assign(
          {},
          this.mcTerminology.aliases
        );

        this.messageHandler.showSuccess('Terminology updated successfully.');
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      },
      error => {
        this.messageHandler.showError('There was a problem updating the Terminology.', error);
      }
    );
  };

  toggleSecuritySection = () => {
    this.securitySection = !this.securitySection;
  };

  export = exporter => {
    this.exportError = null;
    this.processing = true;
    this.exportedFileIsReady = false;

    this.exportHandler.exportDataModel([this.mcTerminology], exporter).subscribe(res => {
          const result = res.body;
          this.exportedFileIsReady = true;

          const aLink = this.exportHandler.createBlobLink(
            result.fileBlob,
            result.fileName
          );
          this.processing = false;
        }, () => {
          this.processing = false;
          this.exportError = 'An error occurred when processing the request.';
        }
      );
  };

  resetExportError = () => {
    this.exportError = null;
  };

  delete = (permanent?) => {
    if (!this.sharedService.isAdminUser()) {
      return;
    }
    const queryString = permanent ? 'permanent=true' : null;
    this.deleteInProgress = true;
    this.resources.terminology.delete(this.mcTerminology.id, null, queryString).subscribe(() => {
          if (permanent) {
            this.stateHandler.Go('allDataModel', { reload: true, location: true }, null);
          } else {
            this.stateHandler.reload();
          }
          this.broadcastSvc.broadcast('$elementDeleted', () => {
           // this.mcTerminology, permanent;  TODO
          });
        },
        error => {
          this.deleteInProgress = false;
          this.messageHandler.showError('There was a problem deleting the Terminology.', error);
        });
  };

  askForSoftDelete = () => {
    if (!this.sharedService.isAdminUser()) {
      return;
    }
    this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: 'Terminology',
          message:
            'Are you sure you want to delete this Terminology?<br>The Terminology will be marked as deleted and will not be viewable by users except Administrators.'
        }
      }).afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          return;
        }
        this.delete();
      });
  };

  askForPermanentDelete = () => {
    if (!this.sharedService.isAdminUser()) {
      return;
    }
    this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: 'Terminology',
          message:
            'Are you sure you want to <span class=\'errorMessage\'>permanently</span> delete this Terminology?'
        }
      }).afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          return;
        }
        this.dialog.open(ConfirmationModalComponent, {
            data: {
              title: 'Terminology',
              message:
                '<strong>Are you sure?</strong><br>All its \'Terms\' will be deleted <span class=\'errorMessage\'>permanently</span>.'
            }
          }).afterClosed().subscribe(result2 => {
            if (result2?.status !== 'ok') {
              return;
            }
            this.delete(true);
          });
      });
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
    this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: 'Are you sure you want to finalise the Terminology ?',
          message:
            'Once you finalise a Terminology, you can not edit it anymore!<br>' +
            'but you can create new version of it.'
        }
      }).afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          return;
        }
        this.processing = true;
        this.resources.terminology.put(this.mcTerminology.id, 'finalise', null).subscribe(() => {
              this.processing = false;
              this.messageHandler.showSuccess(
                'Terminology finalised successfully.'
              );
              this.stateHandler.Go(
                'terminology',
                { id: this.mcTerminology.id },
                { reload: true }
              );
            }, error => {
              this.processing = false;
              this.messageHandler.showError(
                'There was a problem finalising the Terminology.',
                error
              );
            }
          );
      });
  };

  onCancelEdit = () => {
    this.mcTerminology.editAliases = Object.assign({}, this.mcTerminology.aliases);
  };

  loadExporterList = () => {
    this.exportList = [];
    this.securityHandler.isValidSession().subscribe(result => {
      if (result.body === false) {
        return;
      }
      this.resources.public.dataModelExporterPlugins().subscribe(
        result2 => {
          this.exportList = result2;
        },
        error => {
          this.messageHandler.showError(
            'There was a problem loading exporters list.',
            error
          );
        }
      );
    });
  };

  toggleFavourite = () => {
    if (this.favouriteHandler.toggle(this.mcTerminology)) {
      this.addedToFavourite = this.favouriteHandler.isAdded(this.mcTerminology);
    }
  };

  loadHelp = () => {
    this.helpDialogueHandler.open('Terminology_details', {});
  };

  showForm() {
    this.editableForm.show();
  }
}
