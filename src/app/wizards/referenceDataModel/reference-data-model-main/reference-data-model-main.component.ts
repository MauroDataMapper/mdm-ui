/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import {
  CatalogueItemDomainType,
  Container,
  MdmResponse,
  ModelCreatePayload,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { FolderService } from '@mdm/folders-tree/folder.service';
import { MauroItem } from '@mdm/mauro/mauro-item.types';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatButton } from '@angular/material/button';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { ContentEditorComponent } from '@mdm/content/content-editor/content-editor.component';
import { NgIf } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';

@Component({
    selector: 'mdm-reference-data-model-main',
    templateUrl: './reference-data-model-main.component.html',
    styleUrls: ['./reference-data-model-main.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, ElementLinkComponent, MatFormField, MatLabel, MatInput, NgIf, MatError, ContentEditorComponent, ElementClassificationsComponent, MatButton]
})
export class ReferenceDataModelMainComponent implements OnInit {
  parentFolderId: Uuid;
  parentDomainType: CatalogueItemDomainType;
  parentFolder: Container;
  savingInProgress = false;
  setupForm = new FormGroup({
    label: new FormControl('', Validators.required),
    author: new FormControl(''),
    organisation: new FormControl(''),
    description: new FormControl(''),
    classifiers: new FormControl([])
  });

  get label() {
    return this.setupForm.controls.label;
  }

  get author() {
    return this.setupForm.controls.author;
  }

  get organisation() {
    return this.setupForm.controls.organisation;
  }

  get description() {
    return this.setupForm.controls.description;
  }

  get classifiers() {
    return this.setupForm.controls.classifiers;
  }

  set classifiersValue(value: any[]) {
    this.classifiers.setValue(value);
  }

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private folders: FolderService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('New Reference Data Model');

    this.parentFolderId = this.uiRouterGlobals.params.parentFolderId;
    this.parentDomainType = this.uiRouterGlobals.params.parentDomainType;

    this.folders
      .getFolder(this.parentFolderId, this.parentDomainType)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem loading the Folder.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((response) => {
        this.parentFolder = response.body;
      });
  }

  save() {
    if (!this.setupForm.valid) {
      return;
    }

    const payload: ModelCreatePayload = {
      label: this.label.value,
      author: this.author.value,
      organisation: this.organisation.value,
      description: this.description.value,
      classifiers: this.classifiers.value,
      folder: this.parentFolderId
    };

    this.resources.referenceDataModel
      .create(this.parentFolderId, payload)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem creating the Reference Data Model.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((response: MdmResponse<MauroItem>) => {
        this.messageHandler.showSuccess(
          'Reference Data Model created successfully.'
        );
        this.stateHandler.Go(
          'referencedatamodel',
          { id: response.body.id },
          { reload: true }
        );
      });
  }
}
