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
import { CatalogueItemDomainType, Uuid } from '@maurodatamapper/mdm-resources';
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
});
