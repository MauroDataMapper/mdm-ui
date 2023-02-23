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
  ProfileContextIndexPayload,
  ProfileContextIndexResponse,
  ProfileContextPayload,
  ProfileProvider,
  ProfileSummary,
  ProfileSummaryIndexResponse,
  ProfileValidationError
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { cold } from 'jest-marbles';
import { Observable } from 'rxjs';
import {
  MauroIdentifier,
  MauroItem,
  MauroProfileUpdatePayload,
  MauroProfileValidationResult
} from '../mauro-item.types';
import { MauroProfileProviderService } from './mauro-profile-provider.service';

describe('MauroProfileProviderService', () => {
  let service: MauroProfileProviderService;

  const resourcesStub = {
    profile: {
      usedProfiles: jest.fn() as jest.MockedFunction<
        (
          domainType: CatalogueItemDomainType,
          catalogueItemId: string
        ) => Observable<ProfileSummaryIndexResponse>
      >,
      unusedProfiles: jest.fn() as jest.MockedFunction<
        (
          domainType: CatalogueItemDomainType,
          catalogueItemId: string
        ) => Observable<ProfileSummaryIndexResponse>
      >,
      getMany: jest.fn() as jest.MockedFunction<
        (
          domainType: CatalogueItemDomainType,
          id: string,
          payload: ProfileContextIndexPayload
        ) => Observable<ProfileContextIndexResponse>
      >,
      saveMany: jest.fn() as jest.MockedFunction<
        (
          domainType: CatalogueItemDomainType,
          id: string,
          payload: ProfileContextPayload
        ) => Observable<ProfileContextIndexResponse>
      >,
      validateMany: jest.fn() as jest.MockedFunction<
        (
          domainType: CatalogueItemDomainType,
          id: string,
          payload: ProfileContextPayload
        ) => Observable<ProfileContextIndexResponse>
      >
    }
  };

  /**
   * Maps domains types for it.each() tests below.
   */
  const supportedDomains = [
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
  ];

  const testProfileProvider: ProfileProvider = {
    name: 'TestProfileService',
    namespace: 'test.profile.service',
    version: '1.0.0'
  };

  /**
   * Create a profile that should look like what is expected from the test scenarios.
   *
   * @param item A Mauro item containing the expected properties
   */
  const constructProfile = (item: MauroItem): Profile => {
    return {
      id: item.id,
      domainType: item.domainType,
      label: item.label,
      sections: [
        {
          name: 'Test',
          fields: [
            {
              fieldName: 'Test field',
              metadataPropertyName: 'testField',
              dataType: 'string'
            }
          ]
        }
      ]
    };
  };

  beforeEach(() => {
    service = setupTestModuleForService(MauroProfileProviderService, {
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

  describe('used and unused profiles', () => {
    const testReturnedProfileSummaries = (
      domainType: CatalogueItemDomainType,
      mockedFunction: jest.MockedFunction<
        (
          domainType: CatalogueItemDomainType,
          catalogueItemId: string
        ) => Observable<ProfileSummaryIndexResponse>
      >,
      act: (item: MauroItem) => Observable<ProfileSummary[]>
    ) => {
      const summary: ProfileSummary = {
        allowsExtraMetadataKeys: false,
        displayName: 'Test profile',
        domains: [domainType],
        knownMetadataKeys: ['description'],
        metadataNamespace: 'test.namespace',
        name: 'test',
        namespace: 'test.namespace',
        providerType: 'Profile',
        version: '1.0.0'
      };

      const item: MauroItem = {
        id: '123',
        domainType,
        label: 'test'
      };

      const response: ProfileSummaryIndexResponse = {
        body: [summary]
      };

      mockedFunction.mockImplementationOnce((dt, id) => {
        expect(dt).toBe(item.domainType);
        expect(id).toBe(item.id);
        return cold('a|', { a: response });
      });

      const expected$ = cold('a|', { a: [summary] });
      const actual$ = act(item);
      expect(actual$).toBeObservable(expected$);
    };

    it.each(supportedDomains)(
      'should return a used profile summary for a %p item',
      (domainType) => {
        testReturnedProfileSummaries(
          domainType,
          resourcesStub.profile.usedProfiles,
          (item) => service.usedProfiles(item)
        );
      }
    );

    it.each(supportedDomains)(
      'should return an unused profile summary for a %p item',
      (domainType) => {
        testReturnedProfileSummaries(
          domainType,
          resourcesStub.profile.unusedProfiles,
          (item) => service.unusedProfiles(item)
        );
      }
    );
  });

  describe('get many', () => {
    it.each(supportedDomains)(
      'should return every profile mapped to each %p',
      (domainType) => {
        const rootItem: MauroItem = {
          id: '999',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'root'
        };

        const item: MauroItem = {
          id: '123',
          domainType,
          label: domainType,
          description: 'this is a description'
        };

        const identifier: MauroIdentifier = {
          id: item.id,
          domainType: item.domainType
          // Note: this is missing "real" info for some domains but is good enough for mocks
        };

        // Mock collections of identifiers to simulate multiple objects
        const identifiers = [identifier, identifier];
        const items = [item, item];

        const expectedPayload: ProfileContextIndexPayload = {
          multiFacetAwareItems: identifiers.map((ident) => {
            return {
              multiFacetAwareItemDomainType: ident.domainType,
              multiFacetAwareItemId: ident.id
            };
          }),
          profileProviderServices: [testProfileProvider]
        };

        const profiles = items.map((it) => constructProfile(it));

        resourcesStub.profile.getMany.mockImplementationOnce((dt, id, pl) => {
          expect(dt).toBe(rootItem.domainType);
          expect(id).toBe(rootItem.id);
          expect(pl).toStrictEqual(expectedPayload);
          return cold('a|', {
            a: {
              body: {
                profilesProvided: profiles.map((profile) => {
                  return {
                    profile
                  };
                })
              }
            }
          });
        });

        const expected$ = cold('a|', { a: profiles });
        const actual$ = service.getMany(
          rootItem,
          identifiers,
          testProfileProvider
        );
        expect(actual$).toBeObservable(expected$);
      }
    );
  });

  describe('save many', () => {
    it.each(supportedDomains)(
      'should save every profile mapped to each %p',
      (domainType) => {
        const rootItem: MauroItem = {
          id: '999',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'root'
        };

        const item: MauroItem = {
          id: '123',
          domainType,
          label: domainType,
          description: 'this is a description'
        };

        const identifier: MauroIdentifier = {
          id: item.id,
          domainType: item.domainType
          // Note: this is missing "real" info for some domains but is good enough for mocks
        };

        // Mock collections of items and identifiers to simulate multiple objects
        const items = [item, item];

        const profiles = items.map((it) => constructProfile(it));
        const profilePayloads: MauroProfileUpdatePayload[] = profiles.map(
          (profile) => ({ identifier, profile })
        );

        const expectedPayload: ProfileContextPayload = {
          profilesProvided: profilePayloads.map((pl) => {
            return {
              profile: pl.profile,
              profileProviderService: testProfileProvider
            };
          })
        };

        resourcesStub.profile.saveMany.mockImplementationOnce((dt, id, pl) => {
          expect(dt).toBe(rootItem.domainType);
          expect(id).toBe(rootItem.id);
          expect(pl).toStrictEqual(expectedPayload);
          return cold('a|', {
            a: {
              body: {
                profilesProvided: profiles.map((profile) => {
                  return {
                    profile
                  };
                })
              }
            }
          });
        });

        const expected$ = cold('a|', { a: profiles });
        const actual$ = service.saveMany(
          rootItem,
          testProfileProvider,
          profilePayloads
        );
        expect(actual$).toBeObservable(expected$);
      }
    );
  });

  describe('validate many', () => {
    it.each(supportedDomains)(
      'should pass every valid profile mapped to each %p',
      (domainType) => {
        const rootItem: MauroItem = {
          id: '999',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'root'
        };

        const item: MauroItem = {
          id: '123',
          domainType,
          label: domainType,
          description: 'this is a description'
        };

        // Mock collections of items to simulate multiple objects
        const items = [item, item];

        const profiles = items.map((it) => constructProfile(it));
        const validations: MauroProfileValidationResult[] = profiles.map(
          (profile) => {
            return {
              profile
            };
          }
        );

        const expectedPayload: ProfileContextPayload = {
          profilesProvided: profiles.map((profile) => {
            return {
              profile,
              profileProviderService: testProfileProvider
            };
          })
        };

        resourcesStub.profile.validateMany.mockImplementationOnce(
          (dt, id, pl) => {
            expect(dt).toBe(rootItem.domainType);
            expect(id).toBe(rootItem.id);
            expect(pl).toStrictEqual(expectedPayload);
            return cold('a|', {
              a: {
                body: {
                  profilesProvided: profiles.map((profile) => {
                    return {
                      profile
                    };
                  })
                }
              }
            });
          }
        );

        const expected$ = cold('a|', { a: validations });
        const actual$ = service.validateMany(
          rootItem,
          testProfileProvider,
          profiles
        );
        expect(actual$).toBeObservable(expected$);
      }
    );

    it.each(supportedDomains)(
      'should pass errors down from every invalid profile mapped to each %p',
      (domainType) => {
        const rootItem: MauroItem = {
          id: '999',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'root'
        };

        const item: MauroItem = {
          id: '123',
          domainType,
          label: domainType,
          description: 'this is a description'
        };

        // Mock collections of items to simulate multiple objects
        const items = [item, item];

        const errors: ProfileValidationError[] = [
          {
            fieldName: 'test',
            message: 'test'
          }
        ];

        const profiles = items.map((it) => constructProfile(it));
        const validations: MauroProfileValidationResult[] = profiles.map(
          (profile) => {
            return {
              profile,
              errors
            };
          }
        );

        const expectedPayload: ProfileContextPayload = {
          profilesProvided: profiles.map((profile) => {
            return {
              profile,
              profileProviderService: testProfileProvider
            };
          })
        };

        resourcesStub.profile.validateMany.mockImplementationOnce(
          (dt, id, pl) => {
            expect(dt).toBe(rootItem.domainType);
            expect(id).toBe(rootItem.id);
            expect(pl).toStrictEqual(expectedPayload);
            return cold('#', null, {
              error: {
                profilesProvided: profiles.map((profile) => {
                  return {
                    profile,
                    errors: {
                      errors
                    }
                  };
                })
              }
            });
          }
        );

        const expected$ = cold('(a|)', { a: validations });
        const actual$ = service.validateMany(
          rootItem,
          testProfileProvider,
          profiles
        );
        expect(actual$).toBeObservable(expected$);
      }
    );
  });
});
