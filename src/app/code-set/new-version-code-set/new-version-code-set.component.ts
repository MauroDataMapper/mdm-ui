/*
Copyright 2020 University of Oxford

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Component, OnInit } from '@angular/core';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from '@mdm/services/validator.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { Title } from '@angular/platform-browser';

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
  constructor(private stateService: StateService,
              private stateHandler: StateHandlerService,
              private resources: MdmResourcesService,
              private validator: ValidatorService,
              private messageHandler: MessageHandlerService,
              private title: Title) {
  }

  ngOnInit() {
    this.title.setTitle('New Version');

    // tslint:disable-next-line: deprecation
    if (!this.stateService.params.codeSetId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    // tslint:disable-next-line: deprecation
    this.resources.codeSet.get(this.stateService.params.codeSetId).subscribe(response => {
      this.codeSet = response.body;
    });
  }

  versionTypeChecked() {
    this.step++;
  }

  validate() {
    this.errors = null;

    if (!this.versionType) {
      return false;
    }

    if (this.versionType === 'Fork') {
      if (this.validator.isEmpty(this.form.label)) {
        this.errors = this.errors || {};
        this.errors.label = 'Codeset name can not be empty!';
      } else if (this.form.label.trim().toLowerCase() === this.codeSet.label.trim().toLowerCase()) {
        this.errors = this.errors || {};
        this.errors.label = 'The name should be different comparing to the current version';
      }
    }

    if (this.versionType === 'Branch') {
      if (this.validator.isEmpty(this.form.label)) {
        this.errors = this.errors || {};
        this.errors.label = 'Branch name can not be empty!';
      }
    }
    return !this.errors;
  }

  save() {
    if (!this.validate()) {
      return;
    }

    if (this.versionType === 'Fork') { // newModelVersion
      const resource = {
        label: this.form.label,
        copyPermissions: this.form.copyPermissions,
        copyDataFlows: this.form.copyDataFlows
      };
      this.processing = true;
      this.resources.codeSet.newForkModel(this.codeSet.id, resource).subscribe(response => {
        this.processing = false;
        if (response) {
          this.stateHandler.Go('codeset', { id: response.body.id }, { reload: true });
          this.messageHandler.showSuccess('New Codeset version created successfully.');
        }
      }, error => {
        this.processing = false;
        this.messageHandler.showError('There was a problem creating the new Codeset version.', error);
      });
    } else if (this.versionType === 'Version') { // newDocumentationVersion
      // const resources = { moveDataFlows: this.form.moveDataFlows };
      this.processing = true;
      this.resources.codeSet.newBranchModelVersion(this.codeSet.id, {}).subscribe(response => {
        this.processing = false;
        this.messageHandler.showSuccess('New Model version created successfully.');
        this.stateHandler.Go('codeset', { id: response.body.id }, { reload: true });
      }, error => {
        this.processing = false;
        this.messageHandler.showError('There was a problem creating the new Model version.', error);
      });
    } else if (this.versionType === 'Branch') {

      let resources = {};
      if (this.form.label !== null && this.form.label !== '') {
        resources = { branchName: this.form.label };
      }

      this.processing = true;
      this.resources.codeSet.newBranchModelVersion(this.codeSet.id, resources).subscribe(
        response => {
          this.processing = false;
          this.messageHandler.showSuccess('New Branch created successfully.');
          this.stateHandler.Go('codeset', { id: response.body.id }, { reload: true });
        }, error => {
          this.processing = false;
          this.messageHandler.showError('There was a problem creating the new Codeset branch.', error);
        });
    }
  }
  cancel = () => {
    this.stateHandler.Go('codeset', { id: this.codeSet.id });
  };
}
