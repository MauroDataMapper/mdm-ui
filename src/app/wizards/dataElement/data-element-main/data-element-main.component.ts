import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit
} from '@angular/core';
import { Step } from '../../../model/stepModel';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../../../services/handlers/state-handler.service';
import { ResourcesService } from '../../../services/resources.service';
import { DataElementStep1Component } from '../data-element-step1/data-element-step1.component';
import { DataElementStep2Component } from '../data-element-step2/data-element-step2.component';
import { MessageHandlerService } from '../../../services/utility/message-handler.service';

@Component({
  selector: 'mdm-data-element-main',
  templateUrl: './data-element-main.component.html',
  styleUrls: ['./data-element-main.component.sass']
})
export class DataElementMainComponent implements OnInit {
  // constructor(private stateService: StateService, private stateHandler: StateHandlerService, private resources : ResourcesService) { }
  constructor(
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService,
    private changeRef: ChangeDetectorRef
  ) {}
  steps: Step[] = [];
  doneEvent = new EventEmitter<any>();
  parentDataModelId: any;
  grandParentDataClassId: any;
  parentDataClassId: any;
  // allDataTypesCount : any;
  processing: any;
  isProcessComplete: any;
  finalResult = {};
  successCount = 0;
  failCount = 0;
  datatype: any;

  model = {
    metadata: [],
    dataType: undefined,
    description: undefined,
    classifiers: [],
    parentDataModel: { id: this.parentDataModelId },
    parentDataClass: { id: this.parentDataClassId },
    parent: {},
    createType: 'new',
    copyFromDataClass: [],
    selectedDataElements: [],
    label: '',
    inlineDataTypeValid: false,
    showNewInlineDataType: false,
    allDataTypesCount: 0,
    newlyAddedDataType: {
      label: '',
      description: '',

      metadata: [],
      domainType: 'PrimitiveType',
      enumerationValues: [],
      classifiers: [],
      organisation: '',
      referencedDataType: { id: '' },
      referencedTerminology: { id: '' },
      referencedDataClass: { id: '' }
    },
    isProcessComplete : false
  };

  ngOnInit() {
    this.parentDataModelId = this.stateService.params.parentDataModelId;
    this.grandParentDataClassId = this.stateService.params.grandParentDataClassId;
    this.parentDataClassId = this.stateService.params.parentDataClassId;

    if (!this.parentDataModelId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }
    this.model.parentDataModel.id = this.parentDataModelId;
    const step1 = new Step();
    step1.title = 'How to create';
    step1.component = DataElementStep1Component;
    step1.scope = this;
    step1.hasForm = true;
    step1.invalid = true;

    const step2 = new Step();
    step2.title = 'Element Details';
    step2.component = DataElementStep2Component;
    step2.scope = this;
    step2.invalid = true;

    // this.resources.dataClass
    //     .get(this.parentDataModelId, this.grandParentDataClassId, this.parentDataClassId, null,null).toPromise()
    //     .then((result) => {
    //       result.body.breadcrumbs.push(Object.assign([],result.body));
    //       this.model.parent = result.body;
    //       this.steps.push(step1);
    //       this.steps.push(step2);
    //     });
    //
    // this.resources.dataModel
    //     .get(this.parentDataModelId, "dataTypes").toPromise().then((result) => {
    //   result.body.breadcrumbs = [];
    //   result.body.breadcrumbs.push(Object.assign({}, result.body));
    //   this.model.parent = result.body;
    //   this.steps.push(step1);
    //   this.steps.push(step2);
    // });

    this.resources.dataClass
      .get(
        this.parentDataModelId,
        this.grandParentDataClassId,
        this.parentDataClassId,
        null,
        null
      )
      .subscribe(result => {
        // result.body.breadcrumbs.push(Object.assign([],result.body));
        this.model.parent = result.body;
        this.steps.push(step1);
        this.steps.push(step2);
      });

    this.resources.dataModel
      .get(this.parentDataModelId, 'dataTypes')
      .subscribe(result => {
        this.model.allDataTypesCount = result.count;
        if (result.count === 0) {
          this.model.showNewInlineDataType = true;
        }
      });
  }

  cancelWizard = () => {
    this.stateHandler.GoPrevious();
  };

  save = () => {
    if (this.model.createType === 'new') {
      this.validateDataType();
      this.saveNewDataElement();
    } else {
       this.saveCopiedDataClasses();
    }
  };

  getMultiplicity = (resource, multiplicity) => {
    if (this.model[multiplicity] === '*') {
      this.model[multiplicity] = -1;
    }
    if (!isNaN(this.model[multiplicity])) {
      resource[multiplicity] = parseInt(this.model[multiplicity], 10);
    }
  };

  fireChanged = (tab: any) => {
    for (let i = 0; i < this.steps.length; i++) {
      const step: Step = this.steps[i];

      if (i === tab.selectedIndex) {
        if (step.compRef) {
          step.compRef.instance.onLoad();
          step.active = true;
          this.changeRef.detectChanges();
        }
      } else {
        step.active = false;
      }
    }
    this.changeRef.detectChanges();
  };

  // saveCopiedDataClasses = () => {
  //
  //   this.processing = true;
  //   this.isProcessComplete = false;
  //
  //   const chain = [];
  //
  //   this.model.selectedDataElements.forEach((dc) => {
  //     var link = "dataClasses/" + dc.dataModel + "/" + dc.id;
  //     if (this.model.parent.domainType === "DataClass") {
  //       chain.push(this.resources.dataClass.post(this.model.parent.dataModel,this.model.parent.id,link,null));
  //     } else {
  //       chain.push(this.resources.dataModel.post(this.model.parent.id, link, null));
  //     }
  //   });
  //
  //   Observable.forkJoin(chain).subscribe((result) => {
  //         this.processing = false;
  //         this.isProcessComplete = true;
  //
  //       },
  //       (error) => {
  //         this.processing = false;
  //         this.isProcessComplete = true;
  //       });
  // }

  saveNewDataElement = () => {
    let dataType;
    if (!this.model.showNewInlineDataType) {
      dataType = { id: this.model.dataType.id };
      this.saveDataElement(dataType);
    } else {
      const res = {
        label: this.model.newlyAddedDataType.label,
        description: this.model.newlyAddedDataType.description,
        organisation: this.model.newlyAddedDataType.organisation,
        domainType: this.model.newlyAddedDataType.domainType,

        referenceDataType: {
          id: this.model.newlyAddedDataType.referencedDataType
            ? this.model.newlyAddedDataType.referencedDataType.id
            : null
        },
        referenceClass: {
          id: this.model.newlyAddedDataType.referencedDataClass
            ? this.model.newlyAddedDataType.referencedDataClass.id
            : null
        },
        terminology: {
          id: this.model.newlyAddedDataType.referencedTerminology
            ? this.model.newlyAddedDataType.referencedTerminology.id
            : null
        },

        classifiers: this.model.classifiers.map(cls => ({id: cls.id})),
        enumerationValues: this.model.newlyAddedDataType.enumerationValues.map(
          m => ({
            key: m.key,
            value: m.value,
            category: m.category
          })
        ),
        metadata: this.model.metadata.map(m => ({
          key: m.key,
          value: m.value,
          namespace: m.namespace
        }))
      };

      const deferred = this.resources.dataModel.post(
        this.parentDataModelId,
        'dataTypes',
        { resource: res }
      );

      deferred.subscribe(
        response => {
          dataType = response.body;
          this.saveDataElement(response.body);
        },
        error => {
          this.messageHandler.showError(
            'There was a problem saving the Data Type.',
            error
          );
        }
      );
    }
  };

  saveNewDataType = () => {
    const resource = {
      label: this.model.newlyAddedDataType.label,
      description: this.model.newlyAddedDataType.description,
      organisation: this.model.newlyAddedDataType.organisation,
      domainType: this.model.newlyAddedDataType.domainType,

      referenceDataType: {
        id: this.model.newlyAddedDataType.referencedDataType
          ? this.model.newlyAddedDataType.referencedDataType.id
          : null
      },
      referenceClass: {
        id: this.model.newlyAddedDataType.referencedDataClass
          ? this.model.newlyAddedDataType.referencedDataClass.id
          : null
      },
      terminology: {
        id: this.model.newlyAddedDataType.referencedTerminology
          ? this.model.newlyAddedDataType.referencedTerminology.id
          : null
      },

      classifiers: this.model.classifiers.map(cls => ({id: cls.id})),
      enumerationValues: this.model.newlyAddedDataType.enumerationValues.map(
        m => ({
          key: m.key,
          value: m.value,
          category: m.category
        })
      ),
      metadata: this.model.metadata.map(m => ({
        key: m.key,
        value: m.value,
        namespace: m.namespace
      }))
    };

    const deferred = this.resources.dataModel.post(
      this.parentDataModelId,
      'dataTypes',
      { resource }
    );

    deferred.subscribe(
      response => {
        this.datatype = response.body;
      },
      error => {
        this.messageHandler.showError(
          'There was a problem saving the Data Type.',
          error
        );
      }
    );
  };

  saveDataElement = (dataType: any) => {
    const resource = {
      label: this.model.label,
      description: this.model.description,
      dataType: {
        id: dataType.id
      },
      classifiers: this.model.classifiers.map(cls => {
        return { id: cls.id };
      }),
      metadata: this.model.metadata.map(m => {
        return {
          key: m.key,
          value: m.value,
          namespace: m.namespace
        };
      }),
      minMultiplicity: null,
      maxMultiplicity: null
    };

    this.getMultiplicity(resource, 'minMultiplicity');
    this.getMultiplicity(resource, 'maxMultiplicity');

    let deferred;
    deferred = this.resources.dataClass.post(
      this.parentDataModelId,
      this.parentDataClassId,
      'dataElements',
      { resource }
    );

    deferred.subscribe(
      response => {
        this.messageHandler.showSuccess('Data Element saved successfully.');

        this.stateHandler.Go(
          'dataElement',
          {
            dataModelId: response.body.dataModel || '',
            dataClassId: response.body.dataClass || '',
            id: response.body.id
          },
          { reload: true, location: true }
        );
      },
      error => {
        this.messageHandler.showError(
          'There was a problem saving the Data Element.',
          error
        );
      }
    );
  };

  validateDataType() {
    let isValid = true;

    if (!this.model.showNewInlineDataType) {
      return true;
    }
    if (
      !this.model.newlyAddedDataType.label ||
      this.model.newlyAddedDataType.label.trim().length === 0
    ) {
      isValid = false;
    }
    // Check if for EnumerationType, at least one value is added
    if (
      this.model.newlyAddedDataType.domainType === 'EnumerationType' &&
      this.model.newlyAddedDataType.enumerationValues.length === 0
    ) {
      isValid = false;
    }
    // Check if for ReferenceType, the dataClass is selected
    if (
      this.model.newlyAddedDataType.domainType === 'ReferenceType' &&
      !this.model.newlyAddedDataType.referencedDataClass
    ) {
      isValid = false;
    }
    //
    // //Check if for TerminologyType, the terminology is selected
    if (
      this.model.newlyAddedDataType.domainType === 'TerminologyType' &&
      !this.model.newlyAddedDataType.referencedTerminology
    ) {
      isValid = false;
    }

    // if(!isValid) {
    //   this.dataTypeErrors = "";
    //   this.dataTypeErrors = "Please fill in all required values for the new Data Type";
    //   return false;
    // }
    // else
    //   return true;
  }

  saveCopiedDataClasses = () => {
    this.steps[1].compRef.instance.saveCopiedDataClasses();
  };
}
