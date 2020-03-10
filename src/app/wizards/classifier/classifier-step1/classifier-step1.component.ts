import { Component, OnInit, ViewChild } from '@angular/core';
import { HelpDialogueHandlerService } from '../../../services/helpDialogue.service';
import { ResourcesService } from '../../../services/resources.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-classifier-step1',
  templateUrl: './classifier-step1.component.html',
  styleUrls: ['./classifier-step1.component.sass']
})
export class ClassifierStep1Component implements OnInit {
  constructor(
    private helpDialogueHandler: HelpDialogueHandlerService  ) {}

  allDataModelTypes: any;
  step: any;
  model: any;

  formChangesSubscription: Subscription;
  @ViewChild('myForm', { static: false }) myForm: NgForm;

  ngOnInit() {
    this.model = this.step.scope.model;
    this.step.invalid = true;
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
  }
}
