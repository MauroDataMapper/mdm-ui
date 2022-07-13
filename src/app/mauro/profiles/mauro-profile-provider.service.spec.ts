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
import { CatalogueItem, ProfileSummary } from '@maurodatamapper/mdm-resources';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { Observable } from 'rxjs';
import { MauroProfileProviderService } from './mauro-profile-provider.service';

export interface MauroProfileProviderServiceStub {
  usedProfiles: jest.MockedFunction<
    (item: CatalogueItem) => Observable<ProfileSummary[]>
  >;
  unusedProfiles: jest.MockedFunction<
    (item: CatalogueItem) => Observable<ProfileSummary[]>
  >;
  getMany: jest.Mock;
  saveMany: jest.Mock;
  validateMany: jest.Mock;
}

export const createMauroProfileProviderServiceStub = (): MauroProfileProviderServiceStub => {
  return {
    usedProfiles: jest.fn(),
    unusedProfiles: jest.fn(),
    getMany: jest.fn(),
    saveMany: jest.fn(),
    validateMany: jest.fn()
  };
};

describe('MauroProfileProviderService', () => {
  let service: MauroProfileProviderService;

  beforeEach(() => {
    service = setupTestModuleForService(MauroProfileProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
