/*
Copyright 2020-2022 University of Oxford
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
import { Injectable } from '@angular/core';
import {
  CatalogueItem,
  isModelDomainType,
  ProfileContextCollection,
  ProfileContextIndexPayload,
  ProfileContextPayload,
  ProfileSummary
} from '@maurodatamapper/mdm-resources';
import { MauroProfileProviderService } from '@mdm/mauro/profiles/mauro-profile-provider.service';
import { forkJoin, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Service to handle all profile related operations for bulk editing models.
 */
@Injectable({
  providedIn: 'root'
})
export class BulkEditProfileService {
  constructor(private mauroProfiles: MauroProfileProviderService) {}

  /**
   * List all available profiles that apply to a catalogue item - both used and unused.
   *
   * @param item A catalogue item, including domain type, to identify profiles available.
   * @returns An observable of an array of {@link ProfileSummary} objects.
   */
  listAvailableProfiles(item: CatalogueItem): Observable<ProfileSummary[]> {
    return forkJoin([
      this.mauroProfiles.usedProfiles(item),
      this.mauroProfiles.unusedProfiles(item)
    ]).pipe(map(([used, unused]) => [...used, ...unused]));
  }

  /**
   * Get all profile objects for a set of child catalogue items under a given root item.
   *
   * @param rootItem The root model to locate the child items. This must be a model.
   * @param payload The payload containing the list of child catalogue items to get profiles for, and the profile providers
   * to map to the child items.
   * @returns An observable containing the collection of profile objects for each child item.
   */
  getMany(
    rootItem: CatalogueItem,
    payload: ProfileContextIndexPayload
  ): Observable<ProfileContextCollection> {
    if (!isModelDomainType(rootItem.domainType)) {
      return throwError(
        new Error(`${rootItem.domainType} is not a model domain type`)
      );
    }

    return this.mauroProfiles.getMany(rootItem, payload);
  }

  /**
   * Save all profile objects for a set of child catalogue items under a given root item.
   *
   * @param rootItem The root model to locate the child items. This must be a model.
   * @param payload The payload containing the list of profile objects to save. Each profile provided must be mapped to a child
   * item of the root model.
   * @returns An observable containing the collection of profile objects for each child item.
   */
  saveMany(
    rootItem: CatalogueItem,
    payload: ProfileContextPayload
  ): Observable<ProfileContextCollection> {
    if (!isModelDomainType(rootItem.domainType)) {
      return throwError(
        new Error(`${rootItem.domainType} is not a model domain type`)
      );
    }

    return this.mauroProfiles.saveMany(rootItem, payload);
  }

  /**
   * Validate all profile objects for a set of child catalogue items under a given root item.
   *
   * @param rootItem The root model to locate the child items. This must be a model.
   * @param payload The payload containing the list of profile objects to validate. Each profile provided must be mapped to a child
   * item of the root model.
   * @returns An observable containing the collection of profile objects for each child item. Each profile may contain validation
   * errors to review.
   */
  validateMany(
    rootItem: CatalogueItem,
    payload: ProfileContextPayload
  ): Observable<ProfileContextCollection> {
    if (!isModelDomainType(rootItem.domainType)) {
      return throwError(
        new Error(`${rootItem.domainType} is not a model domain type`)
      );
    }

    return this.mauroProfiles.validateMany(rootItem, payload);
  }
}
