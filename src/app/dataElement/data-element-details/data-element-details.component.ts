import {
  AfterViewInit,
  Component,
  ContentChildren,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { from, Subscription } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { MarkdownTextAreaComponent } from '../../utility/markdown-text-area.component';
import { ResourcesService } from '../../services/resources.service';
import { MatDialog } from '@angular/material/dialog';
import { ValidatorService } from '../../services/validator.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import {
  DataElementResult,
  EditableDataElement
} from '../../model/dataElementModel';
import { BroadcastService } from '../../services/broadcast.service';

@Component({
  selector: 'mdm-data-element-details',
  templateUrl: './data-element-details.component.html',
  styleUrls: ['./data-element-details.component.sass']
})
export class DataElementDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  result: DataElementResult;
  hasResult = false;
  subscription: Subscription;
  editableForm: EditableDataElement;
  @Input() afterSave: any;
  @ViewChildren('editableText') editForm: QueryList<any>;
  @ContentChildren(MarkdownTextAreaComponent) editForm1: QueryList<any>;
  @ViewChildren('editableMinText') editFormMinText: QueryList<any>;
  @Input() parentDataModel;
  @Input() parentDataClass;
  errorMessage = '';
  error = '';
  dataTypeErrors = '';
  newMinText: any;
  newMaxText: any;
  showEdit: boolean;
  showFinalise: boolean;
  showPermission: boolean;
  showDelete: boolean;
  deleteInProgress: boolean;
  exporting: boolean;
  showEditMode = false;
  processing = false;
  exportError: any;
  @Input() editMode = false;
  aliases: any[] = [];
  max: any;
  min: any;
  showNewInlineDataType = false;
  newInlineDataType = null;
  dataTypes: any;
  isValid = false;
  newlyAddedDataType = {
    label: '',
    description: '',

    metadata: [],
    domainType: 'PrimitiveType',
    enumerationValues: [],
    classifiers: [],
    referencedDataClass: '',
    referencedTerminology: ''
  };
  constructor(
    private messageService: MessageService,
    private resourcesService: ResourcesService,
    private dialog: MatDialog,
    private validator: ValidatorService,
    private messageHandler: MessageHandlerService,
    private broadcastSvc: BroadcastService,
    private stateHandler: StateHandlerService
  ) {
    this.DataElementDetails();
  }

  toggleShowNewInlineDataType() {
    this.showNewInlineDataType = !this.showNewInlineDataType;
    this.error = '';
    this.dataTypeErrors = '';
  }

  ngOnInit() {
    if (this.parentDataModel) {
      this.fetchDataTypes(null, null, null, null);
    }
    this.editableForm = new EditableDataElement();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.editForm.forEach(x =>
        x.edit({
          editing: true,
          focus: x._name === 'moduleName' ? true : false
        })
      );
      // this.editForm.forEach(x => x.edit({ editing: true }));
      // this.editForm.forEach(
      //     x=>x.edit({focus: true, select: true});
      // )
      this.editableForm.visible = true;
      if (this.min === '*') {
        this.min = '-1';
      }

      if (this.max === '*') {
        this.max = '-1';
      }
    };

    this.editableForm.cancel = () => {
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;

      this.errorMessage = '';
      this.error = '';

      this.editableForm.label = this.result.label;
      this.editableForm.description = this.result.description;
      if (this.result.classifiers) {
        this.result.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      this.editableForm.aliases = [];
      this.aliases = [];
      if (this.result.aliases) {
        this.result.aliases.forEach(item => {
          this.aliases.push(item);
          this.editableForm.aliases.push(item);
        });
      }

      if (this.min === '-1') {
        this.min = '*';
      }

      if (this.max === '-1') {
        this.max = '*';
      }
    };
  }

  ngAfterViewInit(): void {
    this.error = '';
    // Subscription emits changes properly from component creation onward & correctly invokes `this.invokeInlineEditor` if this.inlineEditorToInvokeName is defined && the QueryList has members
    this.editForm.changes.subscribe((queryList: QueryList<any>) => {
      this.invokeInlineEditor();
      // setTimeout work-around prevents Angular change detection `ExpressionChangedAfterItHasBeenCheckedError` https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4

      if (this.editMode) {
        this.editForm.forEach(x =>
          x.edit({
            editing: true,
            focus: x._name === 'moduleName' ? true : false
          })
        );

        this.showForm();
      }
    });
  }

  private invokeInlineEditor(): void {
    const inlineEditorToInvoke = this.editForm.find(
      (inlineEditorComponent: any) => {
        return inlineEditorComponent.name === 'editableText';
      }
    );
  }

  DataElementDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(
      serverResult => {
        this.result = serverResult;
        this.editableForm.label = this.result.label;
        this.editableForm.description = this.result.description;
        if (this.result.classifiers) {
          this.result.classifiers.forEach(item => {
            this.editableForm.classifiers.push(item);
          });
        }
        this.aliases = [];
        if (this.result.aliases) {
          this.result.aliases.forEach(item => {
            this.aliases.push(item);
            // this.editableForm.aliases.push(item);
          });
        }

        if (
          this.result.minMultiplicity &&
          this.result.minMultiplicity === -1
        ) {
          this.min = '*';
        } else {
          this.min = this.result.minMultiplicity;
        }

        if (
          this.result.maxMultiplicity &&
          this.result.maxMultiplicity === -1
        ) {
          this.max = '*';
        } else {
          this.max = this.result.maxMultiplicity;
        }

        if (this.result != null) {
          this.hasResult = true;
        }
      }
    );
  }

  fetchDataTypes(text, loadAll, offset, limit) {
    const options = {
      pageSize: limit ? limit : 30,
      pageIndex: offset ? offset : 0,
      sortBy: 'label',
      sortType: 'asc'
      // filters:"label=" + text
    };

    // if(loadAll){
    //     delete options.filters;
    // }
    this.resourcesService.dataModel
      .get(this.parentDataModel.id, 'dataTypes', options)
      .subscribe(result => {
        this.dataTypes = result.body.items;

        // count: result.count,
        // limit: options.pageSize,
        // offset: options.pageIndex
      });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  delete() {
    this.resourcesService.dataClass
      .delete(
        this.result.parentDataModel,
        this.result.parentDataClass,
        this.result.id
      )
      .subscribe(
        result => {
          this.messageHandler.showSuccess('Data Class deleted successfully.');
          this.stateHandler.Go(
            'dataModel',
            {
              id: this.result.parentDataModel,
              reload: true,
              location: true
            },
            null
          );
        },
        error => {
          this.deleteInProgress = false;
          this.messageHandler.showError(
            'There was a problem deleting the Data Model.',
            error
          );
        }
      );
  }

  formBeforeSave = function() {
    if (!this.validate()) {
      return;
    }

    this.error = '';
    this.editMode = false;
    this.errorMessage = '';
    // this.editForm.forEach(x => this.result["label"] = x.getHotState().value);

    const classifiers = [];
    this.editableForm.classifiers.forEach(cls => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach(alias => {
      aliases.push(alias);
    });

    if (this.validateLabel(this.result.label) && this.validateMultiplicity(this.min, this.max)) {
      if (this.min != null && this.min !== '' && this.max != null && this.max !== '') {
        if (this.newMinText === '*') {
          this.newMinText = -1;
        }

        if (this.max === '*') {
          this.max = -1;
        }
      }

      let dataType;
      if (!this.showNewInlineDataType) {
        dataType = { id: this.result.dataType.id };
      } else {
        dataType = this.newlyAddedDataType;
      }
      const resource = {
        id: this.result.id,
        label: this.result.label,
        description: this.editableForm.description,
        domainType: this.result.domainType,
        aliases,
        dataType,
        classifiers,
        minMultiplicity: parseInt(this.min, 10),
        maxMultiplicity: parseInt(this.max, 10)
      };
      const call = from(
        this.resourcesService.dataElement.put(
          this.parentDataModel.id,
          this.parentDataClass.id,
          resource.id,
          null,
          { resource }
        )
      ).subscribe(
        result => {
          if (this.afterSave) {
            this.afterSave(result);
          }
          this.messageHandler.showSuccess('Data Element updated successfully.');
          this.broadcastSvc.broadcast('$reloadFoldersTree');
          this.editableForm.visible = false;
          this.editForm.forEach(x => x.edit({ editing: false }));
        },
        error => {
          this.messageHandler.showError(
            'There was a problem updating the Data Element.',
            error
          );
        }
      );
    }
  };

  validate() {
    let isValid = true;

    if (!this.showNewInlineDataType) {
      return true;
    }
    if (
      !this.newlyAddedDataType.label ||
      this.newlyAddedDataType.label.trim().length === 0
    ) {
      isValid = false;
    }
    // Check if for EnumerationType, at least one value is added
    if (
      this.newlyAddedDataType.domainType === 'EnumerationType' &&
      this.newlyAddedDataType.enumerationValues.length === 0
    ) {
      isValid = false;
    }
    // Check if for ReferenceType, the dataClass is selected
    if (
      this.newlyAddedDataType.domainType === 'ReferenceType' &&
      !this.newlyAddedDataType.referencedDataClass
    ) {
      isValid = false;
    }

    // Check if for TerminologyType, the terminology is selected
    if (
      this.newlyAddedDataType.domainType === 'TerminologyType' &&
      !this.newlyAddedDataType.referencedTerminology
    ) {
      isValid = false;
    }

    this.isValid = isValid;
    if (!this.isValid) {
      this.dataTypeErrors = '';
      this.dataTypeErrors =
        'Please fill in all required values for the new Data Type';
      return false;
    } else {
      return true;
    }
  }

  validateMultiplicity(minVal, maxVal) {
    let min = '';
    if (minVal != null && minVal !== undefined) {
      min = minVal + '';
    }
    let max = '';
    if (maxVal != null && maxVal !== undefined) {
      max = maxVal + '';
    }

    const errorMessage = this.validator.validateMultiplicities(min, max);
    if (errorMessage) {
      this.error = errorMessage;
      return false;
    }
    return true;
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  validateLabel(data): any {
    if (!data || (data && data.trim().length === 0)) {
      this.errorMessage = 'DataElement name can not be empty';
      return false;
    } else {
      return true;
    }
  }

  showForm() {
    this.editableForm.show();
  }

  onCancelEdit() {
    this.errorMessage = '';
    this.error = '';
    this.editMode = false; // Use Input editor whe adding a new folder.
  }

  onLabelChange(value: any) {
    if (!this.validateLabel(value)) {
      this.editableForm.validationError = true;
    } else {
      this.editableForm.validationError = false;
      this.errorMessage = '';
    }
  }

  onDataTypeSelect(dataType, model) {
    this.result.dataType = dataType;
  }
}
