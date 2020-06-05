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

