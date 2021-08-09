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
import { Observable, forkJoin } from 'rxjs';
import * as joint from 'jointjs';
import { mergeMap } from 'rxjs/operators';


export class DataflowDataelementDiagramService extends BasicDiagramService {

  classes: object = {};
  dataFlows: any = {};

  selDataElementComponentId: string;
  parentId: string;
  flowId: string;
  flowComponentId: string;

  getDiagramContent(params: any): Observable<any> {

    this.parentId = params.parent.id;
    this.flowId = params.flowId;
    this.flowComponentId = params.flowComponentId;
    const classGetters = [];

    this.changeComponent(null);

    const flowComponents: Observable<any> = this.resourcesService.dataFlow.dataElementComponents.list(params.parent.id, params.flowId, params.flowComponentId, {all:true});
    return (flowComponents).pipe(
      mergeMap(data => {
        this.dataFlows = data.body;
        data.body.items.forEach((dataFlowComponent) => {
          dataFlowComponent.sourceDataElements.forEach((element) => {
            this.classes[element.dataClass] = element.breadcrumbs;
          });
          dataFlowComponent.targetDataElements.forEach((element) => {
            this.classes[element.dataClass] = element.breadcrumbs;
          });
        });
        const options = { sort: 'label', order: 'asc', all: true };
        Object.keys(this.classes).forEach((classId) => {
          const dataModelId: string = this.classes[classId][0].id;
          // let parentClassId: string = null;
          // if (this.classes[classId].length > 2) {
          //   parentClassId = this.classes[classId][this.classes[classId].length - 2].id;
          // }
          classGetters.push(
            this.resourcesService.dataClass.content(dataModelId, classId, options)
          );
        });
        return forkJoin(classGetters);
      })
    );
  }

  render(result: any): void {

    this.changeComponent(null);

    const classAttributes: object = {};
    Object.keys(this.classes).forEach((classId) => {
      const classBreadcrumb = this.classes[classId][this.classes[classId].length - 1];
      const attributes: Array<any> = [];
      result.forEach((elementResponse: any) => {
        elementResponse.body.items.forEach((element) => {
          if (element.dataClass === classId) {
            attributes.push(element);
          }
        });
      });
      classAttributes[classId] = attributes;
      // this.addUmlClassCell(classBreadcrumb.id, classBreadcrumb.label, attributes);
      this.addRectangleCell(classBreadcrumb.id, classBreadcrumb.label, 300, attributes.length * 25 + 31);
    });

    this.dataFlows.items.forEach((flowComponent) => {

      this.addSmallRectangleCell(flowComponent.id, flowComponent.label);

      flowComponent.sourceDataElements.forEach((sourceElement) => {
        // console.log(sourceElement);
        const link1 = new joint.shapes.standard.Link({
          id: `${sourceElement.id}/${flowComponent.id}`,
          source: {
            // id: sourceElement.id,
            id: sourceElement.dataClass,
            /* anchor: {
              name: 'right'
            }*/
          },
          target: {
            id: flowComponent.id,
            /* anchor: {
              name: 'left'
            }*/
          }
        });
        link1.connector('rounded', { radius: 40 });
        this.graph.addCell(link1);
      });
      flowComponent.targetDataElements.forEach((targetElement) => {
        const link2 = new joint.shapes.standard.Link({
          id: `${targetElement.id}/${flowComponent.id}`,
          source: {
            id: flowComponent.id,
            /* anchor: {
              name: 'right'
            }*/
          },
          target: {
            id: targetElement.dataClass,
            /* anchor: {
              name: 'left'
            }*/
          }
        });
        link2.connector('rounded', { radius: 40 });
        this.graph.addCell(link2);
      });
    });
    // console.log('about to layout nodes');
    super.layoutNodes();

    // Now we place the UML cells in the correct places, and add all the links.
    Object.keys(classAttributes).forEach((classId) => {
      const rectCell: joint.dia.Element = this.graph.getCell(classId) as joint.dia.Element;
      const oldPosition = rectCell.position();
      this.graph.removeCells([rectCell]);

      // console.log((this.graph.getCell(classId) as joint.dia.Element).position());
      this.addUmlClassCell(rectCell.id as string, rectCell.attr('label/text'), classAttributes[classId], new joint.g.Point({
        x: oldPosition.x,
        y: oldPosition.y
      }), null);
      // umlClassCell.set('position');
    });

    this.dataFlows.items.forEach((flowComponent) => {

      this.addSmallRectangleCell(flowComponent.id, flowComponent.label);

      flowComponent.sourceDataElements.forEach((sourceElement) => {
        // console.log(sourceElement);
        const link1 = new joint.shapes.standard.Link({
          id: `${sourceElement.id}/${flowComponent.id}`,
          source: {
            id: sourceElement.id,
            // id: sourceElement.dataClass,
            anchor: {
              name: 'right'
            }
          },
          target: {
            id: flowComponent.id,
            anchor: {
              name: 'left'
            }
          }
        });
        link1.connector('rounded', { radius: 40 });
        this.graph.addCell(link1);
      });
      flowComponent.targetDataElements.forEach((targetElement) => {
        const link2 = new joint.shapes.standard.Link({
          id: `${targetElement.id}/${flowComponent.id}`,
          source: {
            id: flowComponent.id,
            anchor: {
              name: 'right'
            }
          },
          target: {
            id: targetElement.id,
            anchor: {
              name: 'left'
            }
          }
        });
        link2.connector('rounded', { radius: 40 });
        this.graph.addCell(link2);
      });
    });
    // console.log('added new uml boxes');
  }

  configurePaper(paper: joint.dia.Paper): void {

    paper.on('cell:pointerclick', (cellView: joint.dia.CellView) => {

      if (cellView.model.id !== undefined && cellView.model.id !== null) {

        const arrMergedId: any[] = cellView.model.id.toString().split('/');

        if (arrMergedId.length > 1) {

          this.selDataElementComponentId = arrMergedId[1];

          const options = { sort: 'label', order: 'asc', all: true };
          this.resourcesService.dataFlow.dataElementComponents.get(this.parentId, this.flowId, this.flowComponentId, arrMergedId[1], options).subscribe(result => {
            if (result !== undefined && result !== null && result.body !== undefined && result.body !== null) {
              this.changeComponent(result.body);
            }
          }, () => {
            console.log(`cell pointerclick ${cellView.model.id} was clicked`);
          });
        }
      }
    });

    paper.on('link:pointerdblclick', () => {
      // this.flowComponentId = cellView.model.attributes.source.id as string;
      // this.drawDiagram();
      // console.log(cellView.model.attributes.source.id as string);
      // console.log(this);
    });

  }

  layoutNodes(): void {
    // console.log('not calling super');
  }

  canGoUp(): boolean {
    return true;
  }

  goUp(): void {
    const result: any = {
      flowId: this.flowId as string,
      parent: {
        id: this.parentId
      },
      newMode: 'dataflow-class'
    };
    // console.log(result);
    this.clickSubject.next(result);
    this.clickSubject.complete();
  }

  updateDataElementLevel = (data) => {
    const options = { sort: 'label', order: 'asc', all: true };
    this.resourcesService.dataFlow.dataElementComponents.update(this.parentId, this.flowId, this.flowComponentId, this.selDataElementComponentId, data, options).subscribe(result => {
      if (result !== undefined && result !== null && result.body !== undefined && result.body !== null) {
        this.changeComponent(result.body);
      }
    }, (error) => {
      this.messageHandler.showError('There was a problem updating the Data Element Component.', error);
    });
  };
}
