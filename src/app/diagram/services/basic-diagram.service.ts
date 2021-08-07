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
import { Injectable, Optional } from '@angular/core';
import * as joint from 'jointjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import dagre from 'dagre';
import graphlib from 'graphlib';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import _ from 'lodash';
import { DiagramParameters } from '../diagram/diagram.model';

@Injectable({
  providedIn: 'root'
})

/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unused-vars */
export abstract class BasicDiagramService {

  fontColorWhite = '#ffffff';
  darkBackground = '#4a708b';
  lightBackground = '#e0e5e9';
  lightOrangeBackground = '#f7a900';
  shadedOrange = '#fec994';
  linkColor: '#949494';

  hierarchy: any;
  public graph: joint.dia.Graph;
  protected clickSubject = new Subject<any>();
  protected goUpSubject = new Subject<any>();
  protected dataComponentSubject = new BehaviorSubject('');
  public currentComponent = this.dataComponentSubject.asObservable();

  public constructor(protected resourcesService: MdmResourcesService,
    protected messageHandler: MessageHandlerService) {

    this.graph = new joint.dia.Graph();
  }

  abstract canGoUp(): boolean;

  abstract goUp(): void;

  abstract getDiagramContent(params: DiagramParameters): Observable<any>;

  abstract render(data: any): void;

  abstract configurePaper(paper: joint.dia.Paper): void;


  public updateDataClassComponentLevel(data: any): void { }

  public updateDataElementLevel(data: any): void { }

  public onDrag(cellView: joint.dia.CellView): void {
    if (cellView instanceof joint.dia.ElementView) {
      this.adjustVertices(this.graph, (cellView).model);
    }

  }

  public layoutNodes(rankDir: 'TB' | 'BT' | 'LR' | 'RL' = 'LR'): void {
    let nodeSep = 100;
    let rankSep = 400;

    if (rankDir === 'TB') {
      nodeSep = 100;
      rankSep = 250;
    }

    joint.layout.DirectedGraph.layout(this.graph, {
      setLabels: true,
      setVertices: true,
      setLinkVertices: true,
      dagre,
      graphlib,
      rankDir,
      marginX: 40,
      marginY: 40,
      nodeSep: 100,
      rankSep: 400,
      edgeSep: 0
    });
  }

  protected addCylinderCell(id: string, label: string): joint.dia.Cell {
    const cylinder = new joint.shapes.standard.Cylinder({
      id,
      size: { width: 120, height: 80 },
    });
    cylinder.attr('label/text', joint.util.breakText(label, { width: 110 }));
    // cylinder.attr('label/text', label);
    cylinder.attr('label/fontWeight', 'bold');
    cylinder.attr('label/fontSize', 12);
    cylinder.attr('label/fill', this.fontColorWhite);
    cylinder.attr('body/fill', this.darkBackground);
    cylinder.attr('body/strokeWidth', 0);
    cylinder.attr('top/fill', this.lightBackground);


    cylinder.attr('text/ref-y', -50);
    this.graph.addCell(cylinder);
    return cylinder;
  }

  protected addRectangleCell(id: string, label: string, width: number = 120, height: number = 80, textWidth: number = 110): joint.dia.Cell {
    const rectangle = new joint.shapes.standard.Rectangle({
      id,
      size: { width, height }
    });
    rectangle.attr('label/text', joint.util.breakText(label, { width: textWidth }));
    rectangle.attr('label/fontWeight', 'bold');
    rectangle.attr('label/fontSize', 12);
    rectangle.attr('label/fill', this.fontColorWhite);
    rectangle.attr('body/fill', this.darkBackground);
    rectangle.attr('body/strokeWidth', 0);
    rectangle.attr('body/rx', 10);
    rectangle.attr('body/ry', 10);

    // rectangle.attr('text/ref-y', -50);
    this.graph.addCell(rectangle);
    return rectangle;
  }

  protected addColoredRectangleCell(textColor: string, rectangleColor: string, id: string, label: string, width: number = 120, height: number = 80, textWidth: number = 110): joint.dia.Cell {
    const rectangle = new joint.shapes.standard.Rectangle({
      id,
      size: { width, height }
    });
    rectangle.attr('label/text', joint.util.breakText(label, { width: textWidth }));
    rectangle.attr('label/fontWeight', 'bold');
    rectangle.attr('label/fontSize', 12);
    rectangle.attr('label/fill', textColor);
    rectangle.attr('body/fill', rectangleColor);
    rectangle.attr('body/strokeWidth', 0);
    rectangle.attr('body/rx', 10);
    rectangle.attr('body/ry', 10);

    this.graph.addCell(rectangle);
    return rectangle;
  }

  protected addSmallRectangleCell(id: string, label: string): joint.dia.Cell {
    const rectangle = new joint.shapes.standard.Rectangle({
      id,
      size: { width: 150, height: 40 }
    });
    rectangle.attr('label/text', joint.util.breakText(label, { width: 130 }));
    rectangle.attr('label/fontWeight', 'bold');
    rectangle.attr('label/fontSize', 12);
    rectangle.attr('body/fill', this.lightBackground);
    rectangle.attr('body/strokeWidth', 0);
    rectangle.attr('body/rx', 10);
    rectangle.attr('body/ry', 10);

    // rectangle.attr('text/ref-y', -50);
    this.graph.addCell(rectangle);
    return rectangle;

  }

  protected addLink(id: string, sourceId: string, targetId: string): joint.dia.Link {
    const link = new joint.shapes.standard.Link({
      id,
      source: { id: sourceId },
      target: { id: targetId }
    });

    link.attr('line/stroke', this.darkBackground);
    link.connector('rounded', { radius: 40 });
    link.toBack();

    this.graph.addCell(link);
    return link;
  }

  protected addSmallColorfulRectangleCell(id: string, label: string): joint.dia.Cell {
    const rectangle = new joint.shapes.standard.Rectangle({
      id,
      size: { width: 150, height: 40 }
    });
    rectangle.attr('label/text', joint.util.breakText(label, { width: 130 }));
    rectangle.attr('label/fontWeight', 'bold');
    rectangle.attr('label/fontSize', 12);
    rectangle.attr('body/fill', this.lightOrangeBackground);
    rectangle.attr('body/strokeWidth', 0);
    rectangle.attr('body/rx', 10);
    rectangle.attr('body/ry', 10);

    // rectangle.attr('text/ref-y', -50);
    this.graph.addCell(rectangle);
    return rectangle;

  }

  protected addUmlClassCell(id: string, label: string, attributes: Array<any>,
    @Optional() position: joint.g.Point = null,
    @Optional() existingClassBox: joint.shapes.standard.Rectangle): joint.dia.Cell {
    const cells: Array<joint.dia.Cell> = [];
    if (!position) {
      position = new joint.g.Point({ x: 0, y: 0 });
    }

    let classBox = null;
    if (existingClassBox) {
      classBox = existingClassBox;
      position = existingClassBox.position();
      // classBox.attr('body/fill', this.lightBackground);
      classBox.attr('body/fillOpacity', 0);
      classBox.attr('z', 2);
    } else {
      classBox = new joint.shapes.standard.Rectangle({
        id,
        position,
        z: 2,
        size: { width: 300, height: attributes.length * 25 + 31 },
        attrs: {
          body: {
            fill: this.lightBackground,
            fillOpacity: 0
          }
        }
      });
      classBox.attr('rect/fontWeight', 'bold');
      cells.push(classBox);
    }

    const classNameBox = new joint.shapes.standard.Rectangle({
      id: id + '-name',
      position,
      size: { width: 300, height: 30 },
      z: 1,
      attrs: {
        label: {
          text: joint.util.breakText(label, { width: 290 }),
          fontWeight: 'bold',
          fill: this.fontColorWhite,
          fontSize: 13
        },
        body: {
          fill: this.darkBackground,
          strokeWidth: 0,
          stroke: this.darkBackground
        }
      }
    });
    classBox.embed(classNameBox);
    cells.push(classNameBox);
    attributes.forEach((attribute, idx) => {

      const attributeBox = new joint.shapes.standard.Rectangle({
        position: { x: position.x, y: position.y + 31 + idx * 25 },
        id: attribute.id,
        size: { width: 300, height: 25 },
        z: 1,
        attrs: {
          label: {
            text: joint.util.breakText(`${attribute.label} : ${attribute.dataType.label}`, { width: 280 }),
            fontWeight: 'normal',
            fontSize: 12,
            textAnchor: 'left',
            refX: 10
          },
          body: {
            fill: this.lightBackground,
            strokeWidth: 0
          },

        }
      });
      // attributeBox.addPort();
      classBox.embed(attributeBox);
      cells.push(attributeBox);
    });

    this.graph.addCells(cells);
    return classBox;

  }

  /*
  private adjustAllVertices(graph: joint.dia.Graph) {
    graph.getCells().forEach((cell) => {
      if (cell instanceof joint.dia.Link) {
        this.adjustVertices(graph, cell);
      }
    });

  }
  */

  private adjustVertices(graph: joint.dia.Graph, cell: joint.dia.Cell) {

    // if `cell` is a view, find its model
    // cell = cell.model || cell;

    if (cell instanceof joint.dia.Element) {
      // `cell` is an element

      _.chain(graph.getConnectedLinks(cell))
        .groupBy((link) => {

          // the key of the group is the model id of the link's source or target
          // cell id is omitted
          return _.omit([link.source().id, link.target().id], cell.id)[0];
        })
        .each((group, key) => {

          // if the member of the group has both source and target model
          // then adjust vertices
          if (key !== 'undefined') {
            this.adjustVertices(graph, _.first(group));
          }
        })
        .value();

      return;
    }

    // `cell` is a link
    // get its source and target model IDs
    const sourceId = cell.get('source').id || cell.previous('source').id;
    const targetId = cell.get('target').id || cell.previous('target').id;

    // if one of the ends is not a model
    // (if the link is pinned to paper at a point)
    // the link is interpreted as having no siblings
    if (!sourceId || !targetId) {
      return;
    }

    // identify link siblings
    const siblings = graph.getLinks().filter((sibling: joint.dia.Link) => {

      const siblingSourceId = sibling.source().id;
      const siblingTargetId = sibling.target().id;

      // if source and target are the same
      // or if source and target are reversed
      return ((siblingSourceId === sourceId) && (siblingTargetId === targetId))
        || ((siblingSourceId === targetId) && (siblingTargetId === sourceId));
    });

    const numSiblings = siblings.length;
    switch (numSiblings) {

      case 0: {
        // the link has no siblings
        break;

      }
      case 1: {
        // there is only one link
        // no vertices needed
        // cell.unset('vertices');
        break;

      }
      default: {
        // there are multiple siblings
        // we need to create vertices

        // find the middle point of the link
        const sourceCenter = graph.getCell(sourceId).getBBox().center();
        const targetCenter = graph.getCell(targetId).getBBox().center();
        const midPoint = new joint.g.Line(sourceCenter, targetCenter).midpoint();

        // find the angle of the link
        const theta = sourceCenter.theta(targetCenter);

        // constant
        // the maximum distance between two sibling links
        const gap = 30;

        siblings.forEach((sibling, index) => {

          // we want offset values to be calculated as 0, 20, 20, 40, 40, 60, 60 ...
          let offset = gap * Math.ceil(index / 2);

          // place the vertices at points which are `offset` pixels perpendicularly away
          // from the first link
          //
          // as index goes up, alternate left and right
          //
          //  ^  odd indices
          //  |
          //  |---->  index 0 sibling - centerline (between source and target centers)
          //  |
          //  v  even indices
          const sign = ((index % 2) ? 1 : -1);

          // to assure symmetry, if there is an even number of siblings
          // shift all vertices leftward perpendicularly away from the centerline
          if ((numSiblings % 2) === 0) {
            offset -= ((gap / 2) * sign);
          }

          // make reverse links count the same as non-reverse
          const reverse = ((theta < 180) ? 1 : -1);

          // we found the vertex
          const angle = joint.g.toRad(theta + (sign * reverse * 90));
          const vertex = joint.g.Point.fromPolar(offset, angle, midPoint);

          // replace vertices array with `vertex`
          sibling.vertices([vertex]);
        });
      }
    }
  }

  getClickSubject(): Subject<any> {
    return this.clickSubject;
  }

  getGoUpSubject(): Subject<any> {
    return this.goUpSubject;
  }

  getComponentSubject(): Subject<any> {
    return this.dataComponentSubject;
  }

  changeComponent(dataClassComponent: any) {
    this.dataComponentSubject.next(dataClassComponent);
  }
}
