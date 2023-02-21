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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import {
  MdmResponse,
  SubscribedCatalogue,
  SubscribedCatalogueAuthenticationTypeResponse,
  SubscribedCatalogueResponse,
  SubscribedCatalogueTypeResponse,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  MessageHandlerService,
  SharedService,
  StateHandlerService
} from '@mdm/services';

import { EditingService } from '@mdm/services/editing.service';
import { MdmValidators } from '@mdm/utility/mdm-validators';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'mdm-subscribed-catalogue',
  templateUrl: './subscribed-catalogue.component.html',
  styleUrls: ['./subscribed-catalogue.component.scss']
})
export class SubscribedCatalogueComponent implements OnInit {
  readonly noAuthAuthenticationType: string = 'No Authentication';
  readonly apiKeyAuthenticationType: string = 'API Key';
  readonly oAuthClientCredentialsAuthenticationType: string =
    'OAuth (Client Credentials)';
  readonly supportedAuthenticationTypes: string[] = [
    this.noAuthAuthenticationType,
    this.apiKeyAuthenticationType,
    this.oAuthClientCredentialsAuthenticationType
  ];

  catalogueId?: Uuid;
  connectionTypes: string[] = [];
  authenticationTypes: string[] = [];

  isCreating: boolean;

  /* eslint-disable @typescript-eslint/unbound-method */
  formGroup = new FormGroup({
    label: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    url: new FormControl('', [Validators.required]),
    connectionType: new FormControl('', [Validators.required]),
    authenticationType: new FormControl('', [Validators.required]),
    apiKey: new FormControl(
      '',
      MdmValidators.requiredConditional(() => this.useApiKeyAuthentication)
    ),
    refreshPeriod: new FormControl(0),
    tokenUrl: new FormControl('', [
      MdmValidators.requiredConditional(() => this.useOauthAuthentication),
      MdmValidators.url
    ]),
    clientId: new FormControl(
      '',
      MdmValidators.requiredConditional(() => this.useOauthAuthentication)
    ),
    clientSecret: new FormControl(
      '',
      MdmValidators.requiredConditional(() => this.useOauthAuthentication)
    )
  });
  /* eslint-enable @typescript-eslint/unbound-method */

  constructor(
    private resources: MdmResourcesService,
    private routerGobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private shared: SharedService,
    private messageHandler: MessageHandlerService,
    private title: Title,
    private editingService: EditingService
  ) {}

  get label() {
    return this.formGroup.controls.label;
  }

  get description() {
    return this.formGroup.controls.description;
  }

  get url() {
    return this.formGroup.controls.url;
  }

  get connectionType() {
    return this.formGroup.controls.connectionType;
  }

  get authenticationType() {
    return this.formGroup.controls.authenticationType;
  }

  get apiKey() {
    return this.formGroup.controls.apiKey;
  }

  get tokenUrl() {
    return this.formGroup.controls.tokenUrl;
  }

  get clientId() {
    return this.formGroup.controls.clientId;
  }

  get clientSecret() {
    return this.formGroup.controls.clientSecret;
  }

  get refreshPeriod() {
    return this.formGroup.controls.refreshPeriod;
  }

  get useApiKeyAuthentication() {
    // formGroup may not exist yet so use null conditionals
    return (
      this.formGroup?.controls?.authenticationType?.value ===
      this.apiKeyAuthenticationType
    );
  }

  get useOauthAuthentication() {
    // formGroup may not exist yet so use null conditionals
    return (
      this.formGroup?.controls?.authenticationType?.value ===
      this.oAuthClientCredentialsAuthenticationType
    );
  }

  ngOnInit(): void {
    if (!this.shared.features.useSubscribedCatalogues) {
      this.stateHandler.Go('alldatamodel');
      return;
    }

    this.editingService.start();
    this.catalogueId = this.routerGobals.params.id;

    const types$: SubscribedCatalogueTypeResponse = this.resources.subscribedCatalogues.types();
    const authenticationTypes$: SubscribedCatalogueAuthenticationTypeResponse = this.resources.subscribedCatalogues.authenticationTypes();

    forkJoin([types$, authenticationTypes$])
      .pipe(
        switchMap(
          ([typesResponse, authenticationTypesResponse]: MdmResponse<
            string[]
          >[]) => {
            this.connectionTypes = typesResponse.body;
            this.authenticationTypes = this.supportedAuthenticationTypes.filter(
              (authType) => authenticationTypesResponse.body.includes(authType)
            );

            if (this.catalogueId) {
              this.isCreating = false;
              this.title.setTitle('Subscribed Catalogue - Edit Subscription');

              return this.resources.admin
                .getSubscribedCatalogue(this.catalogueId)
                .pipe(
                  map(
                    (cataloguesResponse: SubscribedCatalogueResponse) =>
                      cataloguesResponse.body
                  )
                );
            }

            this.isCreating = true;
            this.title.setTitle('Subscribed Catalogue - Add Subscription');
            return of({
              label: '',
              url: ''
            });
          }
        ),
        catchError((error) => {
          this.messageHandler.showError(
            'Unable to get the subscribed catalogue.',
            error
          );
          this.navigateToParent();
          return EMPTY;
        })
      )
      .subscribe((catalogue: SubscribedCatalogue) => {
        this.setFormValues(catalogue);
      });
  }

  save() {
    if (this.formGroup.invalid) {
      return;
    }

    const request: SubscribedCatalogue = {
      id: this.catalogueId,
      label: this.label.value,
      description: this.description.value,
      url: this.url.value,
      subscribedCatalogueType: this.connectionType.value,
      subscribedCatalogueAuthenticationType: this.authenticationType.value,
      refreshPeriod: this.refreshPeriod.value,
      ...(this.useApiKeyAuthentication && {
        apiKey: this.apiKey.value
      }),
      ...(this.useOauthAuthentication && {
        tokenUrl: this.tokenUrl.value,
        clientId: this.clientId.value,
        clientSecret: this.clientSecret.value
      })
    };

    const request$: Observable<SubscribedCatalogueResponse> = this.isCreating
      ? this.resources.admin.saveSubscribedCatalogues(request)
      : this.resources.admin.updateSubscribedCatalogue(
          this.catalogueId,
          request
        );

    request$
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            `There was a problem ${
              this.isCreating ? 'saving' : 'updating'
            } the subscribed catalogue.`,
            error
          );
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          `Subscribed catalogue ${
            this.isCreating ? 'saved' : 'updated'
          } successfully.`
        );
        this.navigateToParent();
      });
  }

  cancel() {
    this.editingService.confirmCancelAsync().subscribe((confirm) => {
      if (confirm) {
        this.navigateToParent();
      }
    });
  }

  private setFormValues(catalogue?: SubscribedCatalogue) {
    this.formGroup.patchValue({
      label: catalogue?.label,
      description: catalogue?.description,
      url: catalogue?.url,
      connectionType: catalogue?.subscribedCatalogueType,
      authenticationType: catalogue?.subscribedCatalogueAuthenticationType,
      refreshPeriod: catalogue?.refreshPeriod,
      apiKey: catalogue?.apiKey,
      tokenUrl: catalogue?.tokenUrl,
      clientId: catalogue?.clientId,
      clientSecret: catalogue?.clientSecret
    });
  }

  private navigateToParent() {
    this.editingService.stop();
    this.stateHandler.Go('appContainer.adminArea.subscribedCatalogues');
  }
}
