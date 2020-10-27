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
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MatDialog } from '@angular/material/dialog';
import { DiagramComponent } from '../diagram/diagram.component';
import { DiagramPopupComponent } from '../diagram-popup/diagram-popup.component';

@Component({
  selector: 'mdm-diagram-tab',
  templateUrl: './diagram-tab.component.html'
})

export class DiagramTabComponent implements OnInit {

  @Input() mode: string;
  @Input() parent: string;
  @Input() isPopup: boolean;
  @Input() canMoveUp: boolean;

  @ViewChild(DiagramComponent) diagramComponent: DiagramComponent;

  constructor(protected resourcesService: MdmResourcesService,
              protected messageHandler: MessageHandlerService,
              protected matDialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  popUp(): void {
    const dialogRef = this.matDialog.open(DiagramPopupComponent, {
      width: '100%',
      height: '100%',
      data: {
        diagramComponent: this.diagramComponent
      }
    });
    dialogRef.afterClosed().subscribe(result => {
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

