import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
// import * as mermaid from "mermaid";

@Component({
  selector: 'mdm-diagram-tab',
  templateUrl: './diagram-tab.component.html',
  styleUrls: ['./diagram-tab.component.scss']
})
export class DiagramTabComponent implements OnInit {
  @Input('parent-data-model') parentDataModel: any;

  constructor(private resourcesService: ResourcesService) {}

  @ViewChild('mermaid', { static: true })
  public mermaidDiv: ElementRef;

  public ngOnInit(): void {
    // mermaid.initialize({
    //   theme: "default"
    // });


    const graph: string =
      'classDiagram\n' +
      'classA <|-- classB\n' +
      'classC *-- classD\n' +
      'classE o-- classF\n' +
      'classG <-- classH\n' +
      'classI -- classJ\n' +
      'classK <.. classL\n' +
      'classM <|.. classN\n' +
      'classO .. classP';

    // mermaid.render('mermaidDiv', graph, (svgCode, bindFunctions) => {
    //   this.mermaidDiv.nativeElement.innerHTML = svgCode
    // })
  }
}
