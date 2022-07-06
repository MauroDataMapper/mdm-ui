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
  ProfileContextCollection,
  ProfileContextIndexPayload,
  ProfileContextIndexResponse,
  ProfileContextPayload,
  ProfileSummary,
  ProfileSummaryIndexResponse
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Profile provider service that manages profiles directly via Mauro.
 */
@Injectable({
  providedIn: 'root'
})
export class MauroProfileProviderService {
  constructor(private resources: MdmResourcesService) {}

  /**
   * Gets a list of profiles used on a particular catalogue item.
   *
   * @param item The catalogue item to check.
   * @returns An observable of an array of {@link ProfileSummary} objects.
   */
  usedProfiles(item: CatalogueItem): Observable<ProfileSummary[]> {
    return this.resources.profile
      .usedProfiles(item.domainType, item.id)
      .pipe(map((response: ProfileSummaryIndexResponse) => response.body));
  }

  /**
   * Gets a list of profiles not used on a particular catalogue item.
   *
   * @param item The catalogue item to check.
   * @returns An observable of an array of {@link ProfileSummary} objects.
   */
  unusedProfiles(item: CatalogueItem): Observable<ProfileSummary[]> {
    return this.resources.profile
      .unusedProfiles(item.domainType, item.id)
      .pipe(map((response: ProfileSummaryIndexResponse) => response.body));
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
    return this.resources.profile
      .getMany(rootItem.domainType, rootItem.id, payload)
      .pipe(map((response: ProfileContextIndexResponse) => response.body));
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
    return this.resources.profile
      .saveMany(rootItem.domainType, rootItem.id, payload)
      .pipe(map((response: ProfileContextIndexResponse) => response.body));
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
    return this.resources.profile
      .validateMany(rootItem.domainType, rootItem.id, payload)
      .pipe(map((response: ProfileContextIndexResponse) => response.body));
  }
}
