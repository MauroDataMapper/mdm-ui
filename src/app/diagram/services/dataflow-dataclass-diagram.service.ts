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
import { Observable, EMPTY, Subject } from 'rxjs';
import * as joint from 'jointjs';


export class DataflowDataclassDiagramService extends BasicDiagramService {

  parentId: string;
  flowId: string;
  dataClassComponents: any = {};

  getDiagramContent(params: any): Observable<any> {
    // console.log('getting class diagram content');
    this.parentId = params.parent.id;
    this.flowId = params.flowId;

    return this.resourcesService.dataFlow.dataClassComponents.list(params.parent.id, params.flowId);
  }

  render(data: any): void {
    const nodes: any = {};
    const nodesMerge: any = {};
    data.body.items.forEach((flow: any) => {
      flow.sourceDataClasses.forEach((dataClass: any) => {
        nodes[dataClass.id] = dataClass.label;
      });
      if (flow.sourceDataClasses.length > 1) {
        nodesMerge[flow.id] = flow.label;
      }

      flow.targetDataClasses.forEach((dataClass: any) => {
        nodes[dataClass.id] = dataClass.label;
      });
      if (flow.targetDataClasses.length > 1) {
        nodesMerge[flow.id] = flow.label;
      }

      if (flow.domainType === "DataClassComponent") {
        this.dataClassComponents[flow.id] = flow.label;
      }
    });

    Object.keys(nodes).forEach((key) => {
      this.addRectangleCell(key, nodes[key]);
    });

    Object.keys(nodesMerge).forEach((key) => {
      this.addSmallColorfulRectangleCell(key, nodesMerge[key]);
    });

    data.body.items.forEach((flow: any) => {
      flow.sourceDataClasses.forEach((sourceDataClass: any) => {
        flow.targetDataClasses.forEach((targetDataClass: any) => {

          let link: any;
          if (flow.sourceDataClasses.length > 1) {
            //this.addLink(flow.id + '/' + sourceDataClass.id, sourceDataClass.id, flow.id);
            // link the sourceDataClass to the merged dataClassComponent
            link = new joint.shapes.standard.Link({
              id: flow.id + '/' + sourceDataClass.id,
              source: { id: sourceDataClass.id },
              target: { id: flow.id }
            });
          } else {
            link = new joint.shapes.standard.Link({
              id: flow.id + '/' + targetDataClass.id,
              source: { id: sourceDataClass.id },
              target: { id: targetDataClass.id }
            });
            //this.addLink(flow.id + '/' + targetDataClass.id, sourceDataClass.id, targetDataClass.id);
          }

          // link.id = flow.id as string;
          link.connector('rounded', { radius: 40 });
          link.attr('line/stroke', this.linkColor);
          link.toBack();
          this.graph.addCell(link);
        });
      });
      if (flow.sourceDataClasses.length > 1) {
        // link the merged dataClassComponent to the targetDataClass
        const mergedLink = new joint.shapes.standard.Link({
          id: flow.id + '/' + flow.targetDataClasses[0].id,
          source: { id: flow.id },
          target: { id: flow.targetDataClasses[0].id }
        });

        mergedLink.connector('rounded', { radius: 40 });
        mergedLink.toBack();
        this.graph.addCell(mergedLink);
      }

    });
  }

  configurePaper(paper: joint.dia.Paper): void {

    paper.on('link:pointerdblclick', (cellView: joint.dia.CellView, event) => {
      console.log('cell pointerdblclick ' + cellView.model.id + ' was clicked');
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


    paper.on('cell:pointerclick', (cellView: joint.dia.CellView, event) => {
      debugger
      if (cellView.model.id !== undefined && cellView.model.id !== null) {

        const arrMergedId: any[] = cellView.model.id.toString().split('/');

        var foundDataClassComponents: any = this.dataClassComponents;

        if (arrMergedId.length > 0) {

          //Check if this id is a DataClassComponent
          foundDataClassComponents = Object.keys(this.dataClassComponents).filter(function (key) {
            return foundDataClassComponents[arrMergedId[0]];
          });

          if (foundDataClassComponents !== undefined && foundDataClassComponents !== null && foundDataClassComponents.length > 0) {
            const options = { sort: 'label', order: 'asc', all: true };
            this.resourcesService.dataFlow.dataClassComponents.get(this.parentId, this.flowId, arrMergedId[0], options).subscribe(result => {
              if (result !== undefined && result !== null && result.body !== undefined && result.body !== null) {
                this.changeDataClassComponent(result.body);
              }
            }),
              (error) => {
                console.log('cell pointerclick ' + cellView.model.id + ' was clicked');
              };
          } else {
            this.changeDataClassComponent(null);
          }
        }
      }
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
