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
import { BasicDiagramService } from './basic-diagram.service';
import { Observable, EMPTY } from 'rxjs';
import * as joint from 'jointjs';


export class DataflowDataclassDiagramService extends BasicDiagramService {

  parentId: string;
  flowId: string;

  getDiagramContent(params: any): Observable<any> {
    // console.log('getting class diagram content');
    this.parentId = params.parent.id;
    this.flowId = params.flowId;

    return this.resourcesService.dataFlow.dataClassComponents.list(params.parent.id, params.flowId);
  }

  render(data: any): void {
    const nodes: any = {};
    data.body.items.forEach((flow: any) => {
      flow.sourceDataClasses.forEach((dataClass: any) => {
        nodes[dataClass.id] = dataClass.label;
      });

      flow.targetDataClasses.forEach((dataClass: any) => {
        nodes[dataClass.id] = dataClass.label;
      });
    });

    Object.keys(nodes).forEach((key) => {
      this.addRectangleCell(key, nodes[key]);
    });
    data.body.items.forEach((flow: any) => {
      flow.sourceDataClasses.forEach((sourceDataClass: any) => {
        flow.targetDataClasses.forEach((targetDataClass: any) => {
          const link = new joint.shapes.standard.Link({
            id: flow.id,
            source: { id: sourceDataClass.id },
            target: { id: targetDataClass.id }
          });
          // link.id = flow.id as string;
          link.connector('rounded', { radius: 40 });
          link.toBack();
          this.graph.addCell(link);
        });
      });
    });
  }

  configurePaper(paper: joint.dia.Paper): void {
    paper.on('link:pointerdblclick', (cellView: joint.dia.CellView, event) => {
      const result: any = {
        flowId: this.flowId as string,
        flowComponentId: cellView.model.attributes.source.id as string,
        parent: {
          id: this.parentId
        },
        newMode: 'dataflow-element'
      };
      // console.log(result);
      this.clickSubject.next(result);
      this.clickSubject.complete();
      // console.log('next clicked: service');
    });
  }

  canGoUp(): boolean {
    return true;
  }

  goUp(): void {
    const result: any = {
      parent: {
        id: this.parentId
      },
      newMode: 'dataflow-model'
    };
    // console.log(result);
    this.goUpSubject.next(result);
    this.goUpSubject.complete();
  }
}
