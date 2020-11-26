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
import { Component, OnInit, ViewChild, Inject, AfterViewInit } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateService } from '@uirouter/core';
import { DiagramComponent } from '@mdm/diagram/diagram/diagram.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DiagramPopupComponent } from '@mdm/diagram/diagram-popup/diagram-popup.component';

@Component({
  selector: 'mdm-versioning-graph-modal',
  templateUrl: './versioning-graph-modal.component.html',
  styleUrls: ['./versioning-graph-modal.component.scss']
})
export class VersioningGraphModalComponent implements OnInit, AfterViewInit {

  @ViewChild(DiagramComponent) diagramComponent: DiagramComponent;

  isDataLoaded: boolean;

  sourceModel: any;
  targetModel: any;
  mode = 'model-merging-graph';

  constructor(public dialogRef: MatDialogRef<VersioningGraphModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private resources: MdmResourcesService,
    private stateService: StateService,
    protected matDialog: MatDialog) { }

  async ngOnInit() {
  }

  async ngAfterViewInit() {

    const sourceId = this.data.parentDataModel;

    if (sourceId) {
      this.sourceModel = await this.loadDataModelDetail(sourceId);
    }
  }

  async loadDataModelDetail(modelId) {
    if (!modelId) {
      return null;
    }

    const response = await this.resources.dataModel.get(modelId).toPromise();
    const model = response.body;
    const children = await this.resources.tree.get('dataModels', model.domainType, model.id).toPromise();
    model.children = children.body;
    if (model.children?.length > 0) {
      model.hasChildren = true;
    }

    this.isDataLoaded = true;

    return model;
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
}
