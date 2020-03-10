import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { ResourcesService } from '../services/resources.service';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.sass']
})
export class DiagramComponent implements OnInit {
  diagram: any;
  cells: any;
  rootCell: any;
  currentDataModel: any;
  allModels: any;

  id: any;

  constructor(
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private resources: ResourcesService
  ) {}

  ngOnInit() {
    this.id = this.stateService.params.id;

    if (!this.id) {
      this.stateHandler.NotFound({ location: false });
    }

    this.resources.dataModel.get(this.id, 'hierarchy').subscribe(res => {
      this.setDiagram(res);
    });

    this.resources.tree.get().subscribe(data => {
      this.allModels = {
        children: data.body,
        isRoot: true
      };
    });
  }

  diagramModelsOnSelect = element => {
    // just only show diagram for DataModels
    // don't load diagram for the current dataModel again
    if (
      element.domainType !== 'DataModel' ||
      this.currentDataModel.id === element.id
    ) {
      return;
    }

    this.cells = [];
    this.rootCell = null;

    this.resources.dataModel.get(element.id, 'hierarchy').subscribe(res => {
      this.setDiagram(res);
    });
  }

  private setDiagram(res: any) {
    // const data = res.body;
    // this.currentDataModel = data;
    // var result = this.jointDiagram3Service.DrawDataModel(this.currentDataModel);
    // this.cells = result.cells;
    // this.rootCell = result.rootCell;
  }
}
