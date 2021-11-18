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
import { Component, Input, OnInit } from '@angular/core';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { EditingService } from '@mdm/services/editing.service';
import {
  TermDetail,
  TermDetailResponse,
  TerminologyDetailResponse,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { ValidatorService } from '@mdm/services';
import { MatDialog } from '@angular/material/dialog';
import { UIRouterGlobals } from '@uirouter/angular';
import { Access } from '@mdm/model/access';

@Component({
  selector: 'mdm-term-details',
  templateUrl: './term-details.component.html',
  styleUrls: ['./term-details.component.scss']
})
export class TermDetailsComponent implements OnInit {
  @Input() hideEditButton: any;
  @Input() openEditForm: any;

  editMode = false;
  mcTerm: TermDetail;
  originalTerm: TermDetail;
  terminologyId: string;

  deleteInProgress: boolean;

  parentLabel = '';
  access: Access;

  compareToList = [];

  constructor(
    private securityHandler: SecurityHandlerService,
    private title: Title,
    private messageHandler: MessageHandlerService,
    private resourcesService: MdmResourcesService,
    private broadcast: BroadcastService,
    private editingService: EditingService,
    private validatorServive: ValidatorService,
    private uiRouterGlobals: UIRouterGlobals,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.termDetails();
  }

  termDetails(): any {
    const termId : Uuid = this.uiRouterGlobals.params.id;
    this.terminologyId = this.uiRouterGlobals.params.terminologyId;
    this.resourcesService.term
      .get(this.terminologyId, termId)
      .subscribe((termDetailResult: TermDetailResponse) => {
        this.mcTerm = termDetailResult.body;

        this.resourcesService.terminology
          .get(this.mcTerm.model)
          .subscribe((result: TerminologyDetailResponse) => {
            this.parentLabel = result.body.label;
          });

        if (this.mcTerm.semanticLinks) {
          this.mcTerm.semanticLinks.forEach((link) => {
            if (link.linkType === 'New Version Of') {
              this.compareToList.push(link.target);
            }
          });
        }

        if (this.mcTerm.semanticLinks) {
          this.mcTerm.semanticLinks.forEach((link) => {
            if (link.linkType === 'Superseded By') {
              this.compareToList.push(link.target);
            }
          });
        }
        this.access = this.securityHandler.elementAccess(this.mcTerm);
        this.originalTerm = Object.assign({}, this.mcTerm);
        this.title.setTitle(`Term - ${this.mcTerm?.label}`);
      });
  }

  cancel() {
    this.editingService.stop();
    this.mcTerm = Object.assign({}, this.originalTerm);
    this.editMode = false; // Use Input editor whe adding a new folder.
  }

  save() {
    if (this.validatorServive.validateLabel(this.mcTerm.definition)) {

      this.resourcesService.term
        .update(this.terminologyId, this.mcTerm.id, this.mcTerm)
        .subscribe(
          (res: TermDetailResponse) => {
            this.messageHandler.showSuccess('Term updated successfully.');
            this.editingService.stop();
            this.originalTerm = res.body;
            this.editMode = false;
            this.broadcast.reloadCatalogueTree();
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Term.',
              error
            );
          }
        );
    } else {
      this.messageHandler.showError(
        'There is an error with the label please correct and try again'
      );
    }
  }

  askForPermanentDelete() {
    this.dialog
      .openDoubleConfirmationAsync(
        {
          data: {
            title: 'Permanent deletion',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message: `<p>Are you sure you want to <span class='warning'>permanently</span> delete this Term?</p>
                    <p class='marginless'><strong>Note:</strong> You are deleting the <strong><i>${this.mcTerm.label}</i></strong> Term.</p>`
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message:
              '<strong>Note: </strong> All its contents will be deleted <span class="warning">permanently</span>.'
          }
        }
      )
      .subscribe(() => this.delete());
  }

  delete() {
    this.resourcesService.term
      .remove(this.terminologyId, this.mcTerm.id)
      .subscribe(
        () => {
          this.messageHandler.showSuccess('Term deleted successfully.');
        },
        (error) => {
          this.deleteInProgress = false;
          this.messageHandler.showError(
            'There was a problem deleting the Term.',
            error
          );
        }
      );
  }

  showForm() {
    this.editingService.start();
    this.editMode = true;
  }
}
