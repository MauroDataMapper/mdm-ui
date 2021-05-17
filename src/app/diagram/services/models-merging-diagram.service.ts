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
import { BasicDiagramService } from './basic-diagram.service';
import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ModelsMergingDiagramService extends BasicDiagramService {

  parentId: string;

  // Color codes for the diagram shapes
  fontColorBlack = '#000000';
  lightOrange = '#f7a900';
  shadedOrange = '#fec994';

  getDiagramContent(params: any): Observable<any> {
    return this.resourcesService.dataModel.modelVersionTree(params.parent.id);
  }

  render(result: any): void {
    this.changeComponent(null);

    result.body.forEach((item: any) => {
      if (item.newFork) {
        this.addRectangleCell(item.modelId,  `${item.label} \n\n  ${item.branchName} branch`, 300, 100, 288);
      }
      if (item.newDocumentationVersion) {
        this.addColoredRectangleCell(this.fontColorBlack, this.shadedOrange, item.modelId, `${item.label} \n\n Version ${item.version} \n\n ${item.branchName} branch`, 300, 100, 288);
      }
      if (item.newBranchModelVersion) {
        this.addColoredRectangleCell(this.fontColorBlack, this.shadedOrange, item.modelId, `${item.label} \n\n ${item.branchName} branch`, 300, 100, 288);
      }
      if (!item.newBranchModelVersion && !item.newDocumentationVersion && !item.newFork) {
        this.addColoredRectangleCell(this.fontColorBlack, this.lightOrange, item.modelId, `${item.label} \n\n ${item.branchName} branch`, 300, 100, 288);
      }
    });

    // Adding the links in a separate loop, because it won't find the target otherwise
    result.body.forEach((item: any) => {
      let link: any;
      item.targets.forEach(itmTarget => {
        link = new joint.shapes.standard.Link({
          id: `${item.modelId} _  ${itmTarget.modelId}`,
          source: { id: item.modelId },
          target: { id: itmTarget.modelId },
          labels: [{
            attrs: { text: { text: itmTarget.description } },
            position: {
              offset: 35,
              distance: 0.5
            }
          }]
        });

        this.graph.addCell(link);
      });
    });
  }

  configurePaper(paper: joint.dia.Paper): void {

    paper.on('cell:pointerclick', () => {

    });

    paper.on('link:pointerdblclick', () => {

    });
  }

  canGoUp(): boolean {
    return true;
  }

  goUp(): void {
  }
}
