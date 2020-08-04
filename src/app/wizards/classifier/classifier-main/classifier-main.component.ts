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
import { Component, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Step } from '@mdm/model/stepModel';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { ClassifierStep1Component } from '../classifier-step1/classifier-step1.component';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-classifier-main',
  templateUrl: './classifier-main.component.html',
  styleUrls: ['./classifier-main.component.sass']
})
export class ClassifierMainComponent implements OnInit {
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

  constructor(
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private stateService: StateService,
    private broadcastSvc: BroadcastService,
    private title: Title,
    private changeRef: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.parentFolderId = this.stateService.params.parentFolderId || '';
    this.resources.folder.get(this.parentFolderId).toPromise().then(result => {
        result.domainType = 'Folder';
        this.parentFolder = result.body;

        const step1 = new Step();
        step1.title = 'Classifier Details';
        step1.component = ClassifierStep1Component;
        step1.scope = this;
        step1.hasForm = true;

        this.steps.push(step1);
        this.changeRef.detectChanges();
      }).catch(error => {
        this.messageHandler.showError('There was a problem loading the Folder.', error);
      });
    this.title.setTitle(`New Classifier`);
  }

  saveClassifier = () => {
    const resource = {
      label: this.model.label,
      description: this.model.description
    };

    this.resources.classifier.save(resource).subscribe(response => {
        this.messageHandler.showSuccess('Classifier saved successfully.');
        this.stateHandler.Go('classification',
          {
            id: response.body.id
          },
          { reload: true, location: true }
        );
        this.broadcastSvc.broadcast('$reloadClassifiers');
      }, error => {
        this.messageHandler.showError('There was a problem saving the Classifier.', error);
      }
    );
  };

  cancelWizard = () => {
    this.stateHandler.GoPrevious();
  };
  closeWizard = () => {
    this.stateHandler.GoPrevious();
  }
}
