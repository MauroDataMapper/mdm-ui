/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { ControlContainer, FormControl, FormGroup, NgForm, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { WizardStep } from '@mdm/wizards/wizards.model';
import { DataModelMainComponent } from '../data-model-main/data-model-main.component';
import { takeUntil } from 'rxjs/operators';
import { DataModelType } from '@maurodatamapper/mdm-resources';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ContentEditorComponent } from '@mdm/content/content-editor/content-editor.component';
import { NgIf, NgFor } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';

@Component({
    selector: 'mdm-data-model-step1',
    templateUrl: './data-model-step1.component.html',
    styleUrls: ['./data-model-step1.component.sass'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, ElementLinkComponent, MatTooltip, MatFormField, MatLabel, MatInput, NgIf, MatError, ContentEditorComponent, MatSelect, NgFor, MatOption, ElementClassificationsComponent]
})
export class DataModelStep1Component implements OnInit, OnDestroy {
  allDataModelTypes: any;
  step: WizardStep<DataModelMainComponent>;
  setupForm = new FormGroup({
    label: new FormControl('', Validators.required),
    author: new FormControl(''),
    organisation: new FormControl(''),
    description: new FormControl(''),
    dataModelType: new FormControl<DataModelType>(null, Validators.required),
    classifiers: new FormControl([])
  });

  private unsubscribe$ = new Subject<void>();

  constructor(
    private helpDialogueHandler: HelpDialogueHandlerService,
    private resources: MdmResourcesService
  ) {}

  get label() {
    return this.setupForm.controls.label;
  }

  get author() {
    return this.setupForm.controls.author;
  }

  get organisation() {
    return this.setupForm.controls.organisation;
  }

  get description() {
    return this.setupForm.controls.description;
  }

  get dataModelType() {
    return this.setupForm.controls.dataModelType;
  }

  get classifiers() {
    return this.setupForm.controls.classifiers;
  }

  set classifiersValue(value: any[]) {
    this.classifiers.setValue(value);
  }

  ngOnInit() {
    this.setupForm.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.step.invalid = this.setupForm.invalid;
      });

    this.resources.dataModel
      .types()
      .toPromise()
      .then((dataTypes) => {
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
