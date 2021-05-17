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
import {
  Component,
  Inject,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { DiagramComponent } from '../diagram/diagram.component';
import { DiagramToolbarComponent } from '../diagram-toolbar/diagram-toolbar.component';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'mdm-diagram-popup',
  templateUrl: './diagram-popup.component.html',
})
export class DiagramPopupComponent implements OnInit {
  @ViewChild(DiagramComponent) diagramComponent: DiagramComponent;
  @ViewChild(DiagramToolbarComponent) toolbarComponent: DiagramToolbarComponent;
  @ViewChild(MatSidenav) drawer: MatSidenav;

  node: any;
  filterList: Array<any> = [];

  constructor(
    protected resourcesService: MdmResourcesService,
    protected messageHandler: MessageHandlerService,
    protected matDialog: MatDialog,
    protected dialogRef: MatDialogRef<DiagramPopupComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.loadTree();
  }

  popDown(): void {
    this.clearFilterClick();
    this.dialogRef.close({ diagramComponent: this.diagramComponent });
  }

  showFilterTree(): void {
    this.drawer.toggle();
    // this.diagramComponent.filter(this.data.diagramComponent.parent)
  }

  onNodeChecked(node, parent, checkedList): void {
    this.filterList = Object.keys(checkedList);
  }

  filterClick(): void {
    this.diagramComponent.filter(this.data.diagramComponent.parent, this.filterList, this.data.diagramComponent.mode);
  }

  clearFilterClick(): void {
    this.loadTree();
    this.diagramComponent.filter(this.data.diagramComponent.parent, [], this.data.diagramComponent.mode);
  }

  toolbarClick(buttonName: string) {
    switch (buttonName) {
      case 'popDown':
        this.popDown();
        break;
      case 'showTreeFilter':
        this.showFilterTree();
        break;
      default:
        this.diagramComponent.toolbarClick(buttonName);
    }
  }

  private loadTree() {
    this.node = null;
    this.resourcesService.tree.get('folders', this.data.diagramComponent.parent.domainType, this.data.diagramComponent.parent.id)
      .subscribe((result) => {
        this.node = {
          children: result.body,
          isRoot: true,
        };
      });
  }
}
