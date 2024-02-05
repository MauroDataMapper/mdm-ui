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
  MdmResponse,
  ProfileDefinition,
  ProfileDefinitionResponse,
  ProfileField,
  ProfileSummary,
  ProfileSummaryResponse
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { cold } from 'jest-marbles';
import { Observable } from 'rxjs';

import { CatalogueSearchService } from './catalogue-search.service';

describe('CatalogueSearchService', () => {
  let service: CatalogueSearchService;

  const resourcesStub = {
    profile: {
      provider: jest.fn() as jest.MockedFunction<
        (
          namespace: string,
          name: string,
          version?: string
        ) => Observable<ProfileSummaryResponse>
      >,
      definition: jest.fn() as jest.MockedFunction<
        (
          namespace: string,
          name: string
        ) => Observable<ProfileDefinitionResponse>
      >
    }
  };

  beforeEach(() => {
    service = setupTestModuleForService(CatalogueSearchService, {
      providers: [
        {
          provide: MdmResourcesService,
          useValue: resourcesStub
        }
      ]
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('map profile fields', () => {
    const namespace1 = 'test.namespace.1';
    const namespace2 = 'test.namespace.2';

    const profile1 = 'TestProfile1';
    const profile2 = 'TestProfile2';

    const version1 = '1.0.0';
    const version2 = '2.0.0';

    const key1 = 'key1';
    const key2 = 'key2';

    const value1 = 'value1';
    const value2 = 'value2';

    const buildProfileSummary = (
      namespace: string,
      name: string,
      version: string
    ): ProfileSummary => {
      return {
        name,
        namespace,
        version
      } as ProfileSummary;
    };

    const buildProfileField = (key: string): ProfileField => {
      return {
        metadataPropertyName: key
      } as ProfileField;
    };

    const buildProfileDefinition = (
      fields: ProfileField[]
    ): ProfileDefinition => {
      return {
        sections: [
          {
            name: 'section1',
            fields
          }
        ]
      };
    };

    const buildResponse = <T>(value: T): MdmResponse<T> => {
      return {
        body: value
      };
    };

    const provider1 = buildProfileSummary(namespace1, profile1, version1);
    const provider2 = buildProfileSummary(namespace2, profile2, version2);
    const definition = buildProfileDefinition([
      buildProfileField(key1),
      buildProfileField(key2)
    ]);

    beforeEach(() => {
      // Provider mock response
      resourcesStub.profile.provider.mockImplementation((ns, n, v) => {
        const response = buildResponse(
          ns === namespace2 && n === profile2 && v === version2
            ? provider2
            : provider1
        );
        return cold('a|', {
          a: response
        });
      });

      // Definition mock response
      resourcesStub.profile.definition.mockImplementation(() =>
        cold('a|', {
          a: buildResponse(definition)
        })
      );
    });

    it('should return empty list when no DTO is provided', () => {
      const expected$ = cold('(a|)', { a: [] });
      const actual$ = service.mapProfileFilters(null);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return a single namespace and single field', () => {
      const dto = {
        [`${namespace1}|${profile1}|${version1}`]: {
          [key1]: value1
        }
      };

      const expected$ = cold('-(a|)', {
        a: [
          {
            provider: provider1,
            key: definition.sections[0].fields[0],
            value: value1
          }
        ]
      });

      const actual$ = service.mapProfileFilters(dto);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return a single namespace and multiple fields', () => {
      const dto = {
        [`${namespace1}|${profile1}|${version1}`]: {
          [key1]: value1,
          [key2]: value2
        }
      };

      const expected$ = cold('-(a|)', {
        a: [
          {
            provider: provider1,
            key: definition.sections[0].fields[0],
            value: value1
          },
          {
            provider: provider1,
            key: definition.sections[0].fields[1],
            value: value2
          }
        ]
      });

      const actual$ = service.mapProfileFilters(dto);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return multiple namespaces and multiple fields', () => {
      const dto = {
        [`${namespace1}|${profile1}|${version1}`]: {
          [key1]: value1,
          [key2]: value2
        },
        [`${namespace2}|${profile2}|${version2}`]: {
          [key1]: value1,
          [key2]: value2
        }
      };

      const expected$ = cold('-(a|)', {
        a: [
          {
            provider: provider1,
            key: definition.sections[0].fields[0],
            value: value1
          },
          {
            provider: provider1,
            key: definition.sections[0].fields[1],
            value: value2
          },
          {
            provider: provider2,
            key: definition.sections[0].fields[0],
            value: value1
          },
          {
            provider: provider2,
            key: definition.sections[0].fields[1],
            value: value2
          }
        ]
      });

      const actual$ = service.mapProfileFilters(dto);
      expect(actual$).toBeObservable(expected$);
    });
  });
});
