/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ControlContainer, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { WizardStep } from '@mdm/wizards/wizards.model';
import { DataModelMainComponent } from '../data-model-main/data-model-main.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mdm-data-model-step1',
  templateUrl: './data-model-step1.component.html',
  styleUrls: ['./data-model-step1.component.sass'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class DataModelStep1Component implements OnInit, OnDestroy {

  allDataModelTypes: any;
  step: WizardStep<DataModelMainComponent>;
  setupForm: FormGroup;

  private unsubscribe$ = new Subject();

  constructor(
    private helpDialogueHandler: HelpDialogueHandlerService,
    private resources: MdmResourcesService
  ) {}

  get label() {
    return this.setupForm.get('label');
  }

  get author() {
    return this.setupForm.get('author');
  }

  get organisation() {
    return this.setupForm.get('organisation');
  }

  get description() {
    return this.setupForm.get('description');
  }

  get dataModelType() {
    return this.setupForm.get('dataModelType');
  }

  get classifiers() {
    return this.setupForm.get('classifiers');
  }

  set classifiersValue(value: any[]) {
    this.classifiers.setValue(value);
  }

  ngOnInit() {
    this.setupForm = new FormGroup({
      label: new FormControl('', Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
      author: new FormControl(''),
      organisation: new FormControl(''),
      description: new FormControl(''),
      dataModelType: new FormControl('', Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
      classifiers: new FormControl([])
    });

    this.setupForm.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.step.invalid = this.setupForm.invalid;
      });

    this.resources.dataModel.types().toPromise().then(dataTypes => {
      this.allDataModelTypes = dataTypes.body;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadHelp = () => {
    this.helpDialogueHandler.open('Create_a_new_model');
  };
}
