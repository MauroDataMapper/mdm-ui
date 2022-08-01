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
import {
  CatalogueItemDomainType,
  Modelable,
  Navigatable
} from '@maurodatamapper/mdm-resources';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { PathElement, PathElementType } from './path-name.model';
import { PathNameService } from './path-name.service';

describe('PathNameService', () => {
  let service: PathNameService;

  beforeEach(() => {
    service = setupTestModuleForService(PathNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parsing path name', () => {
    it.each([undefined, null, ''])(
      'should return nothing when no path is provided',
      (path) => {
        const actual = service.parse(path);
        expect(actual).toBeNull();
      }
    );

    const pathCases: Array<[string, PathElement[]]> = [
      [
        'dm:Test Data Model',
        [
          {
            type: PathElementType.DataModel,
            typeName: 'Data model',
            label: 'Test Data Model'
          }
        ]
      ],
      [
        'dm:Test Data Model$another-branch',
        [
          {
            type: PathElementType.DataModel,
            typeName: 'Data model',
            version: 'another-branch',
            label: 'Test Data Model'
          }
        ]
      ],
      [
        'dm:Test Data Model$2.0.0',
        [
          {
            type: PathElementType.DataModel,
            typeName: 'Data model',
            version: '2.0.0',
            label: 'Test Data Model'
          }
        ]
      ],
      [
        'te:Test Terminology',
        [
          {
            type: PathElementType.Terminology,
            typeName: 'Terminology',
            label: 'Test Terminology'
          }
        ]
      ],
      [
        'cs:Test Code Set',
        [
          {
            type: PathElementType.CodeSet,
            typeName: 'Code set',
            label: 'Test Code Set'
          }
        ]
      ],
      [
        'dm:Test Data Model|dc:Test Data Class',
        [
          {
            type: PathElementType.DataModel,
            typeName: 'Data model',
            label: 'Test Data Model'
          },
          {
            type: PathElementType.DataClass,
            typeName: 'Data class',
            label: 'Test Data Class'
          }
        ]
      ],
      [
        'dm:Test Data Model|dc:Test Data Class|de:Test Data Element',
        [
          {
            type: PathElementType.DataModel,
            typeName: 'Data model',
            label: 'Test Data Model'
          },
          {
            type: PathElementType.DataClass,
            typeName: 'Data class',
            label: 'Test Data Class'
          },
          {
            type: PathElementType.DataElement,
            typeName: 'Data element',
            label: 'Test Data Element'
          }
        ]
      ],
      [
        'dm:Test Data Model@description',
        [
          {
            type: PathElementType.DataModel,
            typeName: 'Data model',
            label: 'Test Data Model',
            property: {
              name: 'description',
              qualifiedName: ['description']
            }
          }
        ]
      ],
      [
        'dm:Test Data Model$2.0.0@description',
        [
          {
            type: PathElementType.DataModel,
            typeName: 'Data model',
            label: 'Test Data Model',
            version: '2.0.0',
            property: {
              name: 'description',
              qualifiedName: ['description']
            }
          }
        ]
      ],
      [
        'dm:Test Data Model@rule:rule-representation',
        [
          {
            type: PathElementType.DataModel,
            typeName: 'Data model',
            label: 'Test Data Model',
            property: {
              name: 'rule-representation',
              qualifiedName: ['rule', 'rule-representation']
            }
          }
        ]
      ],
      [
        'dm:Test Data Model|dc:Test Data Class@description',
        [
          {
            type: PathElementType.DataModel,
            typeName: 'Data model',
            label: 'Test Data Model'
          },
          {
            type: PathElementType.DataClass,
            typeName: 'Data class',
            label: 'Test Data Class',
            property: {
              name: 'description',
              qualifiedName: ['description']
            }
          }
        ]
      ],
      [
        'dm:Test Data Model$test-branch|dc:Test Data Class@description',
        [
          {
            type: PathElementType.DataModel,
            typeName: 'Data model',
            label: 'Test Data Model',
            version: 'test-branch'
          },
          {
            type: PathElementType.DataClass,
            typeName: 'Data class',
            label: 'Test Data Class',
            property: {
              name: 'description',
              qualifiedName: ['description']
            }
          }
        ]
      ]
    ];

    it.each(pathCases)(
      'when parsing %p then the correct parsed output is returned',
      (path: string, expected: PathElement[]) => {
        const actual = service.parse(path);
        expect(actual).toMatchObject(expected);
      }
    );

    const badPathCases = [
      'dm',
      'dm:',
      ':label',
      'dm:label|dm',
      'dm:label|dm:',
      'dm:label|:label'
    ];

    it.each(badPathCases)(
      'when parsing %p then an error is thrown',
      (path: string) => {
        expect(() => {
          service.parse(path);
        }).toThrow();
      }
    );
  });

  describe('create from breadcrumbs', () => {
    it('should return nothing when no item is given', () => {
      const actual = service.createFromBreadcrumbs(null);
      expect(actual).toBeNull();
    });

    const testCases: [string, Modelable & Navigatable][] = [
      [
        'dm:data model',
        {
          domainType: CatalogueItemDomainType.DataModel,
          id: '1',
          label: 'data model',
          breadcrumbs: []
        }
      ],
      [
        'dm:data model|dc:data class',
        {
          domainType: CatalogueItemDomainType.DataClass,
          id: '1',
          label: 'data class',
          breadcrumbs: [
            {
              domainType: CatalogueItemDomainType.DataModel,
              id: '2',
              label: 'data model'
            }
          ]
        }
      ],
      [
        'dm:data model|dc:data class|dc:child class',
        {
          domainType: CatalogueItemDomainType.DataClass,
          id: '1',
          label: 'child class',
          breadcrumbs: [
            {
              domainType: CatalogueItemDomainType.DataModel,
              id: '2',
              label: 'data model'
            },
            {
              domainType: CatalogueItemDomainType.DataClass,
              id: '3',
              label: 'data class'
            }
          ]
        }
      ],
      [
        'dm:data model|dc:data class|de:data element',
        {
          domainType: CatalogueItemDomainType.DataElement,
          id: '1',
          label: 'data element',
          breadcrumbs: [
            {
              domainType: CatalogueItemDomainType.DataModel,
              id: '2',
              label: 'data model'
            },
            {
              domainType: CatalogueItemDomainType.DataClass,
              id: '3',
              label: 'data class'
            }
          ]
        }
      ],
      [
        'dm:data model|dc:data class|dc:child class|de:data element',
        {
          domainType: CatalogueItemDomainType.DataElement,
          id: '1',
          label: 'data element',
          breadcrumbs: [
            {
              domainType: CatalogueItemDomainType.DataModel,
              id: '2',
              label: 'data model'
            },
            {
              domainType: CatalogueItemDomainType.DataClass,
              id: '3',
              label: 'data class'
            },
            {
              domainType: CatalogueItemDomainType.DataClass,
              id: '4',
              label: 'child class'
            }
          ]
        }
      ],
      [
        'te:terminology',
        {
          domainType: CatalogueItemDomainType.Terminology,
          id: '1',
          label: 'terminology',
          breadcrumbs: []
        }
      ],
      [
        'te:terminology|tm:first term',
        {
          domainType: CatalogueItemDomainType.Term,
          id: '1',
          label: 'first term',
          breadcrumbs: [
            {
              domainType: CatalogueItemDomainType.Terminology,
              id: '2',
              label: 'terminology'
            }
          ]
        }
      ]
    ];

    it.each(testCases)('should return the path %p', (expectedPath, item) => {
      const actualPath = service.createFromBreadcrumbs(item);
      expect(actualPath).toBe(expectedPath);
    });
  });
});
