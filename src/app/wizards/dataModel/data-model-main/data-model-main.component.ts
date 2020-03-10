import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataModelStep1Component } from '../data-model-step1/data-model-step1.component';
import { DataModelStep2Component } from '../data-model-step2/data-model-step2.component';
import { StateHandlerService } from '../../../services/handlers/state-handler.service';
import { ResourcesService } from '../../../services/resources.service';
import { MessageHandlerService } from '../../../services/utility/message-handler.service';
import { StateService } from '@uirouter/core';
import { Step } from '../../../model/stepModel';
import { BroadcastService } from '../../../services/broadcast.service';

@Component({
  selector: 'app-data-model-main',
  templateUrl: './data-model-main.component.html',
  styleUrls: ['./data-model-main.component.sass']
})
export class DataModelMainComponent implements OnInit {

  constructor(
    private broadcastSvc: BroadcastService,
    private stateHandler: StateHandlerService,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService,
    private stateService: StateService
  ) {}
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  steps: Step[] = [];
  doneEvent = new EventEmitter<any>();
  parentFolderId: any;

  parentFolder: any;

  model: any = {
    metadata: [],
    classifiers: []
  };

  ngOnInit() {
    // this.firstFormGroup = this._formBuilder.group({
    //    firstCtrl: ['', Validators.required]
    // });
    // this.secondFormGroup = this._formBuilder.group({
    //    secondCtrl: ['', Validators.required]
    // });

    this.parentFolderId = this.stateService.params.parentFolderId;
    this.resources.folder
      .get(this.parentFolderId, null, null)
      .toPromise()
      .then(result => {
        result.domainType = 'Folder';
        this.parentFolder = result.body;

        const step1 = new Step();
        step1.title = 'Data Model Details';
        step1.component = DataModelStep1Component;
        step1.scope = this;
        step1.hasForm = true;

        const step2 = new Step();
        step2.title = 'Default Data Types';
        step2.component = DataModelStep2Component;
        step2.scope = this;

        this.steps.push(step1);
        this.steps.push(step2);
      })
      .catch(error => {
        this.messageHandler.showError(
          'There was a problem loading the Folder.',
          error
        );
      });
  }

  cancelWizard = () => {
    this.stateHandler.GoPrevious();
  }

  save = () => {
    const resource = {
      folder: this.parentFolderId,
      label: this.model.label,
      description: this.model.description,
      author: this.model.author,
      organisation: this.model.organisation,
      type: this.model.dataModelType,
      dialect: '',
      classifiers: this.model.classifiers.map(cls => {
        return { id: cls.id };
      }),
      metadata: this.model.metadata.map(m => {
        return {
          key: m.key,
          value: m.value,
          namespace: m.namespace
        };
      })
    };
    if (resource.type === 'Database') {
      resource.dialect = this.model.dialect;
    }

    let queryStringParams = null;
    if (this.model.selectedDataTypeProvider) {
      queryStringParams = {
        defaultDataTypeProvider: this.model.selectedDataTypeProvider.name
      };
    }

    this.resources.dataModel
      .post(null, null, {resource, queryStringParams})
      .subscribe(
        response => {
          this.messageHandler.showSuccess('Data Model saved successfully.');
          this.broadcastSvc.broadcast('$reloadFoldersTree');
          this.stateHandler.Go(
            'dataModel',
            { id: response.body.id },
            { reload: true, location: true }
          );
        },
        error => {
          this.messageHandler.showError(
            'There was a problem saving the Data Model.',
            error
          );
        }
      );
  }
}
