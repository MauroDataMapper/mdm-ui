import { BasicDiagramService } from './basic-diagram.service';
import { Observable } from 'rxjs';
import * as joint from 'jointjs';


export class DataflowDataclassDiagramService extends BasicDiagramService {

  parentId: string;
  flowId: string;

  getDiagramContent(params: any): Observable<any> {
    // console.log('getting class diagram content');
    this.parentId = params.parent.id;
    this.flowId = params.flowId;
    return this.resourcesService.dataFlow.getFlow(params.parent.id, params.flowId);
  }

  render(data: any): void {
    const nodes: any = {};
    data.body.items.forEach((flow: any) => {
      nodes[flow.source.id] = flow.source.label;
      nodes[flow.target.id] = flow.target.label;
    });

    Object.keys(nodes).forEach((key) => {
      this.addRectangleCell(key, nodes[key]);
    });
    data.body.items.forEach((flow: any) => {
      const link = new joint.shapes.standard.Link({
        id: flow.id,
        source: {id: flow.source.id},
        target: {id: flow.target.id},
      });
      // link.id = flow.id as string;
      link.connector('rounded', {radius: 40});
      link.toBack();
      this.graph.addCell(link);
    });

  }

  configurePaper(paper: joint.dia.Paper): void {
    paper.on('link:pointerdblclick', (cellView: joint.dia.CellView, event) => {
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
