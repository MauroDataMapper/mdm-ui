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

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OpenIdAuthorizationEndpointParametersPayload, OpenIdConnectProviderDetail, OpenIdConnectProviderUpdatePayload } from '@maurodatamapper/mdm-resources';
import { MdmValidators } from '@mdm/utility/mdm-validators';

export class OpenIdConnectProviderForm {
  group: FormGroup;

  /* eslint-disable @typescript-eslint/unbound-method */
  constructor(provider?: OpenIdConnectProviderDetail) {
    this.group = new FormGroup({
      label: new FormControl(provider?.label, [
        Validators.required
      ]),
      imageUrl: new FormControl(provider?.imageUrl, [
        MdmValidators.url
      ]),
      security: new FormGroup({
        clientId: new FormControl(provider?.clientId, [
          Validators.required
        ]),
        clientSecret: new FormControl(provider?.clientSecret, [
          Validators.required
        ])
      }),
      discovery: new FormGroup({
        standardProvider: new FormControl(provider?.standardProvider ?? true),
        discoveryDocumentUrl: new FormControl(provider?.discoveryDocumentUrl, [
          MdmValidators.requiredConditional(() => this.useStandardProvider),
          MdmValidators.url
        ]),
        issuer: new FormControl(provider?.discoveryDocument?.issuer, [
          MdmValidators.requiredConditional(() => !this.useStandardProvider),
          MdmValidators.url
        ]),
        authorizationEndpoint: new FormControl(provider?.discoveryDocument?.authorizationEndpoint, [
          MdmValidators.requiredConditional(() => !this.useStandardProvider),
          MdmValidators.url
        ]),
        tokenEndpoint: new FormControl(provider?.discoveryDocument?.tokenEndpoint, [
          MdmValidators.requiredConditional(() => !this.useStandardProvider),
          MdmValidators.url
        ]),
        userinfoEndpoint: new FormControl(provider?.discoveryDocument?.userinfoEndpoint, [
          MdmValidators.url
        ]),
        endSessionEndpoint: new FormControl(provider?.discoveryDocument?.endSessionEndpoint, [
          MdmValidators.url
        ]),
        jwksUri: new FormControl(provider?.discoveryDocument?.jwksUri, [
          MdmValidators.requiredConditional(() => !this.useStandardProvider),
          MdmValidators.url
        ]),
      }),
      authorizationEndpointParams: new FormGroup({
        scope: new FormControl(provider?.authorizationEndpointParameters?.scope ?? 'openid email profile'),
        responseType: new FormControl(provider?.authorizationEndpointParameters?.responseType ?? 'code'),
        responseMode: new FormControl(provider?.authorizationEndpointParameters?.responseMode),
        display: new FormControl(this.handleDropdownValue(provider?.authorizationEndpointParameters?.display)),
        prompt: new FormControl(this.handleDropdownValue(provider?.authorizationEndpointParameters?.prompt)),
        maxAge: new FormControl(provider?.authorizationEndpointParameters?.maxAge),
        uiLocales: new FormControl(provider?.authorizationEndpointParameters?.uiLocales),
        idTokenHint: new FormControl(provider?.authorizationEndpointParameters?.idTokenHint),
        loginHint: new FormControl(provider?.authorizationEndpointParameters?.loginHint),
        acrValues: new FormControl(provider?.authorizationEndpointParameters?.acrValues)
      })
    });

    // When the standardProvider field is changed, update the conditional validity of related
    // fields
    this.standardProvider.valueChanges.subscribe(() => {
      this.discoveryDocumentUrl.updateValueAndValidity();
      this.issuer.updateValueAndValidity();
      this.authorizationEndpoint.updateValueAndValidity();
      this.tokenEndpoint.updateValueAndValidity();
      this.jwksUri.updateValueAndValidity();
    });
  }
  /* eslint-enable @typescript-eslint/unbound-method */

  get label() {
    return this.group.get('label');
  }

  get imageUrl() {
    return this.group.get('imageUrl');
  }

  get clientId() {
    return this.group.get('security.clientId');
  }

  get clientSecret() {
    return this.group.get('security.clientSecret');
  }

  get standardProvider() {
    return this.group?.get('discovery.standardProvider');
  }

  get useStandardProvider(): boolean {
    return this.standardProvider?.value;
  }

  get discoveryDocumentUrl() {
    return this.group.get('discovery.discoveryDocumentUrl');
  }

  get issuer() {
    return this.group.get('discovery.issuer');
  }

  get authorizationEndpoint() {
    return this.group.get('discovery.authorizationEndpoint');
  }

  get tokenEndpoint() {
    return this.group.get('discovery.tokenEndpoint');
  }

  get userinfoEndpoint() {
    return this.group.get('discovery.userinfoEndpoint');
  }

  get endSessionEndpoint() {
    return this.group.get('discovery.endSessionEndpoint');
  }

  get jwksUri() {
    return this.group.get('discovery.jwksUri');
  }

  createPayload(): OpenIdConnectProviderUpdatePayload {
    if (this.useStandardProvider) {
      return {
        label: this.label.value,
        clientId: this.clientId.value,
        clientSecret: this.clientSecret.value,
        imageUrl: this.imageUrl.value,
        authorizationEndpointParameters: this.createAuthorizationEndpointParametersPayload(),
        standardProvider: true,
        discoveryDocumentUrl: this.discoveryDocumentUrl.value
      };
    }
    else {
      return {
        label: this.label.value,
        clientId: this.clientId.value,
        clientSecret: this.clientSecret.value,
        imageUrl: this.imageUrl.value,
        authorizationEndpointParameters: this.createAuthorizationEndpointParametersPayload(),
        standardProvider: false,
        discoveryDocument: {
          issuer: this.issuer.value,
          authorizationEndpoint: this.authorizationEndpoint.value,
          tokenEndpoint: this.tokenEndpoint.value,
          jwksUri: this.jwksUri.value,
          userinfoEndpoint: this.userinfoEndpoint.value,
          endSessionEndpoint: this.endSessionEndpoint.value
        }
      };
    }
  }

  private createAuthorizationEndpointParametersPayload(): OpenIdAuthorizationEndpointParametersPayload {
    return {
      scope: this.group.get('authorizationEndpointParams.scope').value ,
      responseType: this.group.get('authorizationEndpointParams.responseType').value,
      responseMode: this.group.get('authorizationEndpointParams.responseMode').value,
      display: this.group.get('authorizationEndpointParams.display').value === undefined ? null : this.group.get('authorizationEndpointParams.display').value,
      prompt: this.group.get('authorizationEndpointParams.prompt').value === undefined ? null : this.group.get('authorizationEndpointParams.prompt').value,
      maxAge: this.group.get('authorizationEndpointParams.maxAge').value,
      uiLocales: this.group.get('authorizationEndpointParams.uiLocales').value,
      idTokenHint: this.group.get('authorizationEndpointParams.idTokenHint').value,
      loginHint: this.group.get('authorizationEndpointParams.loginHint').value,
      acrValues: this.group.get('authorizationEndpointParams.acrValues').value
    };
  }

  private handleDropdownValue(value: string)
  {
     if(value !== undefined)
     {
       return value.toUpperCase();
     }
     return value;
    }
}