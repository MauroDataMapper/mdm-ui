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
import {
  Component,
  ElementRef,
  Input, OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { EditableDataModel } from '@mdm/model/dataModelModel';
import { Subscription } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { SharedService } from '@mdm/services/shared.service';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { FavouriteHandlerService } from '@mdm/services/handlers/favourite-handler.service';
import { CodeSetResult } from '@mdm/model/codeSetModel';
import { DialogPosition, MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { FinaliseModalComponent } from '@mdm/modals/finalise-modal/finalise-modal.component';
import { SecurityModalComponent } from '@mdm/modals/security-modal/security-modal.component';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-code-set-details',
  templateUrl: './code-set-details.component.html',
  styleUrls: ['./code-set-details.component.scss']
})
export class CodeSetDetailsComponent implements OnInit, OnDestroy {

  @ViewChild('aLink', { static: false }) aLink: ElementRef;
  @ViewChildren('editableText') editForm: QueryList<any>;

  @Input() afterSave: any;
  @Input() editMode = false;

  result: CodeSetResult;
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
  currentBranch = '';
  branchGraph = [];

  canEditDescription = true;
  showEditDescription = false;

  constructor(private resourcesService: MdmResourcesService,
              private messageService: MessageService,
              private messageHandler: MessageHandlerService,
              private securityHandler: SecurityHandlerService,
              private stateHandler: StateHandlerService,
              private sharedService: SharedService,
              private elementDialogueService: ElementSelectorDialogueService,
              private broadcastSvc: BroadcastService,
              private helpDialogueService: HelpDialogueHandlerService,
              private dialog: MatDialog,
              private favouriteHandler: FavouriteHandlerService,
              private title: Title,
              private editingService: EditingService) {
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.CodeSetDetails();
  }

  public showAddElementToMarkdown() { // Remove from here & put in markdown
    this.elementDialogueService.open('Search_Help', 'left' as DialogPosition);
  }

  ngOnInit() {
    this.editableForm = new EditableDataModel();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;


    this.editableForm.show = () => {
      this.editForm.forEach(x => x.edit({
        editing: true,
        focus: x.name === 'moduleName' ? true : false
      }));
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.editableForm.description = this.result.description;
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

  CodeSetDetails(): any {

    this.subscription = this.messageService.dataChanged$.subscribe(serverResult => {

      if(serverResult.domainType !== 'CodeSet')
      {
        return;
      }

      this.result = serverResult;


      this.getModelGraph(this.result.id);

      this.editableForm.description = this.result.description;
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
      this.title.setTitle(`Code Set - ${this.result?.label}`);
    });
  }

  watchDataModelObject() {
    const access: any = this.securityHandler.elementAccess(this.result);
    if (access !== undefined) {
      this.showEdit = access.showEdit;
      this.canEditDescription = access.canEditDescription;
      this.showPermission = access.showPermission;
      this.showDelete = access.showSoftDelete || access.showPermanentDelete;
      this.showSoftDelete = access.showSoftDelete;
      this.showPermDelete = access.showPermanentDelete;
      this.showFinalise = access.showFinalise;
      this.showNewVersion = access.showNewVersion;
    }
    this.addedToFavourite = this.favouriteHandler.isAdded(this.result);

  }

  toggleSecuritySection() {
    this.dialog.open(SecurityModalComponent, {
      data: {
        element: 'result',
        domainType: 'codeSets'
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

  delete(permanent) {
    if (!this.showDelete) {
      return;
    }
    this.deleteInProgress = true;

    this.resourcesService.codeSet.remove(this.result.id, { permanent }).subscribe(() => {
      if (permanent) {
        this.stateHandler.Go('allDataModel', { reload: true, location: true }, null);
      } else {
        this.stateHandler.reload();
      }
      this.broadcastSvc.broadcast('$reloadFoldersTree');
    }, error => {
      this.deleteInProgress = false;
      this.messageHandler.showError('There was a problem deleting the Code Set.', error);
    });

  }

  askForSoftDelete() {
    if (!this.showSoftDelete) {
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

  getModelGraph = (codesetId) => {
    this.currentBranch = this.result.branchName;
    this.branchGraph = [
      {
        branchName: 'main',
        label: this.result.label,
        codesetId,
        newBranchModelVersion: false,
        newDocumentationVersion: false,
        newFork: false
      }
    ];

    this.resourcesService.codeSet.modelVersionTree(codesetId).subscribe(res => {
      this.currentBranch = this.result.branchName;
      this.branchGraph = res.body;
    }, error => {
      this.messageHandler.showError('There was a problem getting the Model Version Tree.', error);
    });
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


  askForPermanentDelete(): any {
    if (!this.showPermDelete) {
      return;
    }

    this.dialog
      .openDoubleConfirmationAsync({
        data: {
          title: 'Delete permanently',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: 'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Code Set?'
        }
      }, {
        data: {
          title: 'Are you sure you want to delete this Code Set?',
          okBtnTitle: 'Confirm deletion',
          btnType: 'warn',
          message: '<strong>Note: </strong>It will be deleted <span class=\'warning\'>permanently</span>.'
        }
      })
      .subscribe(() => this.delete(true));
  }

  formBeforeSave = async () => {
    this.editMode = false;
    this.errorMessage = '';
    this.editForm.forEach((modules) => {
      if (modules.config.name === 'moduleName') {
        this.result.label = modules.getHotState().value;
      }
      if (modules.config.name === 'moduleNameAuthor') {
        this.result.author = modules.getHotState().value;
      }
      if (modules.config.name === 'moduleNameOrganisation') {
        this.result.organisation = modules.getHotState().value;
      }

    });

    const classifiers = [];
    this.editableForm.classifiers.forEach(cls => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach(alias => {
      aliases.push(alias);
    });
    let resource = {};
    if (!this.showEditDescription) {
      resource = {
        id: this.result.id,
        label: this.result.label,
        description: this.editableForm.description || '',
        author: this.result.author,
        organisation: this.result.organisation,
        aliases,
        classifiers
      };
    }

    if (this.showEditDescription) {
      resource = {
        id: this.result.id,
        description: this.editableForm.description || ''
      };
    }

    if (this.validateLabel(this.result.label)) {
      await this.resourcesService.codeSet.update(this.result.id, resource).subscribe(res => {
        this.editingService.stop();
        this.messageHandler.showSuccess('Code Set updated successfully.');
        this.editableForm.visible = false;
        this.result.description = res.body.description;
        this.editForm.forEach(x => x.edit({ editing: false }));
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      }, error => {
        this.messageHandler.showError('There was a problem updating the Code Set.', error);
      });
    }
  };

  validateLabel(data): any {
    if (!data || (data && data.trim().length === 0)) {
      this.errorMessage = 'Code Set name can not be empty';
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

  public loadHelp() {
    this.helpDialogueService.open('Edit_model_details');
  }

  toggleFavourite() {
    if (this.favouriteHandler.toggle(this.result)) {
      this.addedToFavourite = this.favouriteHandler.isAdded(this.result);
    }
  }

  finalise() {
    const promise = new Promise(() => {
      this.resourcesService.codeSet.latestModelVersion(this.result.id).subscribe(response => {
        const dialog = this.dialog.open(FinaliseModalComponent, {
          data: {
            title: 'Finalise Code Set',
            modelVersion: response.body.modelVersion,
            okBtnTitle: 'Finalise Code Set',
            btnType: 'accent',
            message: `<p class='marginless'>Please select the version you would like this Code Set</p>
                        <p>to be finalised with: </p>`
          }
        });

        dialog.afterClosed().subscribe(result => {
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
          this.resourcesService.codeSet.finalise(this.result.id, data).subscribe(() => {
            this.processing = false;
            this.messageHandler.showSuccess('Code Set finalised successfully!');
            this.stateHandler.Go('codeset', { id: this.result.id }, { reload: true });
          }, error => {
            this.processing = false;
            this.messageHandler.showError('There was a problem finalising the CodeSet.', error);
          });
        });
      });
    });
    return promise;
  }

  onLabelChange(value: any) {
    if (!this.validateLabel(value)) {
      this.editableForm.validationError = true;
    } else {
      this.editableForm.validationError = false;
      this.errorMessage = '';
    }
  }
  newVersion() {
    this.stateHandler.Go(
      'newVersionCodeSet',
      { codeSetId: this.result.id },
      { location: true }
    );
  }

  showDescription = () => {
    this.editingService.start();
    this.showEditDescription = true;
    this.editableForm.show();
  };
}
