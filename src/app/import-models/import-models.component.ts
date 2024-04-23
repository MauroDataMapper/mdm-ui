/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { Title } from '@angular/platform-browser';
import {
  isResponseAccepted,
  MdmResourcesService
} from '@mdm/modules/resources';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { HelpDialogueHandlerService } from '../services/helpDialogue.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { BroadcastService } from '../services/broadcast.service';
import { UIRouterGlobals } from '@uirouter/core/';
import { ModelDomainRequestType } from '@mdm/model/model-domain-type';
import { ModelTreeService } from '@mdm/services/model-tree.service';
import {
  CatalogueItemDomainType,
  Importer,
  ImporterDetailResponse,
  ImporterIndexResponse,
  ImporterParameterGroup,
  ImportResult,
  ImportResultIndexResponse,
  MdmIndexBody,
  MdmTreeItem,
  ModelDomain
} from '@maurodatamapper/mdm-resources';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY, timer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'mdm-import',
  templateUrl: './import-models.component.html',
  styleUrls: ['./import-models.component.sass']
})
export class ImportModelsComponent implements OnInit {
  importers: Importer[];
  importHasError: boolean;
  importErrors: any;

  selectedImporterGroups: ImporterParameterGroup[] = [];
  step = 1;
  importerHelp: string;

  selectedImporter: Importer;

  importingInProgress: boolean;
  importCompleted: boolean;
  importResult?: MdmIndexBody<ImportResult>;

  formOptionsMap = {
    Integer: 'number',
    // eslint-disable-next-line id-blacklist
    String: 'text',
    Password: 'password',
    // eslint-disable-next-line id-blacklist
    Boolean: 'checkbox',
    // eslint-disable-next-line id-blacklist
    boolean: 'checkbox',
    int: 'number',
    File: 'file'
  };
  importType: ModelDomain;

  allowedFolderTreeDomainTypes = [
    CatalogueItemDomainType.Folder,
    CatalogueItemDomainType.VersionedFolder
  ];

  constructor(
    private title: Title,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private helpDialogueHandler: HelpDialogueHandlerService,
    private stateHandler: StateHandlerService,
    private broadcast: BroadcastService,
    private uiRouterGlobals: UIRouterGlobals,
    private modelTree: ModelTreeService
  ) {}

  ngOnInit() {
    this.importType = this.uiRouterGlobals.params.importType
      ? this.uiRouterGlobals.params.importType
      : 'dataModels';
    this.title.setTitle('Import');

    this.loadImporters();
  }

  folderFilter(item: MdmTreeItem): boolean {
    // Only allow folders to be selected when they have the 'createModel' permission. e.g.
    // finalised Versioned Folders will not have this permission, locking them out of further imports
    return item.availableActions.includes('createModel');
  }

  loadImporters() {
    this.resources
      .getImportableResource(this.importType)
      .importers()
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'A problem occurred whilst finding available importers.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((importers: ImporterIndexResponse) => {
        this.importers = importers.body;
      });
  }

  loadImporterParameters(importer: Importer) {
    if (!importer) {
      this.selectedImporterGroups = [];
      this.step = 1;
      return;
    }

    this.importerHelp = this.helpDialogueHandler.getImporterHelpTopic(
      importer.name
    );

    this.resources.importer
      .get(importer.namespace, importer.name, importer.version)
      .subscribe((res: ImporterDetailResponse) => {
        const result = res.body;
        this.selectedImporterGroups = result.parameterGroups;

        this.selectedImporterGroups.forEach((selectedImporterGroup) => {
          const parameters = selectedImporterGroup.parameters;
          parameters.forEach((option) => {
            // add default value
            option.value = '';

            if (option.optional === undefined) {
              option.optional = false;
            }

            // When the input is just a checkbox we give it 'false' as the default value
            // so don't mark it as optional, as the form will be invalid unless the user checks or unChecks the input
            if (option.type === 'Boolean' || option.type === 'boolean') {
              option.optional = true;
              option.value = false;
            }

            // If the model tree currently has a folder selected, default to that one initially
            if (
              option.type === 'Folder' &&
              this.modelTree.currentNode &&
              this.modelTree.currentNode.domainType === 'Folder'
            ) {
              option.value = [this.modelTree.currentNode];
            }
          });
        });
      });
  }

  importerChanged() {
    this.step = 2;
    this.loadImporterParameters(this.selectedImporter);
  }

  submitForm(isValid: boolean) {
    if (!isValid) {
      return;
    }
    this.startImport();
  }

  startImport() {
    if (!this.selectedImporter) {
      return;
    }

    this.importingInProgress = true;
    this.importCompleted = false;
    this.importResult = null;

    const formData = this.mapFormData();

    this.resources
      .getImportableResource(this.importType)
      .importModels(
        this.selectedImporter.namespace,
        this.selectedImporter.name,
        this.selectedImporter.version,
        formData
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleImporterError(error);
          return EMPTY;
        }),
        finalize(() => (this.importingInProgress = false))
      )
      .subscribe((response: ImportResultIndexResponse) => {
        this.importCompleted = true;
        this.handleImporterSuccess(response);
      });
  }

  loadHelp() {
    this.helpDialogueHandler.open('Importing_models');
  }

  loadImporterHelp() {
    this.helpDialogueHandler.open(this.importerHelp);
  }

  private mapFormData() {
    const formData = new FormData();

    this.selectedImporterGroups.forEach((selectedImporterGroup) => {
      const parameters = selectedImporterGroup.parameters;
      parameters.forEach((param) => {
        if (param.type === 'File') {
          formData.append(param.name, this.getFile(param.name));
        } else if (param.type === 'DataModel') {
          formData.append(param.name, param.value[0].id); // eslint-disable-line @typescript-eslint/no-unsafe-argument
        } else if (param.type === 'Folder' && param.value && param.value[0]) {
          formData.append(param.name, param.value[0].id); // eslint-disable-line @typescript-eslint/no-unsafe-argument
        } else {
          formData.append(param.name, param.value); // eslint-disable-line @typescript-eslint/no-unsafe-argument
        }
      });
    });

    return formData;
  }

  private getFile(paramName: string) {
    const element = document.getElementById(paramName) as HTMLInputElement;
    return element?.files?.[0];
  }

  private handleImporterError(error: HttpErrorResponse) {
    if (error.status === 422) {
      this.importHasError = true;
      if (error.error.validationErrors) {
        this.importErrors = error.error.validationErrors.errors;
      } else if (error.error.errors) {
        this.importErrors = error.error.errors;
      }
    }

    this.importingInProgress = false;
    this.messageHandler.showError(
      'There was a problem importing the models. Review any errors highlighted and try again.'
    );
  }

  private handleImporterSuccess(response: ImportResultIndexResponse) {
    if (isResponseAccepted(response)) {
      this.handleAsyncImporterSuccess();
      return;
    }

    this.handleStandardImporterSuccess(response);
  }

  private handleStandardImporterSuccess(response: ImportResultIndexResponse) {
    this.importResult = response.body;
    this.importHasError = false;
    this.importErrors = [];
    this.messageHandler.showSuccess('Models were imported successfully!');

    this.broadcast.reloadCatalogueTree();

    if (response && response.body.count === 1) {
      // Delay the redirect to the one imported model
      timer(500).subscribe(() => {
        const state: string = ModelDomainRequestType[this.importType];
        this.stateHandler.Go(
          state,
          { id: response.body.items[0].id },
          { reload: true, location: true }
        );
      });
    }
  }

  private handleAsyncImporterSuccess() {
    this.importHasError = false;
    this.importErrors = [];
    this.messageHandler.showInfo(
      'A new background task to import your model(s) has started. You can continue working while the import continue.'
    );
    this.stateHandler.Go('alldatamodel');
  }
}
