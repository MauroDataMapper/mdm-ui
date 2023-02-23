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
import {
  Profile,
  ProfileProvider,
  ProfileSummary
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import {
  MauroIdentifier,
  MauroItem,
  MauroProfileUpdatePayload,
  MauroProfileValidationResult,
  NavigatableProfile
} from '../mauro-item.types';

/**
 * Defines the functions that all profile provider services must implement.
 */
export interface ProfileProviderService {
  /**
   * Identify which profiles from this profile provider have been applied to a Mauro catalogue item.
   *
   * @param item The catalogue item to check.
   * @returns An array of {@link ProfileSummary} objects detailing the profiles applied to this item.
   */
  usedProfiles(item: MauroItem): Observable<ProfileSummary[]>;

  /**
   * Identify which profiles from this profile provider have _not_ been applied to a Mauro catalogue item.
   *
   * @param item The catalogue item to check.
   * @returns An array of {@link ProfileSummary} objects detailing the profiles _not_ applied to this item.
   */
  unusedProfiles(item: MauroItem): Observable<ProfileSummary[]>;

  /**
   * Get multiple profiles based on the given Mauro catalogue item identifiers and profile provider.
   *
   * @param rootItem The root catalogue item to base all further items under.
   * @param identifiers An array of {@link MauroIdentifier} objects containing identification information.
   * At least an ID and domain type is required, but some domain types based on hierarchy require further details.
   * @param provider The namespace/name of the profile provider to use.
   * @returns An array of {@link NavigatableProfile} objects which are mapped to the requested catalogue items in an
   * observable stream.
   */
  getMany(
    rootItem: MauroItem,
    identifiers: MauroIdentifier[],
    provider: ProfileProvider
  ): Observable<NavigatableProfile[]>;

  /**
   * Validates multiple profiles based on the given profile provider.
   *
   * @param rootItem The root catalogue item to base all further items under.
   * @param provider The namespace/name of the profile provider to use.
   * @param profiles The profiles to validate.
   * @returns An array of result objects containing the profiles and a possible list of errors found, via an observable stream.
   */
  validateMany(
    rootItem: MauroItem,
    provider: ProfileProvider,
    profiles: Profile[]
  ): Observable<MauroProfileValidationResult[]>;

  /**
   * Save multiple profiles based on the given profile provider and profile and identifers pairs.
   *
   * @param rootItem The root catalogue item to base all further items under.
   * @param provider The namespace/name of the profile provider to use.
   * @param payloads An array of profile/identifier pairs, containing the data to update.
   * @returns The same profile objects if saved successfully, via an observable stream.
   */
  saveMany(
    rootItem: MauroItem,
    provider: ProfileProvider,
    payloads: MauroProfileUpdatePayload[]
  ): Observable<Profile[]>;
}
