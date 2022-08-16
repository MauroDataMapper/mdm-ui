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
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { NavigatableProfile } from '@mdm/mauro/mauro-item.types';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { PathCellRendererComponent } from './path-cell-renderer.component';

describe('PathCellRendererComponent', () => {
  let harness: ComponentHarness<PathCellRendererComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(PathCellRendererComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should process a list of breadcrumbs correctly into a string', () => {
    const testProfile: NavigatableProfile = {
      id: 'testUUID',
      domainType: CatalogueItemDomainType.Folder,
      label: 'testNavigatableProfile',
      sections: [],
      breadcrumbs: [
        {
          id: '200cfadf-8d3c-4423-acdb-77ce9b4ca7fb',
          label: 'First',
          domainType: CatalogueItemDomainType.DataModel,
          finalised: false
        },
        {
          id: '0b6a126d-c1dd-4e4a-bf5f-4c2d46c37df1',
          label: 'Second',
          domainType: CatalogueItemDomainType.DataClass
        },
        {
          id: '13b5130e-7030-4560-b24b-38b9d4420989',
          label: 'Third',
          domainType: CatalogueItemDomainType.DataClass
        }
      ]
    };

    harness.component.profile = testProfile;
    expect(harness.component.getProfileBreadcrumbPath()).toEqual(
      'First > Second > Third'
    );
  });
});
