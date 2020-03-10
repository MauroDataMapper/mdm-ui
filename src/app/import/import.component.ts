import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ResourcesService } from '../services/resources.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { HelpDialogueHandlerService } from '../services/helpDialogue.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { BroadcastService } from '../services/broadcast.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.sass']
})
export class ImportComponent implements OnInit {
  importers: any;
  importHasError: boolean;
  importErrors: any;

  selectedImporterGroups = [];
  step = 1;
  importerHelp: any;

  selectedImporterStr: any;
  selectedImporterObj: any;

  importingInProgress: boolean;
  importCompleted: boolean;
  importResult: any;

  formData = new FormData();

  formOptionsMap = {
    Integer: 'number',
    String: 'text',
    Password: 'password',
    Boolean: 'checkbox',
    File: 'file'
  };

  constructor(
    private title: Title,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService,
    private helpDialogueHandler: HelpDialogueHandlerService,
    private stateHandler: StateHandlerService,
    private broadcastSvc: BroadcastService
  ) {}

  ngOnInit() {
    this.title.setTitle('Import');
    this.loadImporters();
  }

  loadImporters = (multiple?) => {
    this.resources.public.dataModelImporterPlugins(multiple).subscribe(
      result => {
        this.importers = result.body;
      },
      error => {
        this.messageHandler.showError('Can not load importers!', error);
      }
    );
  }

  loadImporterParameters = selectedItem => {
    if (!selectedItem) {
      this.selectedImporterGroups = [];
      this.step = 1;
      return;
    }

    this.importerHelp = this.helpDialogueHandler.getImporterHelp(
      selectedItem.name
    );

    const action = `parameters/${selectedItem.namespace}/${selectedItem.name}/${selectedItem.version}`;
    this.resources.importer.get(action).subscribe(res => {
      const result = res.body;
      this.selectedImporterGroups = result.parameterGroups;

      for (let g = 0; g < this.selectedImporterGroups.length; g++) {
        const parameters = this.selectedImporterGroups[g].parameters;

        for (let i = 0; i < parameters.length; i++) {
          const option = parameters[i];

          // add default value
          option.value = '';

          if (option.optional === undefined) {
            option.optional = false;
          }

          // When the input is just a checkbox we give it 'false' as the default value
          // so don't mark it as optional, as the form will be invalid unless the user checks or unChecks the input
          if (option.type === 'Boolean') {
            option.optional = true;
            option.value = false;
          }
        }
      }
    });
  }

  importerChanged = () => {
    this.step = 2;
    if (this.selectedImporterStr.length === 0) {
      this.selectedImporterObj = null;
    }
    this.selectedImporterObj = Object.assign({}, this.selectedImporterStr);
    this.loadImporterParameters(this.selectedImporterObj);
  }

  submitForm = isValid => {
    // if the form is not valid, return
    if (!isValid) {
      return;
    }
    this.startImport();
  }

  startImport = () => {
    this.importingInProgress = true;
    this.importCompleted = false;
    this.importResult = null;

    const namespace = this.selectedImporterObj.namespace;
    const name = this.selectedImporterObj.name;
    const version = this.selectedImporterObj.version;
    this.formData = new FormData();

    for (let g = 0; g < this.selectedImporterGroups.length; g++) {
      const parameters = this.selectedImporterGroups[g].parameters;

      for (let i = 0; i < parameters.length; i++) {
        const param = parameters[i];

        if (param.type === 'File') {
          this.formData.append(param.name, this.getFile(param.name));
        } else if (param.type === 'DataModel') {
          this.formData.append(param.name, param.value[0].id);
        } else if (param.type === 'Folder' && param.value && param.value[0]) {
          this.formData.append(param.name, param.value[0].id);
        } else {
          this.formData.append(param.name, param.value);
        }
      }
    }

    this.resources.dataModel
      .import(`${namespace}/${name}/${version}`, this.formData)
      .subscribe(
        (result: any) => {
          this.importingInProgress = false;
          this.importCompleted = true;
          this.importResult = result;
          this.importHasError = false;
          this.importErrors = [];

          this.messageHandler.showSuccess(
            'Data Model(s) imported successfully'
          );
          this.broadcastSvc.broadcast('$reloadDataModels');

          if (result && result.body.count === 1) {
            this.stateHandler.Go(
              'datamodel',
              { id: result.body.items[0].id },
              { reload: true, location: true }
            );
          }
        },
        error => {
          if (error.status === 422) {
            this.importHasError = true;
            this.importErrors = error.error.validationErrors.errors;
          }
          this.importingInProgress = false;
          this.messageHandler.showError('Error in import process', '');
        }
      );
  }

  getFile = paramName => {
    const element: any = document.getElementById(paramName);
    return element && element.files ? element.files[0] : '';
  }

  loadHelp = () => {
    this.helpDialogueHandler.open('Importing_models', {});
  }

  loadImporterHelp = () => {
    this.helpDialogueHandler.open(this.importerHelp, {});
  }

  checkIf(value: any, option: any) {
    // open the devtools and go to the view...code execution will stop here!
    // ..code to be checked... `value` can be inspected now along with all of the other component attributes
  }
}
