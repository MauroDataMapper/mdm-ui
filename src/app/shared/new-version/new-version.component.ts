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
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { CatalogueItem, Modelable, ForkModelPayload, CatalogueItemDomainType, MdmResponse, BranchModelPayload } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService, MessageHandlerService, ElementTypesService, CatalogueElementType } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'mdm-new-version',
  templateUrl: './new-version.component.html',
  styleUrls: ['./new-version.component.scss']
})
export class NewVersionComponent implements OnInit {
  catalogueItem: CatalogueItem & Modelable;
  domainType: CatalogueItemDomainType;
  domainElementType: CatalogueElementType;
  processing: boolean;
  setupForm: FormGroup;

  get type() {
    return this.setupForm.get('type');
  }

  get typeValue(): 'Fork' | 'Branch' | 'Version' | undefined {
    return this.type.value;
  }

  get label() {
    return this.setupForm.get('label');
  }

  get branchName() {
    return this.setupForm.get('branchName');
  }

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private elementTypes: ElementTypesService,
    private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle('New Version');

    this.domainType = this.uiRouterGlobals.params.domainType;

    if (!this.uiRouterGlobals.params.id || !this.domainType) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    const types = this.elementTypes.getBaseTypes();
    this.domainElementType = types[this.domainType];

    // Setup first key field in form first, remaining form fields depend on the type selected
    this.setupForm = new FormGroup({
      type: new FormControl('', Validators.required)  // eslint-disable-line @typescript-eslint/unbound-method
    });

    this.resources[this.domainElementType.resourceName]
      .get(this.uiRouterGlobals.params.id)
      .subscribe((response: MdmResponse<CatalogueItem & Modelable>) => {
        this.catalogueItem = response.body;
      });
  }

  typeChanged() {
    if (this.label) {
      this.setupForm.removeControl('label');
    }

    if (this.branchName) {
      this.setupForm.removeControl('branchName');
    }

    if (this.typeValue === 'Fork') {
      this.setupForm.addControl(
        'label',
        new FormControl(
          '',
          [
            Validators.required,  // eslint-disable-line @typescript-eslint/unbound-method
            this.forbiddenName(this.catalogueItem.label)
          ]));
    }

    if (this.typeValue === 'Branch') {
      this.setupForm.addControl(
        'branchName',
        new FormControl('', Validators.required));  // eslint-disable-line @typescript-eslint/unbound-method
    }
  }

  forbiddenName(disallow: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (disallow.trim().toLowerCase() === control.value.trim().toLowerCase()) {
        return {
          forbiddenName: { value: control.value }
        };
      }

      return null;
    };
  }

  create() {
    if (!this.setupForm.valid) {
      return;
    }

    this.processing = true;
    this.setupForm.disable();

    if (this.typeValue === 'Fork') {
      const resource: ForkModelPayload = {
        label: this.label.value,
        copyPermissions: false,
        copyDataFlows: false
      };

      const request = this.resources[this.domainElementType.resourceName]
        .newForkModel(this.catalogueItem.id, resource);

      this.handleCreateResponse(
        request,
        'New forked version created successfully.',
        'There was a problem creating the new forked version.');
    }
    else if (this.typeValue === 'Version') {
      const request = this.resources[this.domainElementType.resourceName]
        .newBranchModelVersion(this.catalogueItem.id, {});

      this.handleCreateResponse(
        request,
        'New version created successfully.',
        'There was a problem creating the new version.');
    }
    else if (this.typeValue === 'Branch') {
      const resource: BranchModelPayload = {
        branchName: this.branchName.value
      };

      const request = this.resources[this.domainElementType.resourceName]
         .newBranchModelVersion(this.catalogueItem.id, resource);

      this.handleCreateResponse(
        request,
        'New branch created successfully.',
        'There was a problem creating the new branch.');
    }
  }

  cancel() {
    this.stateHandler.Go(this.domainType, {
      id: this.catalogueItem.id
    });
  }

  private handleCreateResponse(
    request: Observable<MdmResponse<CatalogueItem>>,
    successMessage: string,
    errorMessage: string) {
    request
      .pipe(
        catchError(error => {
          this.messageHandler.showError(errorMessage, error);
          return EMPTY;
        }),
        finalize(() => {
          this.processing = false;
          this.setupForm.enable();
        })
      )
      .subscribe((response: MdmResponse<CatalogueItem>) => {
        this.messageHandler.showSuccess(successMessage);
        this.stateHandler.Go(
          this.domainType,
          { id: response.body.id },
          { reload: true }
        );
      });
  }
}
