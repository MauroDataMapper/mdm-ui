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
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mdm-classifier-step1',
  templateUrl: './classifier-step1.component.html',
  styleUrls: ['./classifier-step1.component.sass']
})
export class ClassifierStep1Component implements OnInit, OnDestroy, AfterViewInit {
  constructor(private helpDialogueHandler: HelpDialogueHandlerService) { }

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
    this.formChangesSubscription = this.myForm.form.valueChanges.subscribe(() => {
      this.step.invalid = this.myForm.invalid;
    });
  }

  loadHelp = () => {
    this.helpDialogueHandler.open('Create_a_new_model', null);
  }
}
