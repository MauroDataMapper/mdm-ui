import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { ResourcesService } from '../services/resources.service';
import { ExportHandlerService } from '../services/handlers/export-handler.service';
import { HelpDialogueHandlerService } from '../services/helpDialogue.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';

@Component({
  selector: 'app-data-models-export',
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
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService,
    private exportHandler: ExportHandlerService,
    private helpDialogueHandler: HelpDialogueHandlerService,
    private renderer: Renderer2
  ) {
    window.document.title = 'Data Models Export';
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

    this.securityHandler.isValidSession().subscribe(result => {
      if (result === false) {
        return;
      }
      this.resources.public.dataModelExporterPlugins().subscribe(
        result => {
          this.exportersList = result.body;
        },
        error => {
          this.messageHandler.showError(
            'There was a problem loading exporters list.',
            error
          );
        }
      );
    });
  }

  exporterChanged() {
    if (this.selectedExporterStr) {
      this.selectedExporterObj = this.selectedExporterStr;
    } else {
      this.selectedExporterObj = null;
    }
    // jQuery("#exportFileDownload a").remove();
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
    this.exportHandler
      .exportDataModel(this.selectedDataModels, this.selectedExporterObj)
      .subscribe(
        result => {
          if (result != null) {
            this.exportedFileIsReady = true;
            this.processing = false;
            const label =
              this.selectedDataModels.length === 1
                ? this.selectedDataModels[0].label
                : 'data_models';
            const fileName = this.exportHandler.createFileName(
              label,
              this.selectedExporterObj
            );
            const file = new Blob([result.body], {
              type: this.selectedExporterObj.fileType
            });
            const link = this.exportHandler.createBlobLink(file, fileName);
            Array.from(this.aLink.nativeElement.children).forEach(child => {
              this.renderer.removeChild(this.aLink.nativeElement, child);
            });
            // remove if any link exists
            // jQuery("#exportFileDownload a").remove();
            // jQuery("#exportFileDownload").append(jQuery(aLink)[0]);
            // this.aLink.nativeElement.remove();
            // this.renderer.removeChild(this.aLink.nativeElement, );
            this.processing = false;
            this.renderer.appendChild(this.aLink.nativeElement, link);
            this.messageHandler.showSuccess(
              'Data Model(s) exported successfully.'
            );
          } else {
            this.processing = false;
            this.messageHandler.showError(
              'There was a problem exporting the Data Model(s).',
              ''
            );
          }
        },
        error => {
          this.processing = false;
          this.messageHandler.showError(
            'There was a problem exporting the Data Model(s).',
            error
          );
          // jQuery("#exportFileDownload a").remove();
        }
      );
  }

  loadHelp = () => {
    this.helpDialogueHandler.open('Exporting_models', {});
  };

  ngOnInit() {}
}
