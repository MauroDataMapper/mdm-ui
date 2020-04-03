import { BasicDiagramService } from './basic-diagram.service';
import { BehaviorSubject, Observable } from 'rxjs';
import * as joint from 'jointjs';
import { ResourcesService } from '../../services/resources.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { DataflowDataclassDiagramService } from './dataflow-dataclass-diagram.service';


export class UmlClassDiagramService extends BasicDiagramService {

  private modelId: string;
  private allDataClasses: Array<any> = [];
  private subClassLinks: Array<any> = [];
  private referenceLinks: Array<any> = [];

  constructor(protected resourcesService: ResourcesService,
              protected messageHandler: MessageHandlerService) {
    super(resourcesService, messageHandler);
  }

  getDiagramContent(params: any): Observable<any> {
    this.modelId = params.parent.id;
    return this.resourcesService.hierarchy.get(this.modelId);
  }


  render(data: any): void {
    this.addAllChildDataClasses(data.body);
    this.allDataClasses.forEach( dataClass => {
      this.addRectangleCell(dataClass.id, '', 300, dataClass.attributes.length * 25 + 31);
    });
    this.addLinks();
    super.layoutNodes('TB');
    this.allDataClasses.forEach( dataClass => {
      const oldCell = this.graph.getCell(dataClass.id) as joint.shapes.standard.Rectangle;
      this.addUmlClassCell(dataClass.id, dataClass.label, dataClass.attributes, null, oldCell);
    });

  }

  addLinks(): void {
    const filledDiamond = 'M 40 0 L 20 10 L 0 0 L 20 -10 z';
    this.subClassLinks.forEach(subClassLink => {
      const link = new joint.shapes.standard.Link({
        id: subClassLink.source + '-' + subClassLink.target,
        source: {id: subClassLink.source},
        target: {id: subClassLink.target},
        attrs: {
          line: {
            sourceMarker: {d: filledDiamond},
            targetMarker: {d: ''}
          }
        }
      });
      // link.id = flow.id as string;
      // link.attr('.marker-target', { d: 'M 40 0 L 20 10 L 0 0 L 20 -10 z', fill: 'black' });
      link.connector('rounded', {radius: 40});
      link.toBack();
      this.graph.addCell(link);
    });
    this.referenceLinks.forEach(subClassLink => {
      const link = new joint.shapes.standard.Link({
        id: subClassLink.source + '-' + subClassLink.label,
        source: {id: subClassLink.source},
        target: {id: subClassLink.target},
        attrs: {
          line: {
            sourceMarker: {d: ''},
            targetMarker: {d: ''}
          }
        }
      });
      // link.id = flow.id as string;
      link.connector('rounded', {radius: 40});
      link.toBack();
      this.graph.addCell(link);
    });

  }

  addAllChildDataClasses(container: any): void {
    container.childDataClasses.forEach( childDataClass => {
      this.allDataClasses.push({
        id: childDataClass.id,
        label: childDataClass.label,
        attributes: childDataClass.childDataElements.filter(attribute => {
          return attribute.dataType.domainType !== 'ReferenceType';
        })
      });
      if (container.domainType !== 'DataModel') {
        this.subClassLinks.push({
          source: container.id,
          target: childDataClass.id
        });
      }
      this.addAllChildDataClasses(childDataClass);
      childDataClass.childDataElements.filter(attribute => {
        return attribute.dataType.domainType === 'ReferenceType';
      }).forEach( attribute => {
        this.referenceLinks.push({
          source: childDataClass.id,
          target: attribute.dataType.referenceClass.id,
          name: attribute.label
        });
      });
    });

  }

  layoutNodes(): void {
    // console.log('not calling super');
  }


  configurePaper(paper: joint.dia.Paper): void {

  }
  canGoUp(): boolean {
    return false;
  }

  goUp(): void {


  }


}
