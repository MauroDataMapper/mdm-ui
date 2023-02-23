/*
Copyright 2020-2023 University of Oxford and NHS England

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
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ExportHandlerService } from '../services/handlers/export-handler.service';
import { HelpDialogueHandlerService } from '../services/helpDialogue.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { Title } from '@angular/platform-browser';
import { UIRouterGlobals } from '@uirouter/core/';
import {
  CatalogueItemDomainType,
  Exporter,
  ExporterIndexResponse,
  ExportQueryParameters,
  MdmTreeItem,
  ModelDomain
} from '@maurodatamapper/mdm-resources';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { StateHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-data-models-export',
  templateUrl: './export-models.component.html',
  styleUrls: ['./export-models.component.scss']
})
export class ExportModelsComponent implements OnInit {
  step = 1;
  selectedDataModels: MdmTreeItem[];
  selectedExporter: Exporter = null;
  processing = false;
  exporters: Exporter[] = [];
  exportedFileIsReady = false;
  exportType: ModelDomain;
  asynchronous = false;
  downloadLinks = new Array<HTMLAnchorElement>();

  constructor(
    private changeDedRef: ChangeDetectorRef,
    private securityHandler: SecurityHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private exportHandler: ExportHandlerService,
    private helpDialogueHandler: HelpDialogueHandlerService,
    private title: Title,
    private routerGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService
  ) {}

  get treeDomainType() {
    switch (this.exportType) {
      case 'dataModels':
        return CatalogueItemDomainType.DataModel;
      case 'terminologies':
        return CatalogueItemDomainType.Terminology;
      case 'codeSets':
        return CatalogueItemDomainType.CodeSet;
      case 'referenceDataModels':
        return CatalogueItemDomainType.ReferenceDataModel;
      default:
        return null;
    }
  }

  ngOnInit() {
    this.exportType = this.routerGlobals.params.exportType
      ? this.routerGlobals.params.exportType
      : 'dataModels';
    this.loadExporterList();
    this.step = 1;
    this.title.setTitle('Export Models');
  }

  // Must be an arrow function because the design of mdm-model-selector-tree does not follow standard
  // Angular input/output bindings
  onModelsSelected = (items: MdmTreeItem[]) => {
    if (items && items.length > 0) {
      this.step = 2;
      this.changeDedRef.detectChanges();
    } else {
      this.step = 1;
    }
  };

  loadExporterList() {
    this.securityHandler
      .isAuthenticated()
      .pipe(
        switchMap((response) => {
          if (!response.body.authenticatedSession) {
            return EMPTY;
          }

          return this.resources
            .getExportableResource(this.exportType)
            .exporters();
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'A problem occurred whilst finding available exporters.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((exporters: ExporterIndexResponse) => {
        this.exporters = exporters.body;
      });
  }

  reset() {
    this.step = 1;
    this.selectedDataModels = [];
    this.selectedExporter = null;
    this.removeDownloadLinks();
  }

  export() {
    this.exportedFileIsReady = false;
    this.processing = true;

    const options: ExportQueryParameters = this.asynchronous
      ? { asynchronous: true }
      : undefined;

    this.exportHandler
      .exportDataModel(
        this.selectedDataModels,
        this.selectedExporter,
        this.exportType,
        options
      )
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem exporting the model(s).',
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.processing = false))
      )
      .subscribe((response) => {
        this.handleExporterResponse(response);
      });
  }

  loadHelp() {
    this.helpDialogueHandler.open('Exporting_models');
  }

  private handleExporterResponse(response: HttpResponse<ArrayBuffer>) {
    if (response.status === 202) {
      this.handleAsyncExporterResponse();
      return;
    }

    this.handleStandardExporterResponse(response);
  }

  private handleStandardExporterResponse(response: HttpResponse<ArrayBuffer>) {
    this.exportedFileIsReady = true;
    const label =
      this.selectedDataModels.length === 1
        ? this.selectedDataModels[0].label
        : this.exportType;

    const fileName = this.exportHandler.createFileName(
      label,
      this.selectedExporter
    );

    const file = new Blob([response.body], {
      type: this.selectedExporter.fileType
    });

    const link = this.exportHandler.createBlobLink(file, fileName);
    this.removeDownloadLinks();
    this.downloadLinks.push(link);
    this.messageHandler.showSuccess('The model(s) were exported successfully.');
  }

  private handleAsyncExporterResponse() {
    this.messageHandler.showInfo(
      'A new background task to export your model(s) has started. You can continue working while the export continues.'
    );
    this.stateHandler.Go('alldatamodel');
  }

  private removeDownloadLinks() {
    this.downloadLinks = [];
  }
}
