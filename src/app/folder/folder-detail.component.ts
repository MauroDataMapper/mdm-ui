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
  Input,
  OnInit
} from '@angular/core';
import { MessageService } from '../services/message.service';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { FolderHandlerService } from '../services/handlers/folder-handler.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { SharedService } from '../services/shared.service';
import { BroadcastService } from '../services/broadcast.service';
import { DialogPosition, MatDialog } from '@angular/material/dialog';
import { ElementSelectorDialogueService } from '../services/element-selector-dialogue.service';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { EditingService } from '@mdm/services/editing.service';
import { ContainerUpdatePayload, FolderDetail, FolderDetailResponse } from '@maurodatamapper/mdm-resources';
import { ValidatorService } from '@mdm/services';
import { Access } from '@mdm/model/access';

@Component({
  selector: 'mdm-folder-detail',
  templateUrl: './folder-detail.component.html',
  styleUrls: ['./folder-detail.component.scss']
})
export class FolderDetailComponent implements OnInit {
  @Input() folder: FolderDetail;
  originalFolder: FolderDetail;

  editMode = false;
  isAdminUser: boolean;
  isLoggedIn: boolean;
  deleteInProgress: boolean;
  showEditMode = false;
  processing: boolean;
  access: Access;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private securityHandler: SecurityHandlerService,
    private messageHandlerService: MessageHandlerService,
    private folderHandler: FolderHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private elementDialogueService: ElementSelectorDialogueService,
    private broadcast: BroadcastService,
    private validatorService: ValidatorService,
    private title: Title,
    private editingService: EditingService,
    private dialog: MatDialog) {
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
  }

  ngOnInit(): void {
    this.FolderDetails();
    this.originalFolder = Object.assign({}, this.folder);
  }

  public showAddElementToMarkdown() {
    // Remove from here & put in markdown
    this.elementDialogueService.open('Search_Help', 'left' as DialogPosition);
  }

  FolderDetails(): any {
    this.access = this.securityHandler.elementAccess(this.folder);
    this.title.setTitle('Folder - ' + this.folder?.label);
  }

  toggleSecuritySection() {
    this.dialog.openSecurityAccess(this.folder, 'folder');
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  askForSoftDelete() {
    if (!this.access.showDelete) {
      return;
    }

    this.folderHandler
      .askForSoftDelete(this.folder.id)
      .subscribe(() => {
        this.stateHandler.reload();
      });
  }

  askForPermanentDelete(): any {
    if (!this.access.showPermanentDelete) {
      return;
    }

    this.folderHandler
      .askForPermanentDelete(this.folder.id)
      .subscribe(() => {
        this.broadcast.reloadCatalogueTree();
        this.stateHandler.Go('appContainer.mainApp.twoSidePanel.catalogue.allDataModel');
      });
  }

  save() {
    const resource: ContainerUpdatePayload = {
      id: this.folder.id,
      label: this.folder.label
    };

    if (this.validatorService.validateLabel(this.folder.label)) {
      this.resourcesService.folder.update(resource.id, resource).subscribe((result: FolderDetailResponse) => {
        this.messageHandlerService.showSuccess('Folder updated successfully.');
        this.editingService.stop();
        this.folder = result.body;
        this.editMode = false;
        this.broadcast.reloadCatalogueTree();
        this.stateHandler.reload();
      }, error => {
        this.messageHandlerService.showError('There was a problem updating the Folder.', error);
      });
    } else {
      this.messageHandlerService.showError('There is an error with the label please correct and try again');
    }
  }

  showForm() {
    this.editingService.start();
    this.editMode = true;
  }

  cancel() {
    this.editMode = false;
    this.folder = Object.assign({}, this.originalFolder);
  }
}
