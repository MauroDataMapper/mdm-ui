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
  Profile,
  ProfileField,
  ProfileProvider,
  ProfileSummary
} from '@maurodatamapper/mdm-resources';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { cold } from 'jest-marbles';
import { Observable } from 'rxjs';
import { MauroItemProviderService } from '../mauro-item-provider.service';
import { MauroItemUpdateService } from '../mauro-item-update.service';
import {
  MauroIdentifier,
  MauroItem,
  MauroProfileUpdatePayload,
  MauroProfileValidationResult,
  MauroUpdatePayload
} from '../mauro-item.types';
import {
  defaultProfileProvider,
  DefaultProfileProviderService
} from './default-profile-provider.service';

describe('DefaultProfileProviderService', () => {
  let service: DefaultProfileProviderService;

  /**
   * Stub object representing the MauroItemProviderService
   */
  const itemProviderStub = {
    get: jest.fn() as jest.MockedFunction<
      (id: MauroIdentifier) => Observable<MauroItem>
    >,
    getMany: jest.fn() as jest.MockedFunction<
      (ids: MauroIdentifier[]) => Observable<MauroItem[]>
    >
  };

  /**
   * Stub object representing the MauroItemUpdaterService
   */
  const itemUpdaterStub = {
    save: jest.fn() as jest.MockedFunction<
      (id: MauroIdentifier, item: MauroItem) => Observable<MauroItem>
    >,
    saveMany: jest.fn() as jest.MockedFunction<
      (payloads: MauroUpdatePayload[]) => Observable<MauroItem[]>
    >
  };

  beforeEach(() => {
    service = setupTestModuleForService(DefaultProfileProviderService, {
      providers: [
        {
          provide: MauroItemProviderService,
          useValue: itemProviderStub
        },
        {
          provide: MauroItemUpdateService,
          useValue: itemUpdaterStub
        }
      ]
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Sample items to apply to it.each() tests. Maps a domain type and additional expected properties for
   * catalogue items of that domain type.
   *
   * Note: the `description` property is assumed to apply to all domain types.
   */
  const sampleItems: [CatalogueItemDomainType, any][] = [
    [
      CatalogueItemDomainType.DataModel,
      {
        author: 'tester',
        organisation: 'test org',
        aliases: 'alias1,alias2',
        classifications: 'test label'
      }
    ],
    [
      CatalogueItemDomainType.DataClass,
      {
        aliases: 'alias1,alias2',
        classifications: 'test label',
        minMultiplicity: 1,
        maxMultiplicity: 1
      }
    ],
    [
      CatalogueItemDomainType.DataElement,
      {
        aliases: 'alias1,alias2',
        classifications: 'test label',
        minMultiplicity: 1,
        maxMultiplicity: 1,
        dataType: {
          label: 'int'
        }
      }
    ],
    [
      CatalogueItemDomainType.ModelDataType,
      {
        aliases: 'alias1,alias2',
        classifications: 'test label'
      }
    ],
    [
      CatalogueItemDomainType.Terminology,
      {
        author: 'tester',
        organisation: 'test org',
        aliases: 'alias1,alias2',
        classifications: 'test label'
      }
    ],
    [
      CatalogueItemDomainType.Term,
      {
        aliases: 'alias1,alias2',
        classifications: 'test label',
        code: 'test code',
        definition: 'test definition',
        terminology: {
          label: 'test terminology'
        },
        url: 'http://test.org'
      }
    ],
    [
      CatalogueItemDomainType.CodeSet,
      {
        author: 'tester',
        organisation: 'test org',
        aliases: 'alias1,alias2',
        classifications: 'test label'
      }
    ],
    [CatalogueItemDomainType.Folder, {}],
    [CatalogueItemDomainType.VersionedFolder, {}],
    [CatalogueItemDomainType.Classifier, {}]
  ];

  /**
   * Create a profile that should look like what is expected from the test scenarios.
   *
   * @param item A Mauro item containing the expected properties
   *
   * The fields mapped to the expected profile will depend on the domain types and what the mocked
   * Mauro item properties should be.
   */
  const constructProfile = (item: MauroItem): Profile => {
    const fields: ProfileField[] = [];

    fields.push({
      fieldName: 'Description',
      metadataPropertyName: 'description',
      dataType: 'text',
      currentValue: item.description,
      minMultiplicity: 0,
      maxMultiplicity: 1
    });

    if (item.aliases) {
      fields.push({
        fieldName: 'Aliases',
        metadataPropertyName: 'aliases',
        dataType: 'string',
        currentValue: item.aliases,
        minMultiplicity: 0,
        maxMultiplicity: 1
      });
    }

    if (item.classifications) {
      fields.push({
        fieldName: 'Classifications',
        metadataPropertyName: 'classifications',
        dataType: 'string',
        currentValue: item.classifications,
        minMultiplicity: 0,
        maxMultiplicity: 1
      });
    }

    if (item.author) {
      fields.push({
        fieldName: 'Author',
        metadataPropertyName: 'author',
        dataType: 'string',
        currentValue: item.author,
        minMultiplicity: 0,
        maxMultiplicity: 1
      });
    }

    if (item.organisation) {
      fields.push({
        fieldName: 'Organisation',
        metadataPropertyName: 'organisation',
        dataType: 'string',
        currentValue: item.organisation,
        minMultiplicity: 0,
        maxMultiplicity: 1
      });
    }

    if (item.minMultiplicity && item.maxMultiplicity) {
      fields.push({
        fieldName: 'Multiplicity',
        metadataPropertyName: 'multiplicity',
        dataType: 'string',
        currentValue: `${item.minMultiplicity}..${item.maxMultiplicity}`,
        minMultiplicity: 0,
        maxMultiplicity: 1
      });
    }

    if (item.dataType) {
      fields.push({
        fieldName: 'Data Type',
        metadataPropertyName: 'dataType',
        dataType: 'model',
        currentValue: item.dataType,
        minMultiplicity: 0,
        maxMultiplicity: 1
      });
    }

    if (item.code) {
      fields.push({
        fieldName: 'Code',
        metadataPropertyName: 'code',
        dataType: 'string',
        currentValue: item.code,
        minMultiplicity: 0,
        maxMultiplicity: 1
      });
    }

    if (item.definition) {
      fields.push({
        fieldName: 'Definition',
        metadataPropertyName: 'definition',
        dataType: 'string',
        currentValue: item.definition,
        minMultiplicity: 0,
        maxMultiplicity: 1
      });
    }

    if (item.terminology) {
      fields.push({
        fieldName: 'Terminology',
        metadataPropertyName: 'terminology',
        dataType: 'model',
        currentValue: item.terminology,
        minMultiplicity: 0,
        maxMultiplicity: 1
      });
    }

    if (item.url) {
      fields.push({
        fieldName: 'URL',
        metadataPropertyName: 'url',
        dataType: 'string',
        currentValue: item.url,
        minMultiplicity: 0,
        maxMultiplicity: 1
      });
    }

    return {
      id: item.id,
      domainType: item.domainType,
      label: item.label,
      sections: [
        {
          name: 'Default',
          fields
        }
      ]
    };
  };

  const mockItemProviderGet = (
    identifier: MauroIdentifier,
    item: MauroItem
  ) => {
    itemProviderStub.get.mockImplementationOnce((id) => {
      expect(id).toStrictEqual(identifier);
      return cold('a|', { a: item });
    });
  };

  const mockItemProviderGetMany = (
    identifiers: MauroIdentifier[],
    items: MauroItem[]
  ) => {
    itemProviderStub.getMany.mockImplementationOnce((ids) => {
      expect(ids).toBe(identifiers);
      return cold('a|', { a: items });
    });
  };

  const mockItemUpdaterSave = (
    identifier: MauroIdentifier,
    item: MauroItem
  ) => {
    itemUpdaterStub.save.mockImplementationOnce((id, pl) => {
      expect(id).toStrictEqual(identifier);
      expect(pl).toStrictEqual(item);
      return cold('a|', { a: item });
    });
  };

  const mockItemUpdaterSaveMany = (
    payloads: MauroUpdatePayload[],
    items: MauroItem[]
  ) => {
    itemUpdaterStub.saveMany.mockImplementationOnce((pls) => {
      expect(pls).toStrictEqual(payloads);
      return cold('a|', { a: items });
    });
  };

  describe('only accept default profile requests', () => {
    const identifier: MauroIdentifier = {
      id: '123',
      domainType: CatalogueItemDomainType.DataModel
    };

    const badProvider: ProfileProvider = {
      name: 'SomethingElse',
      namespace: 'wrong.default.namespace'
    };

    const testExpectation = <R>(act: () => Observable<R>) => {
      const expected$ = cold('|');
      const actual$ = act();
      expect(actual$).toBeObservable(expected$);
    };

    it('should return nothing for get()', () =>
      testExpectation(() => service.get(identifier, badProvider)));

    it('should return nothing for getMany()', () => {
      testExpectation(() =>
        service.getMany(
          {
            id: '123',
            domainType: CatalogueItemDomainType.DataModel,
            label: 'test'
          },
          [identifier],
          badProvider
        )
      );
    });

    it('should return nothing for save()', () =>
      testExpectation(() =>
        service.save(identifier, badProvider, {} as Profile)
      ));

    it('should return nothing for saveMany()', () => {
      testExpectation(() =>
        service.saveMany(
          {
            id: '123',
            domainType: CatalogueItemDomainType.DataModel,
            label: 'test'
          },
          badProvider,
          []
        )
      );
    });

    it('should return nothing for validate()', () => {
      testExpectation(() => service.validate(badProvider, {} as Profile));
    });
  });

  describe('get profiles', () => {
    it.each(sampleItems)(
      'should return a profile mapped to a %p',
      (domainType, props) => {
        const item: MauroItem = {
          id: '123',
          domainType,
          label: domainType,
          description: 'this is a description',
          ...props
        };

        const identifier: MauroIdentifier = {
          id: item.id,
          domainType: item.domainType
          // Note: this is missing "real" info for some domains but is good enough for mocks
        };

        mockItemProviderGet(identifier, item);

        const profile = constructProfile(item);

        const expected$ = cold('a|', { a: profile });
        const actual$ = service.get(identifier, defaultProfileProvider);
        expect(actual$).toBeObservable(expected$);
      }
    );

    it.each(sampleItems)(
      'should return every profile mapped to each %p',
      (domainType, props) => {
        // Root item isn't required for default profile provider but is a required parameter
        const rootItem = {} as MauroItem;

        const item: MauroItem = {
          id: '123',
          domainType,
          label: domainType,
          description: 'this is a description',
          ...props
        };

        const identifier: MauroIdentifier = {
          id: item.id,
          domainType: item.domainType
          // Note: this is missing "real" info for some domains but is good enough for mocks
        };

        // Mock collections of items and identifiers to simulate multiple objects
        const identifiers = [identifier, identifier];
        const items = [item, item];

        mockItemProviderGetMany(identifiers, items);

        const profiles = items.map((it) => constructProfile(it));

        const expected$ = cold('a|', { a: profiles });
        const actual$ = service.getMany(
          rootItem,
          identifiers,
          defaultProfileProvider
        );
        expect(actual$).toBeObservable(expected$);
      }
    );
  });

  describe('save profiles', () => {
    it.each(sampleItems)(
      'should save a profile mapped to a %p',
      (domainType, props) => {
        const item: MauroItem = {
          id: '123',
          domainType,
          label: domainType,
          description: 'this is a description',
          ...props
        };

        const identifier: MauroIdentifier = {
          id: item.id,
          domainType: item.domainType
          // Note: this is missing "real" info for some domains but is good enough for mocks
        };

        const profile = constructProfile(item);

        mockItemUpdaterSave(identifier, item);

        const expected$ = cold('a|', { a: profile });
        const actual$ = service.save(
          identifier,
          defaultProfileProvider,
          profile
        );
        expect(actual$).toBeObservable(expected$);
      }
    );

    it.each(sampleItems)(
      'should save every profile mapped to each %p',
      (domainType, props) => {
        // Root item isn't required for default profile provider but is a required parameter
        const rootItem = {} as MauroItem;

        const item: MauroItem = {
          id: '123',
          domainType,
          label: domainType,
          description: 'this is a description',
          ...props
        };

        const identifier: MauroIdentifier = {
          id: item.id,
          domainType: item.domainType
          // Note: this is missing "real" info for some domains but is good enough for mocks
        };

        // Mock collections of items and identifiers to simulate multiple objects
        const items = [item, item];
        const payloads: MauroUpdatePayload[] = items.map((it) => ({
          identifier,
          item: it
        }));

        const profiles = items.map((it) => constructProfile(it));
        const profilePayloads: MauroProfileUpdatePayload[] = profiles.map(
          (profile) => ({ identifier, profile })
        );

        mockItemUpdaterSaveMany(payloads, items);

        const expected$ = cold('a|', { a: profiles });
        const actual$ = service.saveMany(
          rootItem,
          defaultProfileProvider,
          profilePayloads
        );
        expect(actual$).toBeObservable(expected$);
      }
    );
  });

  describe('validate profiles', () => {
    it.each(sampleItems)(
      'should pass a valid a profile mapped to a %p',
      (domainType, props) => {
        const item: MauroItem = {
          id: '123',
          domainType,
          label: domainType,
          description: 'this is a description',
          ...props
        };

        const profile = constructProfile(item);
        const validation: MauroProfileValidationResult = {
          profile,
          errors: []
        };

        const expected$ = cold('(a|)', { a: validation });
        const actual$ = service.validate(defaultProfileProvider, profile);
        expect(actual$).toBeObservable(expected$);
      }
    );

    it('should return errors with invalid multiplicity format', () => {
      const item: MauroItem = {
        id: '123',
        domainType: CatalogueItemDomainType.DataElement,
        label: CatalogueItemDomainType.DataElement,
        description: 'this is a description',
        minMultiplicity: 1,
        maxMultiplicity: 1
      };

      const profile = constructProfile(item);

      // Manually create bad string format
      profile.sections
        .find((s) => s.name === 'Default')
        .fields.find(
          (f) => f.metadataPropertyName === 'multiplicity'
        ).currentValue = 'bad format';

      const validation: MauroProfileValidationResult = {
        profile,
        errors: [
          {
            fieldName: 'Multiplicity',
            metadataPropertyName: 'multiplicity',
            message: 'Multiplicity is not in the format "x..y"'
          }
        ]
      };

      const expected$ = cold('(a|)', { a: validation });
      const actual$ = service.validate(defaultProfileProvider, profile);
      expect(actual$).toBeObservable(expected$);
    });

    it.each(sampleItems)(
      'should pass every valid profile mapped to each %p',
      (domainType, props) => {
        // Root item isn't required for default profile provider but is a required parameter
        const rootItem = {} as MauroItem;

        const item: MauroItem = {
          id: '123',
          domainType,
          label: domainType,
          description: 'this is a description',
          ...props
        };

        // Mock collections of items to simulate multiple objects
        const items = [item, item];

        const profiles = items.map((it) => constructProfile(it));
        const validations: MauroProfileValidationResult[] = profiles.map(
          (profile) => {
            return {
              profile,
              errors: []
            };
          }
        );

        const expected$ = cold('(a|)', { a: validations });
        const actual$ = service.validateMany(
          rootItem,
          defaultProfileProvider,
          profiles
        );
        expect(actual$).toBeObservable(expected$);
      }
    );
  });

  describe('used profiles', () => {
    /**
     * Maps domains and expected metadata keys for those domain types for it.each() tests below.
     *
     * Note: the `description` property is assumed to apply to all domain types.
     */
    const supportedDomains: [CatalogueItemDomainType, string[]][] = [
      [
        CatalogueItemDomainType.DataModel,
        ['aliases', 'classifications', 'author', 'organisation']
      ],
      [
        CatalogueItemDomainType.DataClass,
        ['aliases', 'classifications', 'multiplicity']
      ],
      [
        CatalogueItemDomainType.DataElement,
        ['aliases', 'classifications', 'multiplicity', 'dataType']
      ],
      [CatalogueItemDomainType.ModelDataType, ['aliases', 'classifications']],
      [
        CatalogueItemDomainType.Terminology,
        ['aliases', 'classifications', 'author', 'organisation']
      ],
      [
        CatalogueItemDomainType.Term,
        [
          'aliases',
          'classifications',
          'code',
          'definition',
          'terminology',
          'url'
        ]
      ],
      [
        CatalogueItemDomainType.CodeSet,
        ['aliases', 'classifications', 'author', 'organisation']
      ],
      [CatalogueItemDomainType.Folder, []],
      [CatalogueItemDomainType.VersionedFolder, []],
      [CatalogueItemDomainType.Classifier, []]
    ];

    it('should always say there are no unused profiles', () => {
      const expected$ = cold('(a|)', { a: [] });
      const actual$ = service.unusedProfiles();
      expect(actual$).toBeObservable(expected$);
    });

    it.each(supportedDomains)(
      'should always list the default profile as used for %p item',
      (domainType, keys) => {
        const summary: ProfileSummary = {
          allowsExtraMetadataKeys: false,
          displayName: 'Default profile',
          domains: [
            CatalogueItemDomainType.DataModel,
            CatalogueItemDomainType.DataClass,
            CatalogueItemDomainType.DataElement,
            CatalogueItemDomainType.ModelDataType,
            CatalogueItemDomainType.Terminology,
            CatalogueItemDomainType.Term,
            CatalogueItemDomainType.CodeSet,
            CatalogueItemDomainType.Folder,
            CatalogueItemDomainType.VersionedFolder,
            CatalogueItemDomainType.Classifier
          ],
          knownMetadataKeys: ['description', ...keys],
          metadataNamespace: defaultProfileProvider.namespace,
          name: defaultProfileProvider.name,
          namespace: defaultProfileProvider.namespace,
          providerType: 'Profile',
          version: defaultProfileProvider.version
        };

        const expected$ = cold('(a|)', { a: [summary] });
        const actual$ = service.usedProfiles({
          id: '123',
          domainType,
          label: 'test'
        });
        expect(actual$).toBeObservable(expected$);
      }
    );
  });
});
