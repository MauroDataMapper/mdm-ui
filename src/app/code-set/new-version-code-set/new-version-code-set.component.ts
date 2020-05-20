import { Component, OnInit } from '@angular/core';
import {StateService} from '@uirouter/core';
import {StateHandlerService} from '@mdm/services/handlers/state-handler.service';
import {ResourcesService} from '@mdm/services/resources.service';
import {ValidatorService} from '@mdm/services/validator.service';
import {MessageHandlerService} from '@mdm/services/utility/message-handler.service';

@Component({
  selector: 'mdm-new-version-code-set',
  templateUrl: './new-version-code-set.component.html',
  styleUrls: ['./new-version-code-set.component.scss']
})
export class NewVersionCodeSetComponent implements OnInit {
  step = 1;
  codeSet: any;
  errors: any;
  versionType: any;
  processing: any;
  form = {
    label: '',
    copyPermissions: false,
    copyDataFlows: false,

    moveDataFlows: false
  };
  constructor( private stateService: StateService,
               private stateHandler: StateHandlerService,
               private resources: ResourcesService,
               private validator: ValidatorService,
               private messageHandler: MessageHandlerService) {
    window.document.title = 'New Version';
  }

  ngOnInit() {
    if (!this.stateService.params.codeSetId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.resources.codeSet
      .get(this.stateService.params.codeSetId, null, null)
      .subscribe(response => {
        this.codeSet = response.body;
      });
  }

  versionTypeChecked() {
    this.step++;
    // this.isCompleted = true;
  }

  validate() {
    this.errors = null;

    if (!this.versionType) {
      return false;
    }

    if (this.versionType === 'newElementVersion') {
      if (this.validator.isEmpty(this.form.label)) {
        this.errors = this.errors || {};
        this.errors.label = 'Codeset name can not be empty!';
      } else if (
        this.form.label.trim().toLowerCase() ===
        this.codeSet.label.trim().toLowerCase()
      ) {
        this.errors = this.errors || {};
        this.errors.label = `The name should be different from the current version name ${this.codeSet.label}`;
      }
    }
    return !this.errors;
  }

  save() {
    if (!this.validate()) {
      return;
    }
    // newElementVersion
    // newDocumentVersion
    if (this.versionType === 'newElementVersion') {
      const resource = {
        label: this.form.label,
        copyPermissions: this.form.copyPermissions,
        copyDataFlows: this.form.copyDataFlows
      };
      this.processing = true;
      this.resources.codeSet.put(this.codeSet.id, 'newVersion', { resource }).subscribe(
        response => {
          this.processing = false;
          this.messageHandler.showSuccess('New Codeset version created successfully.');
          this.stateHandler.Go('codeset', { id: response.body.id }, { reload: true });
        },
        error => {
          this.processing = false;
          this.messageHandler.showError('There was a problem creating the new Codeset version.', error);
        }
      );
    } else if (this.versionType === 'newDocumentVersion') {
      const resources = {moveDataFlows: this.form.moveDataFlows};
      this.processing = true;
      this.resources.codeSet.put(this.codeSet.id, 'newDocumentationVersion', { resource: resources }).subscribe(
        response => {
          this.processing = false;
          this.messageHandler.showSuccess('New Document Model version created successfully.');
          this.stateHandler.Go('codeset', { id: response.body.id }, { reload: true } );
        },
        error => {
          this.processing = false;
          this.messageHandler.showError('There was a problem creating the new Document Model version.', error );
        }
      );
    }
  }

  cancel = function() {
    this.stateHandler.Go('codeset', { id: this.codeSet.id });
  };

}
