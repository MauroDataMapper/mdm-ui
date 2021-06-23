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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { OpenIdConnectProviderDetail, OpenIdConnectProvidersDetailResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, SharedService, StateHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { UIRouterGlobals } from '@uirouter/angular';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'mdm-openid-connect-provider',
  templateUrl: './openid-connect-provider.component.html',
  styleUrls: ['./openid-connect-provider.component.scss']
})
export class OpenidConnectProviderComponent implements OnInit {
  id: Uuid;
  editExisting = false;
  formGroup: FormGroup;
  previewImageUrl?: string;

  get label() {
    return this.formGroup.get('label');
  }

  get imageUrl() {
    return this.formGroup.get('imageUrl');
  }

  get clientId() {
    return this.formGroup.get('security.clientId');
  }

  get clientSecret() {
    return this.formGroup.get('security.clientSecret');
  }

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private editing: EditingService,
    private shared: SharedService,
    private title: Title) { }

  ngOnInit(): void {
    if (!this.shared.features.useOpenIdConnect) {
      this.stateHandler.Go('alldatamodel');
      return;
    }

    this.editing.start();

    this.id = this.uiRouterGlobals.params.id;
    this.editExisting = this.id !== undefined && this.id !== null;

    if (this.editExisting) {
      this.title.setTitle('OpenID Connect - Edit provider');
      this.loadExistingProvider();
    }
    else {
      this.title.setTitle('OpenID Connect - Add provider');
      this.createFormGroup();
    }
  }

  refreshImagePreview() {
    this.previewImageUrl = this.imageUrl.value;
  }

  cancel() {
    this.editing.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.navigateToParent();
      }
    });
  }

  save() {
    if (this.formGroup.invalid) {
      return;
    }
  }

  private createFormGroup(provider?: OpenIdConnectProviderDetail) {
    this.previewImageUrl = provider?.imageUrl;

    this.formGroup = new FormGroup({
      label: new FormControl(provider?.label, Validators.required),
      standardProvider: new FormControl(provider?.standardProvider, Validators.required),
      imageUrl: new FormControl(provider?.imageUrl),
      security: new FormGroup({
        clientId: new FormControl(provider?.clientId, Validators.required),
        clientSecret: new FormControl(provider?.clientSecret, Validators.required)
      })
    });
  }

  private loadExistingProvider() {
    this.resources.pluginOpenIdConnect
      .get(this.id)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem getting the OpenID Connect provider.', error);
          return EMPTY;
        })
      )
      .subscribe((response: OpenIdConnectProvidersDetailResponse) => {
        this.createFormGroup(response.body);
      })
  }

  private navigateToParent() {
    this.editing.stop();
    this.stateHandler.Go('appContainer.adminArea.openIdConnectProviders');
  }
}
