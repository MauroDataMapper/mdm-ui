import {Component, ContentChildren, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {DataClassResult, EditableDataClass} from '../../model/dataClassModel';
import {from, Subscription} from 'rxjs';
import {MessageService} from '../../services/message.service';
import {MarkdownTextAreaComponent} from '../../utility/markdown-text-area.component';
import {ResourcesService} from '../../services/resources.service';
import {MatDialog} from '@angular/material/dialog';
import {ValidatorService} from '../../services/validator.service';
import {MessageHandlerService} from '../../services/utility/message-handler.service';
import {StateHandlerService} from '../../services/handlers/state-handler.service';
import { BroadcastService } from '../../services/broadcast.service';

@Component({
  selector: 'app-data-class-details',
  templateUrl: './data-class-details.component.html',
  styleUrls: ['./data-class-details.component.sass']
})
export class DataClassDetailsComponent implements OnInit {
  result: DataClassResult;
  hasResult = false;
  subscription: Subscription;
  editableForm: EditableDataClass;
  @Input('after-save') afterSave: any;
  @ViewChildren('editableText') editForm: QueryList<any>;
  @ContentChildren(MarkdownTextAreaComponent) editForm1: QueryList<any>;
  @ViewChildren('editableMinText') editFormMinText: QueryList<any>;
  errorMessage = '';
  error = '';
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
  @Input() editMode = false;
  aliases: any[] = [];
  max: any ; min: any;
  exportError: any;

  constructor(private messageService: MessageService, private resourcesService: ResourcesService, private dialog: MatDialog, private validator: ValidatorService, private messageHandler: MessageHandlerService, private broadcastSvc: BroadcastService, private stateHandler: StateHandlerService) {

    this.DataClassDetails();
  }

  ngOnInit() {
    this.editableForm = new EditableDataClass();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;


    this.editableForm.show = () => {
       this.editForm.forEach(x => x.edit({ editing: true,
         focus: x._name === 'moduleName' ? true : false

       }));
      // this.editForm.forEach(x => x.edit({ editing: true }));
      // this.editForm.forEach(
      //     x=>x.edit({focus: true, select: true});
      // )
       this.editableForm.visible = true;
       if (this.min == '*') {
        this.min = '-1';
      }

       if (this.max == '*') {
        this.max = '-1';
      }
    };

    this.editableForm.cancel = () => {
      this.editForm.forEach(x => x.edit({editing: false}));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.error = '';

      this.setEditableForm();

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

      if (this.min == '-1') {
        this.min = '*';
      }

      if (this.max == '-1') {
        this.max = '*';
      }

    };


  }

  private setEditableForm() {
    this.editableForm.description = this.result.description;
    this.editableForm.label = this.result.label;
    this.min = this.result.minMultiplicity;
    this.max = this.result.maxMultiplicity;
  }

  ngAfterViewInit(): void {
    this.error = '';
    // Subscription emits changes properly from component creation onward & correctly invokes `this.invokeInlineEditor` if this.inlineEditorToInvokeName is defined && the QueryList has members
    this.editForm.changes
        .subscribe((queryList: QueryList<any>) => {
          this.invokeInlineEditor();
          // setTimeout work-around prevents Angular change detection `ExpressionChangedAfterItHasBeenCheckedError` https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4

          if (this.editMode) {
            this.editForm.forEach(x => x.edit({ editing: true,
              focus: x._name === 'moduleName' ? true : false
            }));

            this.showForm();

          }

        });
  }


  private invokeInlineEditor(): void {
    const inlineEditorToInvoke = this.editForm.find(
        (inlineEditorComponent: any) => {
          return inlineEditorComponent.name === 'editableText';
        });

  }

  DataClassDetails(): any {

    this.subscription = this.messageService.dataChanged$.subscribe(serverResult => {
      this.result = serverResult;

      this.editableForm.description = this.result.description;
      this.editableForm.label = this.result.label;

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

      if (this.result.minMultiplicity && this.result.minMultiplicity == -1) {
       this.min = '*';
      } else {
        this.min = this.result.minMultiplicity;
      }

      if (this.result.maxMultiplicity && this.result.maxMultiplicity == -1) {
       this.max = '*';
      } else {
        this.max = this.result.maxMultiplicity;
      }


      if (this.result != null) {
        this.hasResult = true;


      }
    });


  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  delete() {
    this.resourcesService.dataClass.delete(this.result.parentDataModel, this.result.parentDataClass, this.result.id).subscribe(result => {

           this.messageHandler.showSuccess('Data Class deleted successfully.');
           this.stateHandler.Go('dataModel', {id: this.result.parentDataModel, reload: true, location: true}, null);
           this.broadcastSvc.broadcast('$reloadFoldersTree');
        },
        error => {
          this.deleteInProgress = false;
          this.messageHandler.showError('There was a problem deleting the Data Model.', error);
        });

  }


  formBeforeSave = function() {
    this.error = '';
    this.editMode = false;
    this.errorMessage = '';

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
      if (this.newMinText == '*') {
        this.newMinText =  -1;
      }

      if (this.max == '*') {
        this.max = -1;
      }
    }
    const resource = {
        id: this.result.id,
        label: this.editableForm.label,
        description: this.editableForm.description,
        aliases,
        classifiers,
        minMultiplicity : parseInt(this.min),
        maxMultiplicity : parseInt(this.max)

      };
    this.resourcesService.dataClass.put(this.result.parentDataModel, this.result.parentDataClass, resource.id, null, { resource }).subscribe(result => {
            if (this.afterSave) {
              this.afterSave(result);
            }
            this.messageHandler.showSuccess('Data Class updated successfully.');
            this.broadcastSvc.broadcast('$reloadFoldersTree');
            this.editableForm.visible = false;
            this.editForm.forEach(x => x.edit({ editing: false }));

          },
          error => {
            this.messageHandler.showError('There was a problem updating the Data Class.', error);
          });
    }


  };

  validateMultiplicity(minVal, maxVal) {
    let min = '';
    if (minVal != null && minVal != undefined) {
      min = minVal + '';
    }
    let max = '';
    if (maxVal != null && maxVal != undefined) {
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
      this.errorMessage = 'DataClass name can not be empty';
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


}
