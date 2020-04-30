import { Component, ElementRef, Inject, Input, OnInit, Optional, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ResourcesService } from '@mdm/services/resources.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import * as SvgPanZoom from 'svg-pan-zoom';
import * as _ from 'lodash';
import * as joint from 'jointjs';
import { forkJoin } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { BasicDiagramService } from '../services/basic-diagram.service';
import { DataflowDatamodelDiagramService } from '../services/dataflow-datamodel-diagram.service';
import { DiagramComponent } from '../diagram/diagram.component';
import { DiagramPopupComponent } from '../diagram-popup/diagram-popup.component';

@Component({
  selector: 'mdm-diagram-tab',
  templateUrl: './diagram-tab.component.html'
})

export class DiagramTabComponent implements OnInit {

  @Input() mode: string;
  @Input() parent: string;

  @ViewChild(DiagramComponent) diagramComponent: DiagramComponent;

  constructor(protected resourcesService: ResourcesService,
              protected messageHandler: MessageHandlerService,
              protected matDialog: MatDialog) {
    // super(resourcesService, messageHandler, matDialog);
  }

  ngOnInit(): void {

  }

  popUp(): void {
    // console.log('Popping up...');
    const dialogRef = this.matDialog.open(DiagramPopupComponent, {
      width: '100%',
      height: '100%',
      data: {
        diagramComponent: this.diagramComponent
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      this.diagramComponent.diagramComponent = result.diagramComponent;
      this.diagramComponent.diagramService = result.diagramComponent.diagramService;
      this.diagramComponent.resetPaper();
    });
  }

  toolbarClick(buttonName: string) {
    switch (buttonName) {
      case 'popUp':
        this.popUp();
        break;
      default:
        this.diagramComponent.toolbarClick(buttonName);
    }
  }

}

