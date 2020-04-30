import {Component, OnInit, Input, Output, EventEmitter, DoCheck} from '@angular/core';
import { ResourcesService } from '@mdm/services/resources.service';
import { ElementTypesService } from '@mdm/services/element-types.service';

@Component({
  selector: 'mdm-data-type-inline',
  templateUrl: './new-data-type-inline.component.html',
  styleUrls: ['./new-data-type-inline.component.sass']
})
export class NewDataTypeInlineComponent implements OnInit, DoCheck {
  @Output() validationStatusEvent = new EventEmitter<string>();

  @Input() parentDataModel;
  @Input() showParentDataModel = false;
  @Input() showClassification = false;
  @Input() model: any = {
    label: '',
    description: '',
    domainType: '',
    referencedDataClass: '',
    referencedTerminology: ''
  };

  childDataClasses: any; // TODO - FIGURE OUT IF NEEDED

  @Input() parentScopeHandler;
  allDataTypes;
  isValid = false;
  reloading = false;
  terminologies: any;

  constructor(
    private resourceService: ResourcesService,
    private elementTypes: ElementTypesService
  ) {
    this.allDataTypes = this.elementTypes.getAllDataTypesArray();
    if (this.allDataTypes) { this.model.domainType = this.allDataTypes[0]; }
    this.loadTerminologies();
  }

  sendValidationStatus() {
    this.validationStatusEvent.emit(String(!this.isValid));
  }

  ngOnInit() {
    this.validate();
    if (this.parentScopeHandler) {
      this.parentScopeHandler.$broadcast('newDataTypeInlineUpdated', {
        model: this.model,
        isValid: this.isValid
      });
    }
  }

  ngDoCheck() {
    this.validate();
    this.sendValidationStatus();
  }

  onTypeSelect() {
    if (this.model.domainType !== 'TerminologyType') {
      this.model.referencedTerminology.id = '';
    }

    this.validate();
  }

  validate(newValue?) {
    let isValid = true;

    if (!this.model.label || this.model.label.trim().length === 0) {
      isValid = false;
    }
    // Check if for EnumerationType, at least one value is added
    if (
      this.model.domainType === 'EnumerationType' &&
      this.model.enumerationValues.length === 0
    ) {
      isValid = false;
    }
    // Check if for ReferenceType, the dataClass is selected
    if (
      this.model.domainType === 'ReferenceType' &&
      (!this.model.referencedDataClass || this.model.referencedDataClass.id === '')
    ) {
      isValid = false;
    }

    // Check if for TerminologyType, the terminology is selected
    if (
      this.model.domainType === 'TerminologyType' &&
      (!this.model.referencedTerminology ||
        this.model.referencedTerminology.id === '')
    ) {
      isValid = false;
    }

    this.isValid = isValid;
  }

  onDataClassSelect = dataClasses => {
    if (dataClasses && dataClasses.length > 0) {
      this.model.referencedDataClass = dataClasses[0];
    } else {
      this.model.referencedDataClass = null;
    }
  };

  loadTerminologies() {
    this.reloading = true;
    this.resourceService.terminology.get(null, null, null).subscribe(
      data => {
        this.terminologies = data.body.items;
        this.reloading = false;
      },
      function() {
        this.reloading = false;
      }
    );
  }

  onTerminologySelect(terminology: any, record: any) {
    this.model.referencedTerminology = terminology;
    this.model.terminology = terminology;
  }

  onEnumListUpdated = newEnumList => {
    this.model.enumerationValues = newEnumList;
  }
}
