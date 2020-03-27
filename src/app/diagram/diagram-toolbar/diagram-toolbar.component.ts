import {
  Component,
  ElementRef, EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  Pipe,
  PipeTransform,
  ViewChild
} from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import * as SvgPanZoom from 'svg-pan-zoom';
import * as _ from 'lodash';
import * as joint from 'jointjs';
import { forkJoin } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { BasicDiagramService } from '../services/basic-diagram.service';
import { DataflowDatamodelDiagramService } from '../services/dataflow-datamodel-diagram.service';
import { DiagramComponent } from '../diagram/diagram.component';
import { DiagramPopupComponent } from '../diagram-popup/diagram-popup.component';

@Component({
  selector: 'mdm-diagram-toolbar',
  templateUrl: './diagram-toolbar.component.html'
})

export class DiagramToolbarComponent implements OnInit {

  @Output() toolbarClick = new EventEmitter<string>();

  @Input() isPopup: boolean;

  constructor() {
  }

  ngOnInit(): void {

  }

  click(buttonName: string): void {
    this.toolbarClick.emit(buttonName);
  }

}

