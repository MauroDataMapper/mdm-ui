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
import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '@env/environment';
import { ApiProperty, ApiPropertyIndexResponse } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { EMPTY, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { BroadcastService } from './broadcast.service';
import { MessageHandlerService } from './utility/message-handler.service';

@Injectable({
  providedIn: 'root'
})
export class FeaturesService implements OnDestroy {
  useSubscribedCatalogues: boolean;
  useVersionedFolders: boolean;
  useMergeUiV2: boolean;
  useOpenIdConnect: boolean;
  useDigitalObjectIdentifiers: boolean;

  private unsubscribe$ = new Subject();

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private broadcast: BroadcastService) {
    this.setFeatures([]);
    this.loadFromServer();

    this.broadcast
      .onApiProperyUpdated()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.loadFromServer());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadFromServer() {
    this.resources.apiProperties
      .listPublic()
      .pipe(
        catchError(errors => {
          this.messageHandler.showError('There was a problem getting the configuration properties for features.', errors);
          return EMPTY;
        })
      )
      .subscribe((response: ApiPropertyIndexResponse) => {
        const featureFlags = response.body.items.filter(prop => prop.category === 'Features');
        this.setFeatures(featureFlags);
      });
  }

  private setFeatures(properties: ApiProperty[]) {
    this.useSubscribedCatalogues = this.getBooleanValue(
      properties,
      'feature.use_subscribed_catalogues',
      environment.features.useSubscribedCatalogues);

    this.useVersionedFolders = this.getBooleanValue(
      properties,
      'feature.use_versioned_folders',
      environment.features.useVersionedFolders);

    this.useMergeUiV2 = this.getBooleanValue(
      properties,
      'feature.use_merge_diff_ui',
      environment.features.useMergeUiV2);

    this.useOpenIdConnect = this.getBooleanValue(
      properties,
      'feature.use_open_id_connect',
      environment.features.useOpenIdConnect);

    this.useDigitalObjectIdentifiers = this.getBooleanValue(
      properties,
      'feature.use_digital_object_identifiers',
      environment.features.useDigitalObjectIdentifiers);
  }

  private getBooleanValue(properties: ApiProperty[], key: string, defaultValue: boolean): boolean {
    const feature = properties.find(prop => prop.key === key);
    return feature ? feature.value === 'true' : defaultValue;
  }
}
