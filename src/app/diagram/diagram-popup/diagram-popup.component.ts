import { Component, ElementRef, Inject, Input, OnInit, Optional, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import * as SvgPanZoom from 'svg-pan-zoom';
import * as _ from 'lodash';
import * as joint from 'jointjs';
import { forkJoin } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { BasicDiagramService } from '../services/basic-diagram.service';
import { DataflowDatamodelDiagramService } from '../services/dataflow-datamodel-diagram.service';
import { DiagramComponent } from '../diagram/diagram.component';
import { DiagramToolbarComponent } from '../diagram-toolbar/diagram-toolbar.component';

@Component({
  selector: 'mdm-diagram-popup',
  templateUrl: './diagram-popup.component.html'
})

export class DiagramPopupComponent implements OnInit {

  @ViewChild(DiagramComponent) diagramComponent: DiagramComponent;
  @ViewChild(DiagramToolbarComponent) toolbarComponent: DiagramToolbarComponent;

  constructor(protected resourcesService: ResourcesService,
              protected messageHandler: MessageHandlerService,
              protected matDialog: MatDialog,
              protected dialogRef: MatDialogRef<DiagramPopupComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  ngOnInit(): void {
  }

  popDown(): void {
    this.dialogRef.close({ diagramComponent: this.diagramComponent});
  }

  toolbarClick(buttonName: string) {
    switch (buttonName) {
      case 'popDown':
        this.popDown();
        break;
      default:
        this.diagramComponent.toolbarClick(buttonName);
    }
  }




}

