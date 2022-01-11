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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { CatalogueItemDomainType, Container, ModelCreatePayload, TerminologyDetailResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { FolderService } from '@mdm/folders-tree/folder.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'mdm-terminology-main',
  templateUrl: './terminology-main.component.html',
  styleUrls: ['./terminology-main.component.scss']
})
export class TerminologyMainComponent implements OnInit {
  parentFolderId: Uuid;
  parentDomainType: CatalogueItemDomainType;
  parentFolder: Container;
  savingInProgress = false;
  setupForm: FormGroup;

  get label() {
    return this.setupForm.get('label');
  }

  get author() {
    return this.setupForm.get('author');
  }

  get organisation() {
    return this.setupForm.get('organisation');
  }

  get description() {
    return this.setupForm.get('description');
  }

  get classifiers() {
    return this.setupForm.get('classifiers');
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
    private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle('New Terminology');

    this.setupForm = new FormGroup({
      label: new FormControl('', Validators.required),  // eslint-disable-line @typescript-eslint/unbound-method
      author: new FormControl('', Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
      organisation: new FormControl('', Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
      description: new FormControl(''),
      classifiers: new FormControl([])
    });

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

    this.resources.terminology
      .addToFolder(this.parentFolderId, payload)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem creating the Terminology.', error);
          return EMPTY;
        })
      )
      .subscribe((response: TerminologyDetailResponse) => {
        this.messageHandler.showSuccess('Terminology created successfully.');
        this.stateHandler.Go('terminology', { id: response.body.id }, { reload: true });
      });
  }
}
