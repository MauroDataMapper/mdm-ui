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
import { CatalogueItemDomainType, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { cold } from 'jest-marbles';
import { Observable } from 'rxjs';
import { MauroItemUpdateService } from './mauro-item-update.service';
import {
  MauroIdentifier,
  MauroItem,
  MauroItemResponse
} from './mauro-item.types';

describe('MauroItemUpdateService', () => {
  let service: MauroItemUpdateService;

  const resourcesStub = {
    dataModel: {
      update: jest.fn() as jest.MockedFunction<
        (id: Uuid, data: MauroItem) => Observable<MauroItemResponse>
      >
    },
    dataClass: {
      update: jest.fn() as jest.MockedFunction<
        (
          modelId: Uuid,
          id: Uuid,
          data: MauroItem
        ) => Observable<MauroItemResponse>
      >,
      updateChildDataClass: jest.fn() as jest.MockedFunction<
        (
          modelId: Uuid,
          dataClassId: Uuid,
          id: Uuid,
          data: MauroItem
        ) => Observable<MauroItemResponse>
      >
    },
    dataElement: {
      update: jest.fn() as jest.MockedFunction<
        (
          modelId: Uuid,
          dataClassId: Uuid,
          id: Uuid,
          data: MauroItem
        ) => Observable<MauroItemResponse>
      >
    },
    dataType: {
      update: jest.fn() as jest.MockedFunction<
        (
          modelId: Uuid,
          id: Uuid,
          data: MauroItem
        ) => Observable<MauroItemResponse>
      >
    },
    terminology: {
      update: jest.fn() as jest.MockedFunction<
        (id: Uuid, data: MauroItem) => Observable<MauroItemResponse>
      >
    },
    term: {
      update: jest.fn() as jest.MockedFunction<
        (
          modelId: Uuid,
          id: Uuid,
          data: MauroItem
        ) => Observable<MauroItemResponse>
      >
    },
    codeSet: {
      update: jest.fn() as jest.MockedFunction<
        (id: Uuid, data: MauroItem) => Observable<MauroItemResponse>
      >
    },
    folder: {
      update: jest.fn() as jest.MockedFunction<
        (id: Uuid, data: MauroItem) => Observable<MauroItemResponse>
      >
    },
    versionedFolder: {
      update: jest.fn() as jest.MockedFunction<
        (id: Uuid, data: MauroItem) => Observable<MauroItemResponse>
      >
    },
    classifier: {
      update: jest.fn() as jest.MockedFunction<
        (id: Uuid, data: MauroItem) => Observable<MauroItemResponse>
      >
    },
    referenceDataModel: {
      update: jest.fn() as jest.MockedFunction<
        (id: Uuid, data: MauroItem) => Observable<MauroItemResponse>
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
      | 'referenceDataModel'
  ) => {
    resourcesStub[resource].update.mockImplementationOnce((id, data) => {
      expect(id).toBe(identifier.id);
      expect(data).toStrictEqual(returnItem);
      return cold('--a|', { a: { body: returnItem } });
    });
  };

  const mockModelItemRequest = (
    identifier: MauroIdentifier,
    returnItem: MauroItem,
    resource: 'dataClass' | 'dataType' | 'term'
  ) => {
    resourcesStub[resource].update.mockImplementationOnce(
      (modelId, id, data) => {
        expect(modelId).toBe(identifier.model);
        expect(id).toBe(identifier.id);
        expect(data).toStrictEqual(returnItem);
        return cold('--a|', { a: { body: returnItem } });
      }
    );
  };

  beforeEach(() => {
    service = setupTestModuleForService(MauroItemUpdateService, {
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

  const testSingleItemIsSaved = (
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
    const actual$ = service.save(identifier, item);
    expect(actual$).toBeObservable(expected$);
  };

  const testMultipleItemsAreSaved = (
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

    const payloads = identifiers.map((identifier) => {
      const item = constructMauroItemFromIdentifier(identifier);
      setupMockRequest(identifier, item);
      return { identifier, item };
    });

    const expected$ = cold('---(a|)', { a: payloads.map((p) => p.item) });
    const actual$ = service.saveMany(payloads);
    expect(actual$).toBeObservable(expected$);
  };

  const testMissingModelIdThrowsError = (identifier: MauroIdentifier) => {
    const expected$ = cold('#', null, new Error(identifier.domainType.toString() + ' ' + identifier.id + ' has not provided a model'));
    const actual$ = service.save(identifier, {} as MauroItem);
    expect(actual$).toBeObservable(expected$);
  };

  const testMissingDataClassIdThrowsError = (identifier: MauroIdentifier) => {
    const expected$ = cold('#', null, new Error(`${identifier.domainType.toString()} ${identifier.id} has not provided a data class`));
    const actual$ = service.save(identifier, {} as MauroItem);
    expect(actual$).toBeObservable(expected$);
  };

  describe('unsupported domain types', () => {
    const unsupported = [
      // CatalogueItemDomainType.ReferenceDataModel,
      CatalogueItemDomainType.ReferenceDataModelType
    ];

    it.each(unsupported)(
      'should throw an error for the domain type %p',
      (domainType) => {
        const expected$ = cold('#', null, new Error(`${domainType.toString()} 123 has not provided a model`));
        const actual$ = service.save(
          { id: '123', domainType },
          {} as MauroItem
        );
        expect(actual$).toBeObservable(expected$);
      }
    );
  });

  describe('save data models', () => {
    it('should save a single item', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.DataModel
        },
        (id, item) => mockModelRequest(id, item, 'dataModel')
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(CatalogueItemDomainType.DataModel, (id, item) =>
        mockModelRequest(id, item, 'dataModel')
      );
    });
  });

  describe('save data classes', () => {
    const mockDataClassChildRequest = (
      identifier: MauroIdentifier,
      returnItem: MauroItem
    ) => {
      resourcesStub.dataClass.updateChildDataClass.mockImplementationOnce(
        (modelId, dataClassId, id, data) => {
          expect(modelId).toBe(identifier.model);
          expect(dataClassId).toBe(identifier.parentDataClass);
          expect(id).toBe(identifier.id);
          expect(data).toStrictEqual(returnItem);
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

    it('should save a single parent data class', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.DataClass,
          model: '456'
        },
        (id, item) => mockModelItemRequest(id, item, 'dataClass')
      );
    });

    it('should save a single child data class', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.DataClass,
          model: '456',
          parentDataClass: '789'
        },
        mockDataClassChildRequest
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(
        CatalogueItemDomainType.DataClass,
        mockDataClassChildRequest
      );
    });
  });

  describe('save data elements', () => {
    const mockDataElementRequest = (
      identifier: MauroIdentifier,
      returnItem: MauroItem
    ) => {
      resourcesStub.dataElement.update.mockImplementationOnce(
        (modelId, dataClassId, id, data) => {
          expect(modelId).toBe(identifier.model);
          expect(dataClassId).toBe(identifier.dataClass);
          expect(id).toBe(identifier.id);
          expect(data).toStrictEqual(returnItem);
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

    it('should save a single item', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.DataElement,
          model: '456',
          dataClass: '789'
        },
        mockDataElementRequest
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(
        CatalogueItemDomainType.DataElement,
        mockDataElementRequest
      );
    });
  });

  describe('save data types', () => {
    it('should fail if not given a model', () => {
      testMissingModelIdThrowsError({
        id: '123',
        domainType: CatalogueItemDomainType.ModelDataType
      });
    });

    it('should save a single item', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.ModelDataType,
          model: '456'
        },
        (id, item) => mockModelItemRequest(id, item, 'dataType')
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(
        CatalogueItemDomainType.ModelDataType,
        (id, item) => mockModelItemRequest(id, item, 'dataType')
      );
    });
  });

  describe('save terminologies', () => {
    it('should save a single item', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.Terminology
        },
        (id, item) => mockModelRequest(id, item, 'terminology')
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(
        CatalogueItemDomainType.Terminology,
        (id, item) => mockModelRequest(id, item, 'terminology')
      );
    });
  });

  describe('save terms', () => {
    it('should fail if not given a model', () => {
      testMissingModelIdThrowsError({
        id: '123',
        domainType: CatalogueItemDomainType.Term
      });
    });

    it('should save a single item', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.Term,
          model: '456'
        },
        (id, item) => mockModelItemRequest(id, item, 'term')
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(CatalogueItemDomainType.Term, (id, item) =>
        mockModelItemRequest(id, item, 'term')
      );
    });
  });

  describe('save code sets', () => {
    it('should save a single item', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.CodeSet
        },
        (id, item) => mockModelRequest(id, item, 'codeSet')
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(CatalogueItemDomainType.CodeSet, (id, item) =>
        mockModelRequest(id, item, 'codeSet')
      );
    });
  });

  describe('save folders', () => {
    it('should save a single item', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.Folder
        },
        (id, item) => mockModelRequest(id, item, 'folder')
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(CatalogueItemDomainType.Folder, (id, item) =>
        mockModelRequest(id, item, 'folder')
      );
    });
  });

  describe('save versioned folders', () => {
    it('should save a single item', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.VersionedFolder
        },
        (id, item) => mockModelRequest(id, item, 'versionedFolder')
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(
        CatalogueItemDomainType.VersionedFolder,
        (id, item) => mockModelRequest(id, item, 'versionedFolder')
      );
    });
  });

  describe('save classifiers', () => {
    it('should save a single item', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.Classifier
        },
        (id, item) => mockModelRequest(id, item, 'classifier')
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(
        CatalogueItemDomainType.Classifier,
        (id, item) => mockModelRequest(id, item, 'classifier')
      );
    });
  });

  describe('save reference data models', () => {
    it('should save a single item', () => {
      testSingleItemIsSaved(
        {
          id: '123',
          domainType: CatalogueItemDomainType.ReferenceDataModel
        },
        (id, item) => mockModelRequest(id, item, 'referenceDataModel')
      );
    });

    it('should save many items', () => {
      testMultipleItemsAreSaved(
        CatalogueItemDomainType.ReferenceDataModel,
        (id, item) => mockModelRequest(id, item, 'referenceDataModel')
      );
    });
  });
});
