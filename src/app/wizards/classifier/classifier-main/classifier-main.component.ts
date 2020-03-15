import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Step } from '../../../model/stepModel';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../../../services/handlers/state-handler.service';
import { ResourcesService } from '../../../services/resources.service';
import { MessageHandlerService } from '../../../services/utility/message-handler.service';
import { ClassifierStep1Component } from '../classifier-step1/classifier-step1.component';
import { BroadcastService } from '../../../services/broadcast.service';

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
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService,
    private stateService: StateService,
    private broadcastSvc: BroadcastService
  ) {}

  ngOnInit() {
    this.parentFolderId = this.stateService.params.parentFolderId;
    this.resources.folder
      .get(this.parentFolderId, null, null)
      .toPromise()
      .then(result => {
        result.domainType = 'Folder';
        this.parentFolder = result.body;

        const step1 = new Step();
        step1.title = 'Classifier Details';
        step1.component = ClassifierStep1Component;
        step1.scope = this;
        step1.hasForm = true;

        this.steps.push(step1);
      })
      .catch(error => {
        this.messageHandler.showError(
          'There was a problem loading the Folder.',
          error
        );
      });
  }

  saveClassifier = () => {
    const resource = {
      label: this.model.label,
      description: this.model.description
    };

    let deferred;
    deferred = this.resources.classifier.post(null, null, {
      resource
    });

    deferred.subscribe(
      response => {
        this.messageHandler.showSuccess('Classifier saved successfully.');

        this.stateHandler.Go(
          'classification',
          {
            id: response.body.id
          },
          { reload: true, location: true }
        );
        this.broadcastSvc.broadcast('$reloadClassifiers');
      },
      error => {
        this.messageHandler.showError(
          'There was a problem saving the Classifier.',
          error
        );
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
