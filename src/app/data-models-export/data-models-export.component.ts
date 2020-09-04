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
import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ExportHandlerService } from '../services/handlers/export-handler.service';
import { HelpDialogueHandlerService } from '../services/helpDialogue.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-data-models-export',
  templateUrl: './data-models-export.component.html',
  styleUrls: ['./data-models-export.component.scss']
})
export class DataModelsExportComponent implements OnInit {
  step: any;
  selectedDataModels: any;
  showExport = null;
  selectedModels: any[] = [];
  selectedExporter = null;
  defaultModels = [];
  form = {};
  selectedExporterObj: any;
  selectedExporterStr: any;
  processing = false;
  exportersList = [];
  exportedFileIsReady: any;
  @ViewChild('aLink', { static: false }) aLink: ElementRef;
  constructor(
    private changeDedRef: ChangeDetectorRef,
    private securityHandler: SecurityHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private exportHandler: ExportHandlerService,
    private helpDialogueHandler: HelpDialogueHandlerService,
    private renderer: Renderer2,
    private title: Title
  ) {
    this.loadExporterList();
    this.step = 1;
  }

  onSelect = select => {
    if (select && select.length > 0) {
      this.step = 2;
      this.showExport = 'true';
      this.changeDedRef.detectChanges();
    } else {
      this.step = 1;
    }
  };

  loadExporterList() {
    this.exportersList = [];

    this.securityHandler.isAuthenticated().subscribe(result => {
      if (result.body === false) {
        return;
      }

      this.resources.dataModel.exporters().subscribe(result2 => {
        this.exportersList = result2.body;
      }, error => {
        this.messageHandler.showError('There was a problem loading exporters list.', error);
      });
    });
  }

  exporterChanged() {
    if (this.selectedExporterStr) {
      this.selectedExporterObj = this.selectedExporterStr;
    } else {
      this.selectedExporterObj = null;
    }
  }

  reset() {
    this.step = 1;
    this.selectedDataModels = [];
    this.selectedExporter = null;
    this.selectedExporterObj = null;
    this.defaultModels = [];
    this.selectedExporterStr = null;
    Array.from(this.aLink.nativeElement.children).forEach(child => {
      this.renderer.removeChild(this.aLink.nativeElement, child);
    });
  }

  export() {
    this.exportedFileIsReady = false;
    this.processing = true;
    this.exportHandler.exportDataModel(this.selectedDataModels, this.selectedExporterObj).subscribe(result => {
      if (result != null) {
        this.exportedFileIsReady = true;
        this.processing = false;
        const label = this.selectedDataModels.length === 1 ? this.selectedDataModels[0].label : 'data_models';
        const fileName = this.exportHandler.createFileName(label, this.selectedExporterObj);
        const file = new Blob([result.body], {
          type: this.selectedExporterObj.fileType
        });
        const link = this.exportHandler.createBlobLink(file, fileName);
        Array.from(this.aLink.nativeElement.children).forEach(child => {
          this.renderer.removeChild(this.aLink.nativeElement, child);
        });
        this.processing = false;
        this.renderer.appendChild(this.aLink.nativeElement, link);
        this.messageHandler.showSuccess('Data Model(s) exported successfully.');
      } else {
        this.processing = false;
        this.messageHandler.showError('There was a problem exporting the Data Model(s).', '');
      }
    }, error => {
      this.processing = false;
      this.messageHandler.showError('There was a problem exporting the Data Model(s).', error);
    }
    );
  }

  loadHelp = () => {
    this.helpDialogueHandler.open('Exporting_models', {});
  };

  ngOnInit() {
    this.title.setTitle(`Data Models Export`);
  }
}
