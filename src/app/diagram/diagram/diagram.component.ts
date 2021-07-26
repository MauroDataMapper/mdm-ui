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
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { DownloadService } from '@mdm/utility/download.service';
import * as joint from 'jointjs';
import SvgPanZoom from 'svg-pan-zoom';
import { BasicDiagramService } from '../services/basic-diagram.service';
import { DataflowDataclassDiagramService } from '../services/dataflow-dataclass-diagram.service';
import { DataflowDataelementDiagramService } from '../services/dataflow-dataelement-diagram.service';
import { DataflowDatamodelDiagramService } from '../services/dataflow-datamodel-diagram.service';
import { ModelsMergingDiagramService } from '../services/models-merging-diagram.service';
import { UmlClassDiagramService } from '../services/umlclass-diagram.service';
import { DiagramCatalogueItem, DiagramMode, DiagramParameters } from './diagram.model';

@Component({
  selector: 'mdm-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss'],
})
export class DiagramComponent implements OnInit {
  @Input() mode: DiagramMode;

  @Input() parent: DiagramCatalogueItem;

  @Input() diagramComponent: DiagramComponent;

  @ViewChild('jointjs', { static: true }) public jointjsDiv: ElementRef;
  @ViewChild('toolbar', { static: true }) public toolbar: ElementRef;

  public svgPanZoom: SvgPanZoom.Instance;
  public paper: joint.dia.Paper;

  isEdit = false;
  isLoading: boolean;
  isPopup = false;


  initPan: SvgPanZoom.Point;
  initZoom: number;

  flowId: string;
  flowComponentId: string;

  description: string;
  dataClassComponent: any;

  diagramService: BasicDiagramService;

  constructor(
    protected resourcesService: MdmResourcesService,
    protected messageHandler: MessageHandlerService,
    protected downloadService: DownloadService,
    protected matDialog: MatDialog
  ) {
    this.isLoading = true;
  }

  public ngOnInit(): void {

    if (this.diagramComponent) {
      this.diagramService = this.diagramComponent.diagramService;
    } else {
      // we're loading from scratch
      this.initializeDiagramService({ parent: this.parent });
    }
    this.resetPaper();
  }

  initializeDiagramService(params: DiagramParameters): void {
    switch (this.mode) {
      case 'dataflow-model':
        this.diagramService = new DataflowDatamodelDiagramService(
          this.resourcesService,
          this.messageHandler
        );
        break;
      case 'dataflow-class':
        this.diagramService = new DataflowDataclassDiagramService(
          this.resourcesService,
          this.messageHandler
        );
        break;
      case 'dataflow-element':
        this.diagramService = new DataflowDataelementDiagramService(
          this.resourcesService,
          this.messageHandler
        );
        break;
      case 'umlclass':
        this.diagramService = new UmlClassDiagramService(
          this.resourcesService,
          this.messageHandler
        );
        break;
      case 'model-merging-graph':
        this.diagramService = new ModelsMergingDiagramService(
          this.resourcesService,
          this.messageHandler);
        break;
    }
    const observable = this.diagramService.getDiagramContent(params);
    observable.subscribe((data) => {
        // The diagram service is responsible for the graph
      this.diagramService.render(data);
      if (this.mode === 'model-merging-graph') {
        // Bottom-to-top layout
        this.diagramService.layoutNodes('BT');
      } else {
        this.diagramService.layoutNodes();
      }
    },
      (error) => {
        this.messageHandler.showError('There was a problem getting the model hierarchy.', error);
      }
    );
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
      model: this.diagramService.graph,
      gridSize: 1,
      attributes: {
        'font-family': '"Nunito Sans", sans-serif',
      } /* ,
      This doesn't yet work with the typescript definition...
      interactive: {
        stopDelegation: false
      }*/,
    });

    this.paper.setInteractivity({ stopDelegation: false });

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
    this.paper.on('blank:pointerdown', () => {
      this.svgPanZoom.enablePan();
    });

    this.paper.on('cell:pointerup blank:pointerup', (cellView: joint.dia.CellView) => {
      this.svgPanZoom.disablePan();
        this.diagramService.onDrag(cellView);
    });

    this.diagramService.getClickSubject().subscribe((result) => {
      if (result.newMode) {
        this.mode = result.newMode;
        this.initializeDiagramService(result);
        this.resetPaper();
      }
    });

    this.diagramService.getGoUpSubject().subscribe((result) => {
      if (result.newMode) {
        this.mode = result.newMode;
        this.initializeDiagramService(result);
        this.resetPaper();
      }
    });

    this.diagramService.currentComponent.subscribe(data => this.dataClassComponent = data);
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
    svg.setAttribute('viewBox', `0 0 ${width + 80} ${height + 80}`);
    svg.setAttribute('style', 'font-family: sans-serif;');
    this.jointjsDiv.nativeElement.append(svg);
    this.downloadService.downloadSVGAsPNG(svg, 'diagram.png', scale, width, height);
    svg.remove();
  }

  canGoUp(): boolean {
    return this.diagramService.canGoUp();
  }

  filter(parent: any, filterList: Array<any>, mode: string): void {
    const params = { parent };
    this.diagramService.getDiagramContent(params).subscribe((data) => {
      const filteredClasses: Array<any> = [];
      filterList.forEach((x) => {
        const index = data.body.childDataClasses.findIndex((y) => y.id === x);
        if (index !== -1) {
          filteredClasses.push(data.body.childDataClasses[index]);
        }
      });
      if (filterList.length > 0) {
        data.body.childDataClasses = filteredClasses;
      }
      this.diagramService.render(data);

      if (mode === 'model-merging-graph') {
        // Bottom-to-top layout
        this.diagramService.layoutNodes('BT');
      } else {
        this.diagramService.layoutNodes();
      }

      this.resetPaper();
    });
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

  edit = () => {
    this.isEdit = !this.isEdit;
    // this.isSearch = !this.isSearch;
  };

  save = () => {
    switch (this.mode) {
      case 'dataflow-class':
        this.diagramService.updateDataClassComponentLevel(this.dataClassComponent);
        this.isEdit = false;
        break;
      case 'dataflow-element':
        this.diagramService.updateDataElementLevel(this.dataClassComponent);
        this.isEdit = false;
        break;
      default:
        break;
    }
  };
}
