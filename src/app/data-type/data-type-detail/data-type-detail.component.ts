import { Component, OnInit, Input, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { ElementTypesService } from '../../services/element-types.service';
import { ResourcesService } from '../../services/resources.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { SharedService } from '../../services/shared.service';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { EditableDataModel, DataModelResult } from '../../model/dataModelModel';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-data-type-detail',
  templateUrl: './data-type-detail.component.html',
  styleUrls: ['./data-type-detail.component.scss']
})
export class DataTypeDetailComponent implements OnInit {
  @Input() mcDataTypeObject: any;
  @Input() mcParentDataModel: any;
  @Input() afterSave: any;
  @Input() openEditForm: any;
  @Input() hideEditButton: any;
  @ViewChildren('editableText') editForm: QueryList<any>;

  constructor(
    private dialog: MatDialog,
    private sharedService: SharedService,
    private elementTypes: ElementTypesService,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private changeRef: ChangeDetectorRef
  ) {}

  allDataTypes = this.elementTypes.getAllDataTypesArray();
  allDataTypesMap = this.elementTypes.getAllDataTypesMap();
  editableForm: EditableDataModel;
  errorMessage: any;

  ngOnInit() {

    this.editableForm = new EditableDataModel();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;
    this.editableForm.description = this.mcDataTypeObject.description;
    this.editableForm.label = this.mcDataTypeObject.label;

    this.editableForm.show = () => {
      this.editForm.forEach(x => x.edit({ editing: true,
          focus: x._name === 'moduleName' ? true : false
           }));
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.editableForm.description = this.mcDataTypeObject.description;
      this.editableForm.label = this.mcDataTypeObject.label;
      if (this.mcDataTypeObject['classifiers']) {
            this.mcDataTypeObject['classifiers'].forEach(item => {
                this.editableForm.classifiers.push(item);
            });
        }
       if (this.mcDataTypeObject['aliases']) {
      this.mcDataTypeObject["aliases"].forEach(item => {
        this.editableForm.aliases.push(item);
      });
       }

    };
  }

  validateLabel = data => {
    if (!data || (data && data.trim().length === 0)) {
      return 'Data Type name can not be empty';
    }
  }

  formBeforeSave = () => {

    let resource = {
      id: this.mcDataTypeObject.id,
      label: this.editableForm.label,
      description: this.editableForm.description,
      aliases: this.mcDataTypeObject.editAliases,
      domainType: this.mcDataTypeObject.domainType,
      classifiers: this.mcDataTypeObject.classifiers.map(function(cls) {
        return { id: cls.id };
      })
    };

    this.resources.dataType
      .put(this.mcParentDataModel.id, this.mcDataTypeObject.id, null, {
        resource
      })
      .subscribe((res) => {
        const result = res.body;
        if (this.afterSave) {
          this.afterSave(resource);
        }

        this.mcDataTypeObject.aliases = Object.assign([], result.aliases);
        this.mcDataTypeObject.editAliases = Object.assign([], this.mcDataTypeObject.aliases);
        this.mcDataTypeObject.label = result.label;
        this.mcDataTypeObject.description = result.description;
        this.messageHandler.showSuccess('Data Type updated successfully.');
        this.editableForm.visible = false;

      }, (error) => {
        this.messageHandler.showError('There was a problem updating the Data Type.', error);

      });

    this.changeRef.detectChanges();

  }

  openEditClicked = formName => {
    if (this.openEditForm) {
      this.openEditForm(formName);
    }
  }

  onCancelEdit = () => {
    this.mcDataTypeObject.editAliases = Object.assign(
      [],
      this.mcDataTypeObject.aliases
    );
    this.changeRef.detectChanges();
  }

  delete = () => {
    this.resources.dataType
      .delete(this.mcParentDataModel.id, this.mcDataTypeObject.id)
      .subscribe(
        result => {
          this.messageHandler.showSuccess('Data Type deleted successfully.');
          this.stateHandler.Go(
            'dataModel',
            { id: this.mcParentDataModel.id },
            { reload: true, location: true }
          );
        },
        error => {
          this.messageHandler.showError(
            'There was a problem deleting the Data Type.',
            error
          );
        }
      );
  }

  askToDelete = () => {
    if (!this.sharedService.isAdminUser()) {
      return;
    }

    // check if it has DataElements
    this.resources.dataType
      .get(
        this.mcParentDataModel.id,
        this.mcDataTypeObject.id,
        'dataElements',
        null
      )
      .subscribe(res => {
        const result = res.body;
        let dataElementsCount = result.count;

        let message =
          'Are you sure you want to <span class=\'errorMessage\'>permanently</span> delete this Data Type?';
        if (dataElementsCount > 0) {
          message +=
            '<br>All it\'s Data Elements <strong>(' +
            dataElementsCount +
            ')</strong> will be deleted <span class=\'errorMessage\'>permanently</span> as well:<br>';

          for (let i = 0; i < Math.min(5, result.items.length); i++) {
            let link = this.elementTypes.getLinkUrl(result.items[i]);

            message +=
              '<a target=\'_blank\' href=\'' +
              link +
              '\'>' +
              result.items[i].label +
              '</a><br>';
          }
          if (result.count > 5) {
            message += ' ...';
          }
        }

        this.dialog
          .open(ConfirmationModalComponent, { data: { message } })
          .afterClosed()
          .subscribe(result => {
            if (result.status !== 'ok') {
              return;
            }
            this.delete();
          });
      });
  }
}
