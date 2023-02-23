/*
Copyright 2020-2023 University of Oxford and NHS England

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
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CatalogueItemDomainType,
  Profile,
  ProfileContextIndexPayload,
  ProfileContextIndexResponse,
  ProfileContextPayload,
  ProfileProvider,
  ProfileSummary,
  ProfileSummaryIndexResponse
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  MauroIdentifier,
  MauroItem,
  MauroProfileUpdatePayload,
  MauroProfileValidationResult,
  NavigatableProfile
} from '../mauro-item.types';
import { ProfileProviderService } from './profile-provider-service';

/**
 * Profile provider service that manages profiles directly via Mauro.
 */
@Injectable({
  providedIn: 'root'
})
export class MauroProfileProviderService implements ProfileProviderService {
  constructor(private resources: MdmResourcesService) {}

  usedProfiles(item: MauroItem): Observable<ProfileSummary[]> {
    return this.resources.profile
      .usedProfiles(item.domainType, item.id)
      .pipe(map((response: ProfileSummaryIndexResponse) => response.body));
  }

  unusedProfiles(item: MauroItem): Observable<ProfileSummary[]> {
    return this.resources.profile
      .unusedProfiles(item.domainType, item.id)
      .pipe(map((response: ProfileSummaryIndexResponse) => response.body));
  }

  getMany(
    rootItem: MauroItem,
    identifiers: MauroIdentifier[],
    provider: ProfileProvider
  ): Observable<NavigatableProfile[]> {
    const payload: ProfileContextIndexPayload = {
      multiFacetAwareItems: identifiers.map((identifier) => {
        return {
          multiFacetAwareItemDomainType: identifier.domainType,
          multiFacetAwareItemId: identifier.id
        };
      }),
      profileProviderServices: [provider]
    };

    const actualRootItem = this.useCorrectRootItem(rootItem);

    return this.resources.profile
      .getMany(actualRootItem.domainType, actualRootItem.id, payload)
      .pipe(
        map((response: ProfileContextIndexResponse) =>
          response.body.profilesProvided.map((provided) => {
            return {
              ...provided.profile,
              breadcrumbs: provided.multiFacetAwareItem?.breadcrumbs
            };
          })
        )
      );
  }

  saveMany(
    rootItem: MauroItem,
    provider: ProfileProvider,
    payloads: MauroProfileUpdatePayload[]
  ): Observable<Profile[]> {
    const payload: ProfileContextPayload = {
      profilesProvided: payloads.map((pl) => {
        return {
          profile: pl.profile,
          profileProviderService: provider
        };
      })
    };

    const actualRootItem = this.useCorrectRootItem(rootItem);

    return this.resources.profile
      .saveMany(actualRootItem.domainType, actualRootItem.id, payload)
      .pipe(
        map((response: ProfileContextIndexResponse) =>
          response.body.profilesProvided.map((provided) => provided.profile)
        )
      );
  }

  validateMany(
    rootItem: MauroItem,
    provider: ProfileProvider,
    profiles: Profile[]
  ): Observable<MauroProfileValidationResult[]> {
    const payload: ProfileContextPayload = {
      profilesProvided: profiles.map((profile) => {
        return {
          profile,
          profileProviderService: provider
        };
      })
    };

    const actualRootItem = this.useCorrectRootItem(rootItem);

    return this.resources.profile
      .validateMany(actualRootItem.domainType, actualRootItem.id, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // The HttpErrorResponse will contain the validation errors. Wrap this in a ProfileContextIndexResponse
          // object so it can passed through to the rest of the observable pipe and still get processed
          return of({ body: error.error });
        }),
        map((response: ProfileContextIndexResponse) =>
          response.body.profilesProvided.map((provided) => {
            return {
              profile: provided.profile,
              errors: provided.errors?.errors
            };
          })
        )
      );
  }

  private useCorrectRootItem(rootItem: MauroItem) {
    // The profile "...Many" endpoints only work on model types, but Data Classes can be supported assuming that
    // the root item used is the parent Data Model
    return rootItem.domainType === CatalogueItemDomainType.DataClass
      ? {
          id: rootItem.model,
          domainType: CatalogueItemDomainType.DataModel,
          label: ''
        }
      : rootItem;
  }
}
