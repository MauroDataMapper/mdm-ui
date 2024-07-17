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
  Modelable,
  Navigatable,
  PathableDomainType
} from '@maurodatamapper/mdm-resources';
import { PathElement, PathElementType } from './path-name.model';
import { PathNameService } from './path-name.service';
import { UIRouter } from '@uirouter/core';
import { TestBed } from '@angular/core/testing';

describe('PathNameService', () => {
  let service: PathNameService;

  const routerStub = {
    stateService: {
      href: jest.fn()
    }
  };

  beforeEach(() => {
    // Setup the test bed manually instead of using setupTestModuleForService()
    // so that the UIRouterModule is not imported, will override the UIRouter service
    // so it can be mocked
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UIRouter,
          useValue: routerStub
        }
      ]
    });

    service = TestBed.inject(PathNameService);
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

  describe('get pathable domain types', () => {
    const testCases: [string, PathableDomainType][] = [
      ['fo:Development Folder|vf:Simple Versioned Folder$1.0.0', 'folders'],
      ['vf:Simple Versioned Folder$1.0.0', 'versionedFolders'],
      ['cl:NIHR Health Data Finder', 'classifiers'],
      ['dm:Simple Test DataModel$1.0.0', 'dataModels'],
      [
        'dm:Nautilus 835 Data Marts$main|dt:ADMIN_CATEGORY_SPELL_CD_NHS',
        'dataModels'
      ],
      [
        'dm:Model Version Tree DataModel$1.0.0|dc:V1 Modify Data Class',
        'dataModels'
      ],
      [
        'dm:Finalised Example Test DataModel$1.0.0|dc:Finalised Data Class|de:Another DataElement',
        'dataModels'
      ],
      ['te:Simple Test Terminology$2.0.0', 'terminologies'],
      ['te:Complex Test Terminology$main|tm:CTT1001', 'terminologies'],
      ['rdm:Simple Reference Data Model$1.0.0', 'referenceDataModels']
    ];

    it.each(testCases)(
      'should assume %p refers to domain %p',
      (path, domain) => {
        const actual = service.getPathableDomainFromPath(path);
        expect(actual).toBe(domain);
      }
    );
  });

  describe('create href', () => {
    beforeEach(() => {
      routerStub.stateService.href.mockClear();
      routerStub.stateService.href.mockImplementation((_, args) => {
        // Encode the path using RFC3986 URL specification
        const encodedPath = encodeURIComponent(args.path).replace(
          /['()*]/g,
          (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
        );

        return `http://localhost:4200/#/catalogue/item/${args.domain}/${encodedPath}`;
      });
    });

    const testCases = [
      [
        'dm:Simple Test DataModel$1.0.0',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3ASimple%20Test%20DataModel%241.0.0'
      ],
      [
        'dm:Model Version Tree DataModel$newBranch',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3AModel%20Version%20Tree%20DataModel%24newBranch'
      ],
      [
        'dm:Head and Neck Cancer Audit (HANA)$1.0.0',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3AHead%20and%20Neck%20Cancer%20Audit%20%28HANA%29%241.0.0'
      ],
      [
        'dm:Model Version Tree DataModel$3.0.0',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3AModel%20Version%20Tree%20DataModel%243.0.0'
      ],
      [
        'dm:Model Version Tree DataModel',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3AModel%20Version%20Tree%20DataModel'
      ],
      [
        'dm:Nautilus 835 Data Marts$main|dt:ADMIN_CATEGORY_SPELL_CD_NHS',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3ANautilus%20835%20Data%20Marts%24main%7Cdt%3AADMIN_CATEGORY_SPELL_CD_NHS'
      ],
      [
        'te:Simple Test Terminology$2.0.0',
        'http://localhost:4200/#/catalogue/item/terminologies/te%3ASimple%20Test%20Terminology%242.0.0'
      ],
      [
        'fo:Development Folder|vf:Simple Versioned Folder$1.0.0',
        'http://localhost:4200/#/catalogue/item/folders/fo%3ADevelopment%20Folder%7Cvf%3ASimple%20Versioned%20Folder%241.0.0'
      ],
      [
        'fo:Data sets',
        'http://localhost:4200/#/catalogue/item/folders/fo%3AData%20sets'
      ],
      [
        'fo:Mauro Data Explorer Requests|fo:admin[at]maurodatamapper.com',
        'http://localhost:4200/#/catalogue/item/folders/fo%3AMauro%20Data%20Explorer%20Requests%7Cfo%3Aadmin%5Bat%5Dmaurodatamapper.com'
      ],
      [
        'cl:NIHR Health Data Finder',
        'http://localhost:4200/#/catalogue/item/classifiers/cl%3ANIHR%20Health%20Data%20Finder'
      ],
      [
        'dm:test request 3$main|dc:Diagnosis|dc:Diagnosis (ARIA MedOnc)',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3Atest%20request%203%24main%7Cdc%3ADiagnosis%7Cdc%3ADiagnosis%20%28ARIA%20MedOnc%29'
      ],
      [
        'dm:Model Version Tree DataModel$1.0.0|dc:V1 Modify Data Class',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3AModel%20Version%20Tree%20DataModel%241.0.0%7Cdc%3AV1%20Modify%20Data%20Class'
      ],
      [
        'dm:Finalised Example Test DataModel$1.0.0|dc:Finalised Data Class|de:Another DataElement',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3AFinalised%20Example%20Test%20DataModel%241.0.0%7Cdc%3AFinalised%20Data%20Class%7Cde%3AAnother%20DataElement'
      ],
      [
        'dm:Nautilus 835 Data Marts$main|dc:Clinicals|dc:CLN_PROCEDURES|de:LATERALITY_CD',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3ANautilus%20835%20Data%20Marts%24main%7Cdc%3AClinicals%7Cdc%3ACLN_PROCEDURES%7Cde%3ALATERALITY_CD'
      ],
      [
        'dm:Complex Test DataModel$main|dt:child',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3AComplex%20Test%20DataModel%24main%7Cdt%3Achild'
      ],
      [
        'dm:Complex Test DataModel$main|dt:string',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3AComplex%20Test%20DataModel%24main%7Cdt%3Astring'
      ],
      [
        'dm:Nautilus 835 Data Marts$main|dt:ACUITY_LEVEL',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3ANautilus%20835%20Data%20Marts%24main%7Cdt%3AACUITY_LEVEL'
      ],
      [
        'dm:modules$main|dt:complex_term_example',
        'http://localhost:4200/#/catalogue/item/dataModels/dm%3Amodules%24main%7Cdt%3Acomplex_term_example'
      ],
      [
        'te:Simple Test Terminology$main',
        'http://localhost:4200/#/catalogue/item/terminologies/te%3ASimple%20Test%20Terminology%24main'
      ],
      [
        'te:Complex Test Terminology$main|tm:CTT1001',
        'http://localhost:4200/#/catalogue/item/terminologies/te%3AComplex%20Test%20Terminology%24main%7Ctm%3ACTT1001'
      ],
      [
        'te:Complex Test Terminology$main|tm:CTT41',
        'http://localhost:4200/#/catalogue/item/terminologies/te%3AComplex%20Test%20Terminology%24main%7Ctm%3ACTT41'
      ],
      [
        'cs:Simple Test CodeSet$1.0.0',
        'http://localhost:4200/#/catalogue/item/codeSets/cs%3ASimple%20Test%20CodeSet%241.0.0'
      ],
      [
        'rdm:Simple Reference Data Model$1.0.0',
        'http://localhost:4200/#/catalogue/item/referenceDataModels/rdm%3ASimple%20Reference%20Data%20Model%241.0.0'
      ],
      [
        'rdm:Simple Reference Data Model$test2',
        'http://localhost:4200/#/catalogue/item/referenceDataModels/rdm%3ASimple%20Reference%20Data%20Model%24test2'
      ]
    ];

    it.each(testCases)(
      'should turn %p into the URL %p',
      (path, expectedUrl) => {
        const actualUrl = service.createHref(path);
        expect(actualUrl).toBe(expectedUrl);
        expect(routerStub.stateService.href).toHaveBeenCalledWith(
          'appContainer.mainApp.twoSidePanel.catalogue.catalogueItem',
          expect.objectContaining({ path })
        );
      }
    );
  });

  describe('building paths', () => {
    it.each([undefined, null])(
      'should return nothing when no path elements are provided',
      (path) => {
        const actual = service.build(path as PathElement[]);
        expect(actual).toBeNull();
      }
    );

    it('should return nothing when empty path elements list is provided', () => {
      const actual = service.build([]);
      expect(actual).toBeNull();
    });

    const pathCases = [
      'dm:Test Data Model',
      'dm:Test Data Model$another-branch',
      'dm:Test Data Model$2.0.0',
      'te:Test Terminology',
      'cs:Test Code Set',
      'dm:Test Data Model|dc:Test Data Class',
      'dm:Test Data Model|dc:Test Data Class|de:Test Data Element',
      'dm:Test Data Model@description',
      'dm:Test Data Model$2.0.0@description',
      'dm:Test Data Model@rule:rule-representation',
      'dm:Test Data Model|dc:Test Data Class@description',
      'dm:Test Data Model$test-branch|dc:Test Data Class@description'
    ];

    it.each(pathCases)(
      'when building %p then the correct string is returned',
      (expected) => {
        const pathElements = service.parse(expected);
        const actual = service.build(pathElements);
        expect(actual).toBe(expected);
      }
    );
  });

  describe('get branch name', () => {
    it.each([
      ['', 'dm:Data Model'],
      ['main', 'dm:Data Model$main'],
      ['another-branch', 'dm:Data Model$another-branch'],
      ['main', 'dm:Data Model$main|dc:Data Class'],
      ['another-branch', 'dm:Data Model$another-branch|dc:Data Class'],
      ['main', 'te:Terminology$main'],
      ['another-branch', 'te:Terminology$another-branch'],
      ['main', 'te:Terminology$main|tm:Term'],
      ['another-branch', 'te:Terminology$another-branch|tm:Term']
    ])(
      'should return branch name %p when given the path %p',
      (branchName, path) => {
        const pathElements = service.parse(path);
        const actual = service.getVersionOrBranchName(pathElements);
        expect(actual).toBe(branchName);
      }
    );
  });
});
