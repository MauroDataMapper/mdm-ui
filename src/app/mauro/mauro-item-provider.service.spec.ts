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
  CatalogueItemDomainType,
  PathQueryParameters,
  PathableDomainType,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { cold } from 'jest-marbles';
import { Observable } from 'rxjs';
import { MauroItemProviderService } from './mauro-item-provider.service';
import {
  MauroIdentifier,
  MauroItem,
  MauroItemResponse
} from './mauro-item.types';

describe('MauroItemProviderService', () => {
  let service: MauroItemProviderService;

  const resourcesStub = {
    dataModel: {
      get: jest.fn() as jest.MockedFunction<
        (id: Uuid) => Observable<MauroItemResponse>
      >
    },
    dataClass: {
      get: jest.fn() as jest.MockedFunction<
        (modelId: Uuid, id: Uuid) => Observable<MauroItemResponse>
      >,
      getChildDataClass: jest.fn() as jest.MockedFunction<
        (
          modelId: Uuid,
          dataClassId: Uuid,
          id: Uuid
        ) => Observable<MauroItemResponse>
      >
    },
    dataElement: {
      get: jest.fn() as jest.MockedFunction<
        (
          modelId: Uuid,
          dataClassId: Uuid,
          id: Uuid
        ) => Observable<MauroItemResponse>
      >
    },
    dataType: {
      get: jest.fn() as jest.MockedFunction<
        (modelId: Uuid, id: Uuid) => Observable<MauroItemResponse>
      >
    },
    terminology: {
      get: jest.fn() as jest.MockedFunction<
        (id: Uuid) => Observable<MauroItemResponse>
      >
    },
    term: {
      get: jest.fn() as jest.MockedFunction<
        (modelId: Uuid, id: Uuid) => Observable<MauroItemResponse>
      >
    },
    codeSet: {
      get: jest.fn() as jest.MockedFunction<
        (id: Uuid) => Observable<MauroItemResponse>
      >
    },
    folder: {
      get: jest.fn() as jest.MockedFunction<
        (id: Uuid) => Observable<MauroItemResponse>
      >
    },
    versionedFolder: {
      get: jest.fn() as jest.MockedFunction<
        (id: Uuid) => Observable<MauroItemResponse>
      >
    },
    classifier: {
      get: jest.fn() as jest.MockedFunction<
        (id: Uuid) => Observable<MauroItemResponse>
      >
    },
    catalogueItem: {
      getPath: jest.fn() as jest.MockedFunction<
        (
          domainType: PathableDomainType,
          path: string,
          query?: PathQueryParameters
        ) => Observable<MauroItemResponse>
      >,
      getPathFromParent: jest.fn() as jest.MockedFunction<
        (
          domainType: PathableDomainType,
          id: Uuid,
          path: string,
          query?: PathQueryParameters
        ) => Observable<MauroItemResponse>
      >
    }
  };

  const constructMauroItemFromIdentifier = (
    identifier: MauroIdentifier
  ): MauroItem => {
    return {
      ...identifier,
      label: identifier.domainType,
      description: 'This is a description'
    };
  };

  const mockModelRequest = (
    identifier: MauroIdentifier,
    returnItem: MauroItem,
    resource:
      | 'dataModel'
      | 'terminology'
      | 'codeSet'
      | 'folder'
      | 'versionedFolder'
      | 'classifier'
  ) => {
    resourcesStub[resource].get.mockImplementationOnce((id) => {
      expect(id).toBe(identifier.id);
      return cold('--a|', { a: { body: returnItem } });
    });
  };

  const mockModelItemRequest = (
    identifier: MauroIdentifier,
    returnItem: MauroItem,
    resource: 'dataClass' | 'dataType' | 'term'
  ) => {
    resourcesStub[resource].get.mockImplementationOnce((modelId, id) => {
      expect(modelId).toBe(identifier.model);
      expect(id).toBe(identifier.id);
      return cold('--a|', { a: { body: returnItem } });
    });
  };

  beforeEach(() => {
    service = setupTestModuleForService(MauroItemProviderService, {
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

  const testSingleItemIsReturned = (
    identifier: MauroIdentifier,
    setupMockRequest: (
      identifier: MauroIdentifier,
      returnItem: MauroItem
    ) => void
  ) => {
    const item = constructMauroItemFromIdentifier(identifier);
    setupMockRequest(identifier, item);

    const expected$ = cold('--a|', {
      a: item
    });
    const actual$ = service.get(identifier);
    expect(actual$).toBeObservable(expected$);
  };

  const testMultipleItemsAreReturned = (
    domainType: CatalogueItemDomainType,
    setupMockRequest: (
      identifier: MauroIdentifier,
      returnItem: MauroItem
    ) => void
  ) => {
    const identifiers: MauroIdentifier[] = [...Array(10).keys()].map((id) => {
      return {
        id: id.toString(),
        domainType,
        model: '123', // Only required for model items
        dataClass: '456', // Only required for Data Elements
        parentDataClass: '789' // Only required for child Data Classes
      };
    });

    const items = identifiers.map((id) => {
      const item = constructMauroItemFromIdentifier(id);
      setupMockRequest(id, item);
      return item;
    });

    const expected$ = cold('---(a|)', { a: items });
    const actual$ = service.getMany(identifiers);
    expect(actual$).toBeObservable(expected$);
  };

  const testMissingModelIdThrowsError = (identifier: MauroIdentifier) => {
    const expected$ = cold('#', null, new Error());
    const actual$ = service.get(identifier);
    expect(actual$).toBeObservable(expected$);
  };

  const testMissingDataClassIdThrowsError = (identifier: MauroIdentifier) => {
    const expected$ = cold('#', null, new Error());
    const actual$ = service.get(identifier);
    expect(actual$).toBeObservable(expected$);
  };

  describe('unsupported domain types', () => {
    const unsupported = [
      CatalogueItemDomainType.ReferenceDataModel,
      CatalogueItemDomainType.ReferenceDataModelType
    ];

    it.each(unsupported)(
      'should throw an error for the domain type %p',
      (domainType) => {
        const expected$ = cold('#', null, new Error());
        const actual$ = service.get({ id: '123', domainType });
        expect(actual$).toBeObservable(expected$);
      }
    );
  });

  describe('get data models', () => {
    it('should return a single item', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.DataModel
        },
        (id, item) => mockModelRequest(id, item, 'dataModel')
      );
    });

    it('should return many items', () => {
      testMultipleItemsAreReturned(
        CatalogueItemDomainType.DataModel,
        (id, item) => mockModelRequest(id, item, 'dataModel')
      );
    });
  });

  describe('get data classes', () => {
    const mockDataClassChildRequest = (
      identifier: MauroIdentifier,
      returnItem: MauroItem
    ) => {
      resourcesStub.dataClass.getChildDataClass.mockImplementationOnce(
        (modelId, dataClassId, id) => {
          expect(modelId).toBe(identifier.model);
          expect(dataClassId).toBe(identifier.parentDataClass);
          expect(id).toBe(identifier.id);
          return cold('--a|', { a: { body: returnItem } });
        }
      );
    };

    it('should fail if not given a model', () => {
      testMissingModelIdThrowsError({
        id: '123',
        domainType: CatalogueItemDomainType.DataClass
      });
    });

    it('should return a single parent data class', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.DataClass,
          model: '456'
        },
        (id, item) => mockModelItemRequest(id, item, 'dataClass')
      );
    });

    it('should return a single child data class', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.DataClass,
          model: '456',
          parentDataClass: '789'
        },
        mockDataClassChildRequest
      );
    });

    it('should return many items', () => {
      testMultipleItemsAreReturned(
        CatalogueItemDomainType.DataClass,
        mockDataClassChildRequest
      );
    });
  });

  describe('get data elements', () => {
    const mockDataElementRequest = (
      identifier: MauroIdentifier,
      returnItem: MauroItem
    ) => {
      resourcesStub.dataElement.get.mockImplementationOnce(
        (modelId, dataClassId, id) => {
          expect(modelId).toBe(identifier.model);
          expect(dataClassId).toBe(identifier.dataClass);
          expect(id).toBe(identifier.id);
          return cold('--a|', { a: { body: returnItem } });
        }
      );
    };

    it('should fail if not given a model', () => {
      testMissingModelIdThrowsError({
        id: '123',
        domainType: CatalogueItemDomainType.DataElement
      });
    });

    it('should fail if not given a data class', () => {
      testMissingDataClassIdThrowsError({
        id: '123',
        domainType: CatalogueItemDomainType.DataElement,
        model: '456'
      });
    });

    it('should return a single item', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.DataElement,
          model: '456',
          dataClass: '789'
        },
        mockDataElementRequest
      );
    });

    it('should return many items', () => {
      testMultipleItemsAreReturned(
        CatalogueItemDomainType.DataElement,
        mockDataElementRequest
      );
    });
  });

  describe('get data types', () => {
    it('should fail if not given a model', () => {
      testMissingModelIdThrowsError({
        id: '123',
        domainType: CatalogueItemDomainType.ModelDataType
      });
    });

    it('should return a single data type', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.ModelDataType,
          model: '456'
        },
        (id, item) => mockModelItemRequest(id, item, 'dataType')
      );
    });

    it('should return many items', () => {
      testMultipleItemsAreReturned(
        CatalogueItemDomainType.ModelDataType,
        (id, item) => mockModelItemRequest(id, item, 'dataType')
      );
    });
  });

  describe('get terminologies', () => {
    it('should return a single item', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.Terminology
        },
        (id, item) => mockModelRequest(id, item, 'terminology')
      );
    });

    it('should return many items', () => {
      testMultipleItemsAreReturned(
        CatalogueItemDomainType.Terminology,
        (id, item) => mockModelRequest(id, item, 'terminology')
      );
    });
  });

  describe('get terms', () => {
    it('should fail if not given a model', () => {
      testMissingModelIdThrowsError({
        id: '123',
        domainType: CatalogueItemDomainType.Term
      });
    });

    it('should return a single item', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.Term,
          model: '456'
        },
        (id, item) => mockModelItemRequest(id, item, 'term')
      );
    });

    it('should return many items', () => {
      testMultipleItemsAreReturned(CatalogueItemDomainType.Term, (id, item) =>
        mockModelItemRequest(id, item, 'term')
      );
    });
  });

  describe('get code sets', () => {
    it('should return a single item', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.CodeSet
        },
        (id, item) => mockModelRequest(id, item, 'codeSet')
      );
    });

    it('should return many items', () => {
      testMultipleItemsAreReturned(
        CatalogueItemDomainType.CodeSet,
        (id, item) => mockModelRequest(id, item, 'codeSet')
      );
    });
  });

  describe('get folders', () => {
    it('should return a single item', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.Folder
        },
        (id, item) => mockModelRequest(id, item, 'folder')
      );
    });

    it('should return many items', () => {
      testMultipleItemsAreReturned(CatalogueItemDomainType.Folder, (id, item) =>
        mockModelRequest(id, item, 'folder')
      );
    });
  });

  describe('get versioned folders', () => {
    it('should return a single item', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.VersionedFolder
        },
        (id, item) => mockModelRequest(id, item, 'versionedFolder')
      );
    });

    it('should return many items', () => {
      testMultipleItemsAreReturned(
        CatalogueItemDomainType.VersionedFolder,
        (id, item) => mockModelRequest(id, item, 'versionedFolder')
      );
    });
  });

  describe('get classifiers', () => {
    it('should return a single item', () => {
      testSingleItemIsReturned(
        {
          id: '123',
          domainType: CatalogueItemDomainType.Classifier
        },
        (id, item) => mockModelRequest(id, item, 'classifier')
      );
    });

    it('should return many items', () => {
      testMultipleItemsAreReturned(
        CatalogueItemDomainType.Classifier,
        (id, item) => mockModelRequest(id, item, 'classifier')
      );
    });
  });

  describe('locate by path', () => {
    const testCases: [PathableDomainType, string][] = [
      ['dataModels', 'dm:Simple Test DataModel$1.0.0'],
      ['dataModels', 'dm:Model Version Tree DataModel$newBranch'],
      ['dataModels', 'dm:Head and Neck Cancer Audit (HANA)$1.0.0'],
      ['dataModels', 'dm:Model Version Tree DataModel$3.0.0'],
      ['dataModels', 'dm:Model Version Tree DataModel'],
      [
        'dataModels',
        'dm:Nautilus 835 Data Marts$main|dt:ADMIN_CATEGORY_SPELL_CD_NHS'
      ],
      ['terminologies', 'te:Simple Test Terminology$2.0.0'],
      ['folders', 'fo:Development Folder|vf:Simple Versioned Folder$1.0.0'],
      ['folders', 'fo:Data sets'],
      [
        'folders',
        'fo:Mauro Data Explorer Requests|fo:admin[at]maurodatamapper.com'
      ],
      ['classifiers', 'cl:NIHR Health Data Finder'],
      [
        'dataModels',
        'dm:test request 3$main|dc:Diagnosis|dc:Diagnosis (ARIA MedOnc)'
      ],
      [
        'dataModels',
        'dm:Model Version Tree DataModel$1.0.0|dc:V1 Modify Data Class'
      ],
      [
        'dataModels',
        'dm:Finalised Example Test DataModel$1.0.0|dc:Finalised Data Class|de:Another DataElement'
      ],
      [
        'dataModels',
        'dm:Nautilus 835 Data Marts$main|dc:Clinicals|dc:CLN_PROCEDURES|de:LATERALITY_CD'
      ],
      ['dataModels', 'dm:Complex Test DataModel$main|dt:child'],
      ['dataModels', 'dm:Complex Test DataModel$main|dt:string'],
      ['dataModels', 'dm:Nautilus 835 Data Marts$main|dt:ACUITY_LEVEL'],
      ['dataModels', 'dm:modules$main|dt:complex_term_example'],
      ['terminologies', 'te:Simple Test Terminology$main'],
      ['terminologies', 'te:Complex Test Terminology$main|tm:CTT1001'],
      ['terminologies', 'te:Complex Test Terminology$main|tm:CTT41'],
      ['codeSets', 'cs:Simple Test CodeSet$1.0.0'],
      ['referenceDataModels', 'rdm:Simple Reference Data Model$1.0.0'],
      ['referenceDataModels', 'rdm:Simple Reference Data Model$test2']
    ];

    // Mock Mauro item to return to mocked path endpoints - contents does not matter
    const mockMauroItem: MauroItem = {
      id: '1234',
      domainType: CatalogueItemDomainType.DataModel,
      label: 'test item'
    };

    beforeEach(() => {
      resourcesStub.catalogueItem.getPath.mockClear();
      resourcesStub.catalogueItem.getPathFromParent.mockClear();

      resourcesStub.catalogueItem.getPath.mockReturnValue(
        cold('--a|', { a: { body: mockMauroItem } })
      );

      resourcesStub.catalogueItem.getPathFromParent.mockReturnValue(
        cold('--a|', { a: { body: mockMauroItem } })
      );
    });

    it.each(testCases)(
      'should locate specifically under domain %p with path %p',
      (domain, path) => {
        const expected$ = cold('--a|', { a: mockMauroItem });
        const actual$ = service.locate(path, { domain });
        expect(actual$).toBeObservable(expected$);

        expect(resourcesStub.catalogueItem.getPath).toHaveBeenCalledWith(
          domain,
          path,
          {}
        );

        expect(
          resourcesStub.catalogueItem.getPathFromParent
        ).not.toHaveBeenCalled();
      }
    );

    it.each(testCases)(
      'should locate assuming domain is %p with path %p',
      (domain, path) => {
        const expected$ = cold('--a|', { a: mockMauroItem });
        const actual$ = service.locate(path);
        expect(actual$).toBeObservable(expected$);

        expect(resourcesStub.catalogueItem.getPath).toHaveBeenCalledWith(
          domain,
          path,
          {}
        );

        expect(
          resourcesStub.catalogueItem.getPathFromParent
        ).not.toHaveBeenCalled();
      }
    );

    it.each(testCases)(
      'should locate finalised items under domain %p with path %p',
      (domain, path) => {
        const expected$ = cold('--a|', { a: mockMauroItem });
        const actual$ = service.locate(path, { domain, finalisedOnly: true });
        expect(actual$).toBeObservable(expected$);

        expect(resourcesStub.catalogueItem.getPath).toHaveBeenCalledWith(
          domain,
          path,
          { finalised: true }
        );

        expect(
          resourcesStub.catalogueItem.getPathFromParent
        ).not.toHaveBeenCalled();
      }
    );

    it.each(testCases)(
      'should locate specifically under domain %p and parent item with path %p',
      (domain, path) => {
        const parentId = '5678';
        const expected$ = cold('--a|', { a: mockMauroItem });
        const actual$ = service.locate(path, { domain, parentId });
        expect(actual$).toBeObservable(expected$);

        expect(
          resourcesStub.catalogueItem.getPathFromParent
        ).toHaveBeenCalledWith(domain, parentId, path, {});

        expect(resourcesStub.catalogueItem.getPath).not.toHaveBeenCalled();
      }
    );
  });
});
