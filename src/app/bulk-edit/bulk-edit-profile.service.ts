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
  isModelDomainType,
  Profile,
  ProfileProvider,
  ProfileSummary
} from '@maurodatamapper/mdm-resources';
import {
  MauroIdentifier,
  MauroItem,
  MauroProfileUpdatePayload,
  MauroProfileValidationResult
} from '@mdm/mauro/mauro-item.types';
import {
  DefaultProfileProviderService,
  isDefaultProvider
} from '@mdm/mauro/profiles/default-profile-provider.service';
import { MauroProfileProviderService } from '@mdm/mauro/profiles/mauro-profile-provider.service';
import { ProfileProviderService } from '@mdm/mauro/profiles/profile-provider-service';
import { forkJoin, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Service to handle all profile related operations for bulk editing models.
 */
@Injectable({
  providedIn: 'root'
})
export class BulkEditProfileService {
  constructor(
    private mauroProfiles: MauroProfileProviderService,
    private defaultProfiles: DefaultProfileProviderService
  ) {}

  /**
   * List all available profiles that apply to a catalogue item - both used and unused.
   *
   * @param item A catalogue item, including domain type, to identify profiles available.
   * @returns An observable of an array of {@link ProfileSummary} objects.
   */
  listAvailableProfiles(item: MauroItem): Observable<ProfileSummary[]> {
    return forkJoin([
      this.listAvailableProfilesFromProvider(this.defaultProfiles, item),
      this.listAvailableProfilesFromProvider(this.mauroProfiles, item)
    ]).pipe(map(([defaults, mauro]) => [...defaults, ...mauro]));
  }

  /**
   * Get all profile objects for a set of child catalogue items under a given root item.
   *
   * @param rootItem The root model to locate the child items. This must be a model.
   * @param identifiers An array of {@link MauroIdentifier} objects containing identification information.
   * At least an ID and domain type is required, but some domain types based on hierarchy require further details.
   * @param provider The namespace/name of the profile provider to use.
   * @returns An observable containing the collection of profile objects for each child item.
   */
  getMany(
    rootItem: MauroItem,
    identifiers: MauroIdentifier[],
    provider: ProfileProvider
  ): Observable<Profile[]> {
    if (!isModelDomainType(rootItem.domainType)) {
      return throwError(
        new Error(`${rootItem.domainType} is not a model domain type`)
      );
    }

    return this.getProviderService(provider).getMany(
      rootItem,
      identifiers,
      provider
    );
  }

  /**
   * Save all profile objects for a set of child catalogue items under a given root item.
   *
   * @param rootItem The root catalogue item to base all further items under.
   * @param provider The namespace/name of the profile provider to use.
   * @param payloads An array of profile/identifier pairs, containing the data to update.
   * @returns An observable containing the collection of profile objects for each child item.
   */
  saveMany(
    rootItem: MauroItem,
    provider: ProfileProvider,
    payloads: MauroProfileUpdatePayload[]
  ): Observable<Profile[]> {
    if (!isModelDomainType(rootItem.domainType)) {
      return throwError(
        new Error(`${rootItem.domainType} is not a model domain type`)
      );
    }

    return this.getProviderService(provider).saveMany(
      rootItem,
      provider,
      payloads
    );
  }

  /**
   * Validate all profile objects for a set of child catalogue items under a given root item.
   *
   * @param rootItem The root model to locate the child items. This must be a model.
   * @param provider The namespace/name of the profile provider to use.
   * @param profiles The profiles to validate.
   * @returns An observable containing the collection of profile objects for each child item. Each profile may contain validation
   * errors to review.
   */
  validateMany(
    rootItem: MauroItem,
    provider: ProfileProvider,
    profiles: Profile[]
  ): Observable<MauroProfileValidationResult[]> {
    if (!isModelDomainType(rootItem.domainType)) {
      return throwError(
        new Error(`${rootItem.domainType} is not a model domain type`)
      );
    }

    return this.getProviderService(provider).validateMany(
      rootItem,
      provider,
      profiles
    );
  }

  private listAvailableProfilesFromProvider(
    provider: ProfileProviderService,
    item: MauroItem
  ) {
    return forkJoin([
      provider.usedProfiles(item),
      provider.unusedProfiles(item)
    ]).pipe(map(([used, unused]) => [...used, ...unused]));
  }

  private getProviderService(
    provider: ProfileProvider
  ): ProfileProviderService {
    return isDefaultProvider(provider)
      ? this.defaultProfiles
      : this.mauroProfiles;
  }
}
