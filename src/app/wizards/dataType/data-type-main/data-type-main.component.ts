import { Component, OnInit, Inject } from '@angular/core';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../../../services/handlers/state-handler.service';
import { ResourcesService } from '../../../services/resources.service';
import { MessageHandlerService } from '../../../services/utility/message-handler.service';
import { Step } from '../../../model/stepModel';
import { DataTypeStep1Component } from '../data-type-step1/data-type-step1.component';
import { DataTypeStep2Component } from '../data-type-step2/data-type-step2.component';

@Component({
  selector: 'app-data-type-main',
  templateUrl: './data-type-main.component.html',
  styleUrls: ['./data-type-main.component.sass']
})
export class DataTypeMainComponent implements OnInit {

  constructor(
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService
  ) {}
  parentDataModelId: any;
  steps: Step[] = [];
  processing: any;
  isProcessComplete: any;

  model = {
    createType: 'new',
    copyFromDataModel: [],
    isValid: false,

    parent: {
      id: ''
    },
    parentDataModel: { id: '' },

    label: '',
    description: '',
    organisation: '',
    domainType: 'PrimitiveType',

    metadata: [],
    enumerationValues: [],
    classifiers: [],
    referencedDataType: { id: '' },
    referencedTerminology: { id: '' },
    referencedDataClass: { id: '' }
  };

  ngOnInit() {
    this.parentDataModelId = this.stateService.params.parentDataModelId;

    if (!this.parentDataModelId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    const step1 = new Step();
    step1.title = 'Add Data Type';
    step1.component = DataTypeStep1Component;
    step1.scope = this;
    step1.hasForm = true;

    const step2 = new Step();
    step2.title = 'Data Type Details';
    step2.component = DataTypeStep2Component;
    step2.scope = this;

    this.resources.dataModel
      .get(this.parentDataModelId)
      .toPromise()
      .then(result => {
        result.body.breadcrumbs = [];
        result.body.breadcrumbs.push(Object.assign({}, result.body));
        this.model.parent = result.body;

        this.steps.push(step1);
        this.steps.push(step2);
      });
  }

  cancelWizard() {
    this.stateHandler.GoPrevious();
  }

  save = () => {
    if (this.model.createType === 'new') {
      this.saveNewDataType();
    } else {
      this.saveCopiedDataTypes();
    }
  };

  fireChanged = (tab: any) => {
    for (let i = 0; i < this.steps.length; i++) {
      const step: Step = this.steps[i];

      if (i === tab.selectedIndex) {
        if (step.compRef) {
          step.compRef.instance.onLoad();
          step.active = true;
        }
      } else {
        step.active = false;
      }
    }
  };

  saveNewDataType() {
    const resource = {
      label: this.model.label,
      description: this.model.description,
      organisation: this.model.organisation,
      domainType: this.model.domainType,

      referenceDataType: {
        id: this.model.referencedDataType
          ? this.model.referencedDataType.id
          : null
      },
      referenceClass: {
        id: this.model.referencedDataClass
          ? this.model.referencedDataClass.id
          : null
      },
      terminology: {
        id: this.model.referencedTerminology
          ? this.model.referencedTerminology.id
          : null
      },

      classifiers: this.model.classifiers.map((cls) => {
        return { id: cls.id };
      }),
      enumerationValues: this.model.enumerationValues.map((m) => {
        return {
          key: m.key,
          value: m.value,
          category: m.category
        };
      }),
      metadata: this.model.metadata.map((m) => {
        return {
          key: m.key,
          value: m.value,
          namespace: m.namespace
        };
      })
    };

    const deferred = this.resources.dataModel.post(
      this.model.parent.id,
      'dataTypes',
      { resource }
    );

    deferred.subscribe(
      response => {
        this.messageHandler.showSuccess('Data Type saved successfully.');

        this.stateHandler.Go(
          'DataType',
          { dataModelId: response.dataModel, id: response.id },
          { reload: true, location: true }
        );
      },
      error => {
        this.messageHandler.showError(
          'There was a problem saving the Data Type.',
          error
        );
      }
    );
  }

  saveCopiedDataTypes = () => {
    this.steps[1].compRef.instance.saveCopiedDataTypes();
  }
}
