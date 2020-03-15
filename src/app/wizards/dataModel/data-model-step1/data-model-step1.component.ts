import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { HelpDialogueHandlerService } from '../../../services/helpDialogue.service';
import { ResourcesService } from '../../../services/resources.service';
import { ControlContainer, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mdm-data-model-step1',
  templateUrl: './data-model-step1.component.html',
  styleUrls: ['./data-model-step1.component.sass'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class DataModelStep1Component implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private helpDialogueHandler: HelpDialogueHandlerService,
    private resources: ResourcesService
  ) {}

  allDataModelTypes: any;
  step: any;
  model: any;

  formChangesSubscription: Subscription;
  @ViewChild('myForm', { static: false }) myForm: NgForm;

  ngOnInit() {
    this.resources.dataModel
      .get(null, 'types')
      .toPromise()
      .then(dataTypes => {
        this.allDataModelTypes = dataTypes.body;
      });

    this.model = this.step.scope.model;
  }

  ngOnDestroy() {
    this.formChangesSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.formChangesSubscription = this.myForm.form.valueChanges.subscribe(
      () => {
        this.step.invalid = this.myForm.invalid;
      }
    );
  }

  loadHelp = () => {
    this.helpDialogueHandler.open('Create_a_new_model', null);
  };
}
