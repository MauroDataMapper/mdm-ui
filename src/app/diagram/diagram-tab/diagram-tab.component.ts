import {Component, ElementRef, Input, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {ResourcesService} from '../../services/resources.service';
import {MessageHandlerService} from '../../services/utility/message-handler.service';
import * as SvgPanZoom from 'svg-pan-zoom';
import * as _ from 'lodash';
import * as dagre from 'dagre';
import * as graphlib from 'graphlib';
import * as joint from 'jointjs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'mdm-diagram-tab',
  templateUrl: './diagram-tab.component.html',
  styleUrls: ['./diagram-tab.component.scss']
})

export class DiagramTabComponent implements OnInit {

  hierarchy: any;
  @Input() mode: string;

  @Input() parent: any;
  isLoading: boolean;

  flowId: string;
  flowComponentId: string;

  constructor(private resourcesService: ResourcesService, private messageHandler: MessageHandlerService) {
    this.isLoading = true;
  }
  @ViewChild('jointjs', {static: true})
  public jointjsDiv: ElementRef;

  public svgPanZoom: SvgPanZoom.Instance;
  public graph: joint.dia.Graph;
  public paper: joint.dia.Paper;


  public ngOnInit(): void {
    this.drawDiagram();
  }

  public drawDiagram() {
    this.getDiagramContents().subscribe(
      (data) => {
        this.setUpGraph();
        if (this.mode === 'dataflow' && !this.flowId) {
          this.renderDataModelFlow(data.body);
        } else if (this.mode === 'dataflow' && this.flowId && !this.flowComponentId) {
          this.renderDataClassFlow(data.body);
        } else if (this.mode === 'dataflow' && this.flowId && this.flowComponentId) {
          this.renderDataClassFlowComponents(data.body);
        }
        this.diagramFinalise();
        this.isLoading = false;
      },
      (error) => {
        this.messageHandler.showError('There was a problem getting the model hierarchy.', error);
      });

  }

  public layoutNodes() {
    joint.layout.DirectedGraph.layout(this.graph, {
      setLabels: true,
      setVertices: true,
      setLinkVertices: true,
      dagre,
      graphlib,
      rankDir: 'LR',
      marginX: 40,
      marginY: 40,
      nodeSep: 100,
      rankSep: 400,
      edgeSep: 0});
  }

  public diagramFinalise() {

    console.log('finalising diagram...');
    this.layoutNodes();

    const svg: any = this.jointjsDiv.nativeElement.querySelector('svg');
    const options: any = {
      // viewportSelector: '#viewport',
      dblClickZoomEnabled: false,
      controlIconsEnabled: true,
      center: false,
      fit: false,
    };

    this.svgPanZoom = SvgPanZoom(svg, options);
    this.svgPanZoom.disablePan();
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.querySelector('#svg-pan-zoom-controls').setAttribute('transform', 'translate(0 0) scale(0.75)');

    console.log('...finalised');

  }


  getDiagramContents(): any {
    console.log(this.mode);
    if (this.mode === 'umlclass') {
      return this.resourcesService.hierarchy.get(this.parent.id);
    } else if (this.mode === 'dataflow' && !this.flowId) {
      return this.resourcesService.dataFlow.getAllFlows(this.parent.id);
    } else if (this.mode === 'dataflow' && this.flowId && !this.flowComponentId) {
      return this.resourcesService.dataFlow.getFlow(this.parent.id, this.flowId);
    } else if (this.mode === 'dataflow' && this.flowId && this.flowComponentId) {
      return this.resourcesService.dataFlow.getFlowComponents(this.parent.id, this.flowId, this.flowComponentId);
    }
  }

  setUpGraph() {
    this.graph = new joint.dia.Graph();
    this.paper = new joint.dia.Paper({
      el: this.jointjsDiv.nativeElement,
      width: '100%',
      height: '100%',
      model: this.graph,
      gridSize: 1,
      attributes: {
        'font-family': '"Helvetica Neue",Helvetica,Arial,sans-serif',
      }
    });

    this.paper.on('blank:pointerdown', (evt, x, y) => {
      this.svgPanZoom.enablePan();
    });

    this.paper.on('cell:pointerup blank:pointerup', (cellView: joint.dia.CellView, event) => {
      this.svgPanZoom.disablePan();
      if (cellView instanceof joint.dia.ElementView) {
        this.adjustVertices(this.graph, (cellView as joint.dia.ElementView).model);
      }
    });


  }

  renderDataClassFlowComponents(dataflows: any) {

    // First we get a list of all the classes that are in play:
    const classes: object = {};
    dataflows.items.forEach( (dataFlowComponent) => {
      dataFlowComponent.sourceElements.forEach((element) => {
        classes[element.dataClass] = element.breadcrumbs;
      });
      dataFlowComponent.targetElements.forEach((element) => {
        classes[element.dataClass] = element.breadcrumbs;
      });
    });
    const classGetters = [];
    const options = { sort: 'label', order: 'asc', all: true};
    Object.keys(classes).forEach((classId) => {
      const dataModelId: string = classes[classId][0].id;
      let parentClassId: string = null;
      if (classes[classId].length > 2) {
        parentClassId = classes[classId][classes[classId].length - 2].id;
      }
      classGetters.push(
        this.resourcesService.dataClass.get(dataModelId, null, classId, 'dataElements', options)
      );
    });
    forkJoin(classGetters).subscribe((result) => {
      console.log(result);
      Object.keys(classes).forEach( (classId) => {
        const classBreadcrumb = classes[classId][classes[classId].length - 1];
        const attributes: Array<any> = [];
        result.forEach((elementResponse: any) => {
          elementResponse.body.items.forEach((element) => {
            if (element.dataClass === classId) {
              attributes.push(element);
            }
          });

        });
        this.addUmlClassCell(classBreadcrumb.id, classBreadcrumb.label, attributes);

      });
      dataflows.items.forEach( (flowComponent) => {

        this.addSmallRectangleCell(flowComponent.id, flowComponent.label);

        flowComponent.sourceElements.forEach((sourceElement) => {
          const link1 = new joint.shapes.standard.Link({
            id: sourceElement.id + '/' + flowComponent.id,
            source: { id: sourceElement.id,
              anchor: {
                name: 'right'
              }},
            target: {id: flowComponent.id,
              anchor: {
                name: 'left'
              }}
          });
          link1.connector('rounded');
          this.graph.addCell(link1);
        });
        flowComponent.targetElements.forEach((targetElement) => {
          const link2 = new joint.shapes.standard.Link({
            id: targetElement.id + '/' + flowComponent.id,
            source: {id: flowComponent.id,
              anchor: {
                name: 'right'
              }},
            target: {id: targetElement.id,
              anchor: {
                name: 'left'
              }}
          });
          link2.connector('rounded');
          this.graph.addCell(link2);
        });
      });
      joint.layout.DirectedGraph.layout(this.graph, {
        setLabels: true,
        setVertices: true,
        setLinkVertices: true,
        dagre,
        graphlib,
        rankDir: 'LR',
        marginX: 40,
        marginY: 40,
        nodeSep: 3,
        rankSep: 200,
        edgeSep: 0,
        clusterPadding: 0});
      // this.diagramFinalise();

    }, (error) => {
      this.messageHandler.showError('Cannot get the details of a source or target class', error);
    });

  }


  renderDataClassFlow(dataflows: any) {
    this.paper.on('link:pointerdblclick', (cellView: joint.dia.CellView, event) => {
      this.flowComponentId = cellView.model.attributes.source.id as string;
      this.drawDiagram();
    });

    const nodes: any = {};
    dataflows.items.forEach( (flow: any) => {
      nodes[flow.source.id] = flow.source.label;
      nodes[flow.target.id] = flow.target.label;
    });

    Object.keys(nodes).forEach( (key) => {
      this.addRectangleCell(key, nodes[key]);
    });
    dataflows.items.forEach( (flow: any) => {
      const link = new joint.shapes.standard.Link({
        id: flow.id,
        source: { id: flow.source.id},
        target: { id: flow.target.id},
      });
      // link.id = flow.id as string;
      link.connector('rounded');
      link.toBack();
      this.graph.addCell(link);
    });

  }

  renderDataModelFlow(dataflows: any) {
    this.paper.on('link:pointerdblclick', (cellView: joint.dia.CellView, event) => {
      this.flowId = cellView.model.id as string;
      this.drawDiagram();
    });

    const nodes: object = {};
    dataflows.items.forEach( (flow: any) => {
      nodes[flow.source.id] = flow.source.label;
      nodes[flow.target.id] = flow.target.label;
    });

    Object.keys(nodes).forEach( (key) => {
      this.addCylinderCell(key, nodes[key]);
    });

    dataflows.items.forEach( (flow) => {
      const link = new joint.shapes.standard.Link({
        id: flow.id,
        source: {id: flow.source.id},
        target: {id: flow.target.id},
      });
      link.id = flow.id as string;
      link.connector('rounded');
      link.appendLabel({
        attrs: {
          text: {
            text: joint.util.breakText(flow.label, {width: 150}),
            fill: '#222222',
            fontSize: 10,
            fontWeight: 'normal'
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

  addCylinderCell(id: string, label: string): joint.dia.Cell {
    const cylinder = new joint.shapes.standard.Cylinder({
      id,
      size: { width: 120, height: 80 }
    });
    cylinder.attr('label/text', joint.util.breakText(label, {width: 110} ));
    cylinder.attr('label/fontWeight', 'bold');
    cylinder.attr('label/fontSize', 12);

    cylinder.attr('text/ref-y', -50);
    this.graph.addCell(cylinder);
    return cylinder;
  }

  private addRectangleCell(id: string, label: string): joint.dia.Cell {
    const rectangle = new joint.shapes.standard.Rectangle({
      id,
      size: {width: 120, height: 80}
    });
    rectangle.attr('label/text', joint.util.breakText(label, {width: 110}));
    rectangle.attr('label/fontWeight', 'bold');
    rectangle.attr('label/fontSize', 12);

    // rectangle.attr('text/ref-y', -50);
    this.graph.addCell(rectangle);
    return rectangle;

  }

  private addSmallRectangleCell(id: string, label: string): joint.dia.Cell {
    const rectangle = new joint.shapes.standard.Rectangle({
      id,
      size: {width: 150, height: 40}
    });
    rectangle.attr('label/text', joint.util.breakText(label, {width: 90}));
    rectangle.attr('label/fontWeight', 'bold');
    rectangle.attr('label/fontSize', 12);

    // rectangle.attr('text/ref-y', -50);
    this.graph.addCell(rectangle);
    return rectangle;

  }

  private addUmlClassCell(id: string, label: string, attributes: Array<any>): joint.dia.Cell {
    const cells: Array<joint.dia.Cell> = [];

    const classBox = new joint.shapes.standard.Rectangle({
      id,
      size: {width: 300, height: attributes.length * 25 + 31},
      attrs: {
        body: {
          fill: '#FFFFFF',
          'fill-opacity': 0
        }
      }

    });
    classBox.attr('rect/fontWeight', 'bold');


    const classNameBox = new joint.shapes.standard.Rectangle( {
      id: id + '-name',
      size: {width: 300, height: 30},
      attrs: {
        label: {
          text: joint.util.breakText(label, {width: 290}),
          fontWeight: 'bold',
          fontSize: 13
        }
      }
    });
    classBox.embed(classNameBox);
    cells.push(classNameBox);

    attributes.forEach((attribute, idx) => {

      const attributeBox = new joint.shapes.standard.Rectangle( {
        position: {x: 5, y: 31 + idx * 25},
        id: attribute.id ,
        size: {width: 290, height: 25},
        attrs: {
          label: {
            text: joint.util.breakText(attribute.label + ' : ' + attribute.dataType.label, {width: 280}),
            fontWeight: 'normal',
            fontSize: 12,
            textAnchor: 'left',
            refX: 10
          },
          body: {
            strokeWidth: 0
          },

        }
      });
      // attributeBox.addPort();
      classBox.embed(attributeBox);
      cells.push(attributeBox);
    });
    cells.push(classBox);
    this.graph.addCells(cells);
    return classBox;

  }


  private adjustAllVertices(graph: joint.dia.Graph) {
    graph.getCells().forEach((cell) => {
      if (cell instanceof joint.dia.Link) {
        this.adjustVertices(graph, cell);
      }
    });

  }

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
          if (key !== 'undefined') { this.adjustVertices(graph, _.first(group)); }
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
    if (!sourceId || !targetId) { return; }

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

      } case 1: {
        // there is only one link
        // no vertices needed
        // cell.unset('vertices');
        break;

      } default: {
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
        const GAP = 30;

        siblings.forEach((sibling, index) => {

          // we want offset values to be calculated as 0, 20, 20, 40, 40, 60, 60 ...
          let offset = GAP * Math.ceil(index / 2);

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
            offset -= ((GAP / 2) * sign);
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

}

