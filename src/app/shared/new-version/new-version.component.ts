/*
Copyright 2020-2023 University of Oxford
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
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import {
  CatalogueItem,
  Modelable,
  ForkModelPayload,
  CatalogueItemDomainType,
  MdmResponse,
  BranchModelPayload,
  ModelDomain,
  ModelDomainDetail,
  Uuid,
  VersionModelPayload,
  ModelDomainDetailResponse,
  AsyncJobResponse
} from '@maurodatamapper/mdm-resources';
import {
  isResponseAccepted,
  MdmResourcesService
} from '@mdm/modules/resources';
import {
  StateHandlerService,
  MessageHandlerService,
  ElementTypesService,
  CatalogueElementType
} from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

interface NewVersionAction {
  name: string;
  value: 'Fork' | 'Branch' | 'Version';
  selectedName: string;
  icon: string;
  getDescription(
    domainType: CatalogueItemDomainType,
    item: CatalogueItem & Modelable
  ): string;
}

@Component({
  selector: 'mdm-new-version',
  templateUrl: './new-version.component.html',
  styleUrls: ['./new-version.component.scss']
})
export class NewVersionComponent implements OnInit {
  catalogueItem: CatalogueItem & Modelable;
  domainType: CatalogueItemDomainType;
  domainElementType: CatalogueElementType;
  domainName: ModelDomain;
  processing: boolean;
  setupForm: FormGroup;

  availableActions: NewVersionAction[] = [
    {
      name: 'New Fork',
      value: 'Fork',
      selectedName: 'Creating a new fork',
      icon: 'fa-list',
      getDescription: (domainType, item) => {
        return `This will create a copy of <b>${
          item.label
        }</b> with a new name, and a new 'main' branch.
          Use this option if you are planning on taking this ${
            domainType === CatalogueItemDomainType.VersionedFolder
              ? 'folder'
              : 'model'
          } in a new direction, or under a new authority.`;
      }
    },
    {
      name: 'New Version',
      value: 'Version',
      selectedName: 'Creating a new version',
      icon: 'fa-file-alt',
      getDescription: (domainType, item) => {
        return `This will create a draft copy of <b>${
          item.label
        }</b> under the 'main' branch.
          Use this option if you want to create the next iteration of this ${
            domainType === CatalogueItemDomainType.VersionedFolder
              ? 'folder'
              : 'model'
          }.`;
      }
    },
    {
      name: 'New Branch',
      value: 'Branch',
      selectedName: 'Creating a new branch',
      icon: 'fa-code-branch',
      getDescription: (_, item) => {
        return `This will create a copy of <b>${item.label}</b> in a new branch. You may choose the name of the new branch.
          Use this option if you want to make some changes that you subsequently wish to merge back into 'main'.`;
      }
    }
  ];

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private elementTypes: ElementTypesService,
    private title: Title
  ) {}

  get action() {
    return this.setupForm.get('action');
  }

  get actionValue(): 'Fork' | 'Branch' | 'Version' | undefined {
    return this.action.value;
  }

  get actionSelectedName() {
    return this.availableActions.find((a) => a.value === this.actionValue)
      ?.selectedName;
  }

  get label() {
    return this.setupForm.get('label');
  }

  get branchName() {
    return this.setupForm.get('branchName');
  }

  get asynchronous() {
    return this.setupForm.get('asynchronous');
  }

  ngOnInit(): void {
    this.title.setTitle('New Version');

    this.domainType = this.uiRouterGlobals.params.domainType;

    if (!this.uiRouterGlobals.params.id || !this.domainType) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.domainElementType = this.elementTypes.getBaseTypeByName(
      this.domainType
    );
    this.domainName = this.domainElementType.domainName as ModelDomain;
    if (!this.domainName) {
      throw new Error(`Cannot find domain name for type ${this.domainType}`);
    }

    // Setup first key field in form first, remaining form fields depend on the type selected
    this.setupForm = new FormGroup({
      action: new FormControl('', Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
      asynchronous: new FormControl(false)
    });

    this.resources[this.domainElementType.resourceName]
      .get(this.uiRouterGlobals.params.id)
      .subscribe((response: MdmResponse<CatalogueItem & Modelable>) => {
        this.catalogueItem = response.body;
      });
  }

  actionChanged() {
    if (this.label) {
      this.setupForm.removeControl('label');
    }

    if (this.branchName) {
      this.setupForm.removeControl('branchName');
    }

    if (this.actionValue === 'Fork') {
      this.setupForm.addControl(
        'label',
        new FormControl('', [
          Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
          this.forbiddenName(this.catalogueItem.label)
        ])
      );
    }

    if (this.actionValue === 'Branch') {
      this.setupForm.addControl(
        'branchName',
        new FormControl('', Validators.required) // eslint-disable-line @typescript-eslint/unbound-method
      );
    }
  }

  forbiddenName(disallow: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (
        disallow.trim().toLowerCase() === control.value.trim().toLowerCase()
      ) {
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

    if (this.actionValue === 'Fork') {
      const payload: ForkModelPayload = {
        label: this.label.value,
        copyPermissions: false,
        copyDataFlows: false,
        asynchronous: this.asynchronous.value
      };

      const request: Observable<
        ModelDomainDetailResponse | AsyncJobResponse
      > = this.resources
        .getForkableResource(this.domainName)
        .newForkModel(this.catalogueItem.id, payload);

      this.handleCreateResponse(
        request,
        'New forked version created successfully.',
        'There was a problem creating the new forked version.',
        'A new background task to create the new fork has started. You can continue working whilst it is being created.'
      );
    } else if (this.actionValue === 'Version') {
      const payload: VersionModelPayload = {
        asynchronous: this.asynchronous.value
      };

      const request: Observable<
        ModelDomainDetailResponse | AsyncJobResponse
      > = this.resources
        .getBranchableResource(this.domainName)
        .newBranchModelVersion(this.catalogueItem.id, payload);

      this.handleCreateResponse(
        request,
        'New version created successfully.',
        'There was a problem creating the new version.',
        'A new background task to create the new version has started. You can continue working whilst it is being created.'
      );
    } else if (this.actionValue === 'Branch') {
      const payload: BranchModelPayload = {
        branchName: this.branchName.value,
        asynchronous: this.asynchronous.value
      };

      const request: Observable<
        ModelDomainDetailResponse | AsyncJobResponse
      > = this.resources
        .getBranchableResource(this.domainName)
        .newBranchModelVersion(this.catalogueItem.id, payload);

      this.handleCreateResponse(
        request,
        'New branch created successfully.',
        'There was a problem creating the new branch.',
        'A new background task to create the new branch has started. You can continue working whilst it is being created.'
      );
    }
  }

  cancel() {
    this.stateHandler.Go(this.domainType, {
      id: this.catalogueItem.id
    });
  }

  private handleCreateResponse(
    request: Observable<ModelDomainDetailResponse | AsyncJobResponse>,
    successMessage: string,
    errorMessage: string,
    asyncMessage: string
  ) {
    request
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(errorMessage, error);
          return EMPTY;
        }),
        finalize(() => {
          this.processing = false;
          this.setupForm.enable();
        })
      )
      .subscribe((response: ModelDomainDetailResponse | AsyncJobResponse) => {
        let modelId: Uuid;

        if (isResponseAccepted(response)) {
          // Async job started, return to original catalogue item
          modelId = this.catalogueItem.id;
          this.messageHandler.showInfo(asyncMessage);
        } else {
          const nextModel = response.body as ModelDomainDetail;
          modelId = nextModel.id;
          this.messageHandler.showSuccess(successMessage);
        }

        this.stateHandler.Go(
          this.domainType,
          { id: modelId },
          { reload: true }
        );
      });
  }
}
