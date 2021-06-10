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
import { Component, OnInit } from '@angular/core';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { Title } from '@angular/platform-browser';
import { CatalogueItemDomainType, CodeSetCreatePayload, CodeSetDetailResponse, Container, Uuid } from '@maurodatamapper/mdm-resources';
import { FolderService } from '@mdm/folders-tree/folder.service';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { getCatalogueItemDomainTypeIcon } from '@mdm/folders-tree/flat-node';

@Component({
  selector: 'mdm-code-set-main',
  templateUrl: './code-set-main.component.html',
  styleUrls: ['./code-set-main.component.scss'],
})
export class CodeSetMainComponent implements OnInit {
  parentFolderId: Uuid;
  parentDomainType: CatalogueItemDomainType;
  parentFolder: Container;
  savingInProgress = false;
  model = {
    label: '',
    author: '',
    organisation: '',
    description: '',
    classifiers: [],
    terms: [],
  };

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private folders: FolderService,
    private title: Title) { }

  ngOnInit() {
    this.title.setTitle('New Code Set');

    this.parentFolderId = this.uiRouterGlobals.params.parentFolderId;
    this.parentDomainType = this.uiRouterGlobals.params.parentDomainType;

    this.folders
      .getFolder(this.parentFolderId, this.parentDomainType)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem loading the Folder.', error);
          return EMPTY;
        })
      )
      .subscribe(response => {
        this.parentFolder = response.body;
      });
  }

  getFolderIcon() {
    return getCatalogueItemDomainTypeIcon(this.parentDomainType);
  }

  save() {
    if (this.model.label && this.model.author && this.model.organisation && this.model.terms.length > 0) {
      const resource: CodeSetCreatePayload = {
        label: this.model.label,
        author: this.model.author,
        organisation: this.model.organisation,
        description: this.model.description,
        classifiers: this.model.classifiers,
        folder: this.parentFolderId,
        terms: this.model.terms
      };

      this.resources.codeSet
        .addToFolder(this.parentFolderId, resource)
        .pipe(
          catchError(error => {
            this.messageHandler.showError('There was a problem creating the Code Set.', error);
            return EMPTY;
          })
        )
        .subscribe((response: CodeSetDetailResponse) => {
          this.messageHandler.showSuccess('Code Set created successfully.');
          this.stateHandler.Go('codeset', { id: response.body.id }, { reload: true });
        });
    }
  }
}
