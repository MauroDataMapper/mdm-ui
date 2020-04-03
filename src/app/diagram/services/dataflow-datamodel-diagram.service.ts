import { BasicDiagramService } from './basic-diagram.service';
import { BehaviorSubject, Observable } from 'rxjs';
import * as joint from 'jointjs';
import { ResourcesService } from '../../services/resources.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { DataflowDataclassDiagramService } from './dataflow-dataclass-diagram.service';


export class DataflowDatamodelDiagramService extends BasicDiagramService {

  private parentId: string;

  constructor(protected resourcesService: ResourcesService,
              protected messageHandler: MessageHandlerService) {
    super(resourcesService, messageHandler);
  }

  getDiagramContent(params: any): Observable<any> {
    this.parentId = params.parent.id;
    return this.resourcesService.dataFlow.getAllFlows(this.parentId);
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
        source: {id: flow.source.id},
        target: {id: flow.target.id},
      });
      link.id = flow.id as string;
      link.connector('rounded', {radius: 40});
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

  configurePaper(paper: joint.dia.Paper): void {
    paper.on('link:pointerdblclick', (cellView: joint.dia.CellView, event) => {
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
