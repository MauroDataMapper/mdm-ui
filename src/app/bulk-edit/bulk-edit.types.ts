/*
Copyright 2020-2024 University of Oxford and NHS England

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
  CatalogueItemDomainType,
  Profile,
  ProfileProvider,
  ProfileSummary
} from '@maurodatamapper/mdm-resources';
import {
  MauroIdentifier,
  MauroItem,
  NavigatableProfile
} from '@mdm/mauro/mauro-item.types';

export enum BulkEditStep {
  Selection,
  Editor
}

export class BulkEditContext {
  rootItem: MauroIdentifier;
  childDomainType?: CatalogueItemDomainType;
  childItems: MauroItem[];
  profiles: ProfileSummary[];
}

export interface BulkEditProfileContext {
  displayName: string;
  profileProvider: ProfileProvider;
  identifiers: MauroIdentifier[];
  editedProfiles: Profile[];
}

export interface BulkEditDataRow {
  label: string;
  profile: NavigatableProfile;
  [key: string]: any;
}
