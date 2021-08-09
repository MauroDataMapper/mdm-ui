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
import { Observable } from 'rxjs';
import * as joint from 'jointjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';


export class DataflowDatamodelDiagramService extends BasicDiagramService {

  private parentId: string;

  constructor(protected resourcesService: MdmResourcesService,
              protected messageHandler: MessageHandlerService) {
    super(resourcesService, messageHandler);
  }

  getDiagramContent(params: any): Observable<any> {
    this.parentId = params.parent.id;
    return this.resourcesService.dataFlow.list(this.parentId, {all:true});
  }

  render(data: any): void {
    // console.log(data);
    // this.addCylinderCell('12345', '12345');
    const nodes: object = {};
    data.body.items.forEach((flow: any) => {
      nodes[flow.source.id] = flow.source.label;
      nodes[flow.target.id] = flow.target.label;
    });

    // this.addCylinderCell('12345', 'This is a very long node name');
    Object.keys(nodes).forEach((key) => {
      this.addCylinderCell(key, nodes[key]);
    });

    data.body.items.forEach((flow) => {
      const link = new joint.shapes.standard.Link({
        id: flow.id,
        source: { id: flow.source.id },
        target: { id: flow.target.id },
      });
      link.id = flow.id as string;
      link.connector('rounded', { radius: 40 });
      link.appendLabel({
        attrs: {
          text: {
            text: joint.util.breakText(flow.label, { width: 150 }),
            fill: '#222222',
            fontSize: 10,
            fontWeight: 'normal'
          },
          line: {
            stroke: this.linkColor
          }
        },
        position: {
          offset: 10
        }
      });
      link.toBack();
      this.graph.addCell(link);
    });
  }

  configurePaper(paper: joint.dia.Paper): void {
    paper.on('link:pointerdblclick', (cellView: joint.dia.CellView) => {
      // console.log('clicked');
      const result: any = {
        flowId: cellView.model.id as string,
        parent: {
          id: this.parentId
        },
        newMode: 'dataflow-class'
      };
      // console.log(result);
      this.clickSubject.next(result);
      this.clickSubject.complete();
      // console.log('next clicked: service');
    });
  }
  canGoUp(): boolean {
    return false;
  }

  goUp(): void {


  }


}
