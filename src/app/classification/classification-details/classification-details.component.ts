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
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { FolderHandlerService } from '@mdm/services/handlers/folder-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { DialogPosition } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { EditingService } from '@mdm/services/editing.service';
import {
  ClassifierDetail,
  ClassifierDetailResponse
} from '@maurodatamapper/mdm-resources';
import { ValidatorService } from '@mdm/services';
import { Access } from '@mdm/model/access';

@Component({
  selector: 'mdm-classification-details',
  templateUrl: './classification-details.component.html',
  styleUrls: ['./classification-details.component.sass']
})
export class ClassificationDetailsComponent implements OnInit {
  @Input() classification: ClassifierDetail;
  originalClassification: ClassifierDetail;
  editMode = false;
  errorMessage = '';
  access: Access;

  constructor(
    private messageService: MessageService,
    private securityHandler: SecurityHandlerService,
    private folderHandler: FolderHandlerService,
    private elementDialogueService: ElementSelectorDialogueService,
    private stateHandler: StateHandlerService,
    private title: Title,
    private dialog: MatDialog,
    private validator: ValidatorService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private editing: EditingService,
    private broadcast: BroadcastService
  ) {
  }

  public showAddElementToMarkdown() {
    // Remove from here & put in markdown
    this.elementDialogueService.open('Search_Help', 'left' as DialogPosition);
  }

  ngOnInit() {
    this.originalClassification = Object.assign({}, this.classification);
    this.ClassifierDetails();
  }

  ClassifierDetails(): any {
    this.access = this.securityHandler.elementAccess(this.classification);
    this.title.setTitle(`Classifier - ${this.classification.label}`);
  }

  toggleSecuritySection() {
    this.dialog.openSecurityAccess(this.classification, 'classifier');
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  askForSoftDelete() {
    if (!this.securityHandler.isAdmin()) {
      return;
    }

    this.folderHandler
      .askForSoftDelete(this.classification.id)
      .subscribe(() => {
        this.stateHandler.reload();
      });
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
            message: `<p>Are you sure you want to <span class='warning'>permanently</span> delete this Classifier?</p>
                    <p class='marginless'><strong>Note:</strong> You are deleting the <strong><i>${this.classification.label}</i></strong> classifier.</p>`
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message:
              '<strong>Note: </strong> All its contents will be deleted <span class=\'warning\'>permanently</span>.'
          }
        }
      )
      .subscribe(() => this.delete());
  }

  save() {
    if (this.validator.validateLabel(this.classification.label)) {
      this.editMode = false;
      this.errorMessage = '';


      const resource = {
        id: this.classification.id,
        label: this.classification.label
      };

      this.resources.classifier
        .update(this.classification.id, resource)
        .subscribe(
          (result: ClassifierDetailResponse) => {
            this.messageHandler.showSuccess('Classifier updated successfully.');
            this.editing.stop();
            this.originalClassification = result.body;
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Classifier.',
              error
            );
          }
        );
    }
  }

  showForm() {
    this.editing.start();
    this.editMode = true;
  }

  cancel() {
    this.classification = Object.assign({}, this.originalClassification);
    this.editMode = false; // Use Input editor whe adding a new folder.
    this.errorMessage = '';
  }

  delete() {
    this.resources.classifier
      .remove(this.classification.id, { permanent: true })
      .subscribe(
        () => {
          this.messageHandler.showSuccess('Classifier deleted successfully.');
          this.broadcast.reloadClassificationTree();
          this.stateHandler.Go(
            'allDataModel',
            { reload: true, location: true },
            null
          );
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem deleting this Classification.',
            error
          );
        }
      );
  }
}
