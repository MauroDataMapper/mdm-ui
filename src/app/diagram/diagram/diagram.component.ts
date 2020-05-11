import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { ResourcesService } from '@mdm/services/resources.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import * as SvgPanZoom from 'svg-pan-zoom';
import * as joint from 'jointjs';
import { MatDialog } from '@angular/material/dialog';
import { BasicDiagramService } from '../services/basic-diagram.service';
import { DataflowDatamodelDiagramService } from '../services/dataflow-datamodel-diagram.service';
import { DataflowDataclassDiagramService } from '../services/dataflow-dataclass-diagram.service';
import { DataflowDataelementDiagramService } from '../services/dataflow-dataelement-diagram.service';
import { DownloadService } from '@mdm/utility/download.service';
import { UmlClassDiagramService } from '../services/umlclass-diagram.service';

@Component({
  selector: 'mdm-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss'],
})

export class DiagramComponent implements OnInit {

  @Input() mode: string;

  @Input() parent: any;

  @Input() diagramComponent: DiagramComponent;

  @ViewChild('jointjs', {static: true}) public jointjsDiv: ElementRef;
  @ViewChild('toolbar', {static: true}) public toolbar: ElementRef;

  public svgPanZoom: SvgPanZoom.Instance;
  public paper: joint.dia.Paper;

  isLoading: boolean;
  isPopup = false;

  initPan: SvgPanZoom.Point;
  initZoom: number;

  flowId: string;
  flowComponentId: string;

  diagramService: BasicDiagramService;

  constructor(protected resourcesService: ResourcesService,
              protected messageHandler: MessageHandlerService,
              protected downloadService: DownloadService,
              protected matDialog: MatDialog) {
    this.isLoading = true;
  }


  public ngOnInit(): void {
    if (this.diagramComponent) {
      this.diagramService = this.diagramComponent.diagramService;
    } else {
      // we're loading from scratch
      this.initializeDiagramService({parent: this.parent});
    }
    this.resetPaper();
  }

  initializeDiagramService(params): void {
    switch (this.mode) {
      case 'dataflow-model':
        this.diagramService = new DataflowDatamodelDiagramService(this.resourcesService, this.messageHandler);
        break;
      case 'dataflow-class':
        this.diagramService = new DataflowDataclassDiagramService(this.resourcesService, this.messageHandler);
        break;
      case 'dataflow-element':
        this.diagramService = new DataflowDataelementDiagramService(this.resourcesService, this.messageHandler);
        break;
      case 'umlclass':
        this.diagramService = new UmlClassDiagramService(this.resourcesService, this.messageHandler);
        break;
    }

    const observable = this.diagramService.getDiagramContent(params);
    observable.subscribe(data => {
        // The diagram service is responsible for the graph
        this.diagramService.render(data);
        this.diagramService.layoutNodes();

      },
      error => {
        console.log(error);
        this.messageHandler.showError('There was a problem getting the model hierarchy.', error);
      });

  }

  resetPaper(): void {
    // then we put the graph onto the paper
    this.finaliseDiagram();
    // then we let the diagram service customise the interaction with the paper
    this.diagramService.configurePaper(this.paper);
    this.isLoading = false;

  }

  public finaliseDiagram() {
    this.paper = new joint.dia.Paper({
      el: this.jointjsDiv.nativeElement,
      width: '100%',
      height: '100%',
      background: {color: '#FFFFFF'},
      model: this.diagramService.graph,
      gridSize: 1,
      attributes: {
        'font-family': '"Nunito Sans", sans-serif',
      } /*,
      This doesn't yet work with the typescript definition...
      interactive: {
        stopDelegation: false
      }*/
    });

    this.paper.setInteractivity({ stopDelegation: false })

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

    if (this.diagramComponent) {
      this.svgPanZoom.zoom(this.diagramComponent.svgPanZoom.getZoom());
      this.svgPanZoom.pan(this.diagramComponent.svgPanZoom.getPan());
    }
    this.paper.on('blank:pointerdown', (evt, x, y) => {
      this.svgPanZoom.enablePan();
    });

    this.paper.on('cell:pointerup blank:pointerup', (cellView: joint.dia.CellView, event) => {
      this.svgPanZoom.disablePan();
      this.diagramService.onDrag(cellView, event);
    });

    this.diagramService.getClickSubject().subscribe(result => {
      if (result.newMode) {
        this.mode = result.newMode;
        this.initializeDiagramService(result);
        this.resetPaper();
      }

    });

    this.diagramService.getGoUpSubject().subscribe(result => {
      if (result.newMode) {
        this.mode = result.newMode;
        this.initializeDiagramService(result);
        this.resetPaper();
      }
    });

  }

  download(): void {
    const scale = 5;
    const width = this.diagramService.graph.getBBox().width;
    const height = this.diagramService.graph.getBBox().height;

    // copy the SVG and configure it
    const svg: SVGElement = this.jointjsDiv.nativeElement.querySelector('svg').cloneNode(true) as SVGElement;
    const panZoomControls = svg.querySelector('g#svg-pan-zoom-controls');
    panZoomControls.remove();

    // 80 is the margin on the graph layout algorithm
    svg.setAttribute('viewBox', '0 0 ' + (width + 80) + ' ' + (height + 80));
    svg.setAttribute('style', 'font-family: sans-serif;');
    this.jointjsDiv.nativeElement.append(svg);
    this.downloadService.downloadSVGAsPNG(svg, 'diagram.png', scale, width, height);
    svg.remove();
  }


  canGoUp(): boolean {
    return this.diagramService.canGoUp();
  }

  toolbarClick(buttonName: string) {
    switch (buttonName) {
      case 'goUp':
        this.diagramService.goUp();
        break;
      case 'download':
        this.download();
        break;
      case 'zoomIn':
        this.svgPanZoom.zoomIn();
        break;
      case 'zoomOut':
        this.svgPanZoom.zoomOut();
        break;
      case 'resetZoom':
        this.svgPanZoom.resetZoom();
        break;
    }

  }


}
