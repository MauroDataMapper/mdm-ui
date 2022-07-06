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
  CatalogueItem,
  CatalogueItemDomainType,
  Profile,
  ProfileContextCollection,
  ProfileContextIndexPayload,
  ProfileContextPayload,
  ProfileProvider,
  ProfileSummary
} from '@maurodatamapper/mdm-resources';
import { MauroProfileProviderService } from '@mdm/mauro/profiles/mauro-profile-provider.service';
import { createMauroProfileProviderServiceStub } from '@mdm/mauro/profiles/mauro-profile-provider.service.spec';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { cold } from 'jest-marbles';
import { Observable } from 'rxjs';
import { BulkEditProfileService } from './bulk-edit-profile.service';

describe('BulkEditProfileService', () => {
  let service: BulkEditProfileService;

  const mauroProfilesStub = createMauroProfileProviderServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(BulkEditProfileService, {
      providers: [
        {
          provide: MauroProfileProviderService,
          useValue: mauroProfilesStub
        }
      ]
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list available profiles', () => {
    const item: CatalogueItem = {
      id: '123',
      domainType: CatalogueItemDomainType.DataModel
    };

    const testListAvailableProfiles = (
      used: ProfileSummary[],
      unused: ProfileSummary[]
    ) => {
      mauroProfilesStub.usedProfiles.mockImplementationOnce((ci) => {
        expect(ci.domainType).toBe(item.domainType);
        expect(ci.id).toBe(item.id);
        return cold('-a|', { a: used });
      });

      mauroProfilesStub.unusedProfiles.mockImplementationOnce((ci) => {
        expect(ci.domainType).toBe(item.domainType);
        expect(ci.id).toBe(item.id);
        return cold('-a|', { a: unused });
      });

      const expected$ = cold('--(a|)', { a: [...used, ...unused] });

      const actual$ = service.listAvailableProfiles(item);
      expect(actual$).toBeObservable(expected$);
    };

    it('should return all used profiles', () => {
      testListAvailableProfiles(
        [
          {
            name: 'profile1'
          } as ProfileSummary,
          {
            name: 'profile2'
          } as ProfileSummary
        ],
        []
      );
    });

    it('should return all unused profiles', () => {
      testListAvailableProfiles(
        [],
        [
          {
            name: 'profile1'
          } as ProfileSummary,
          {
            name: 'profile2'
          } as ProfileSummary
        ]
      );
    });

    it('should return both used and unused profiles', () => {
      testListAvailableProfiles(
        [
          {
            name: 'profile1'
          } as ProfileSummary,
          {
            name: 'profile2'
          } as ProfileSummary
        ],
        [
          {
            name: 'profile3'
          } as ProfileSummary,
          {
            name: 'profile4'
          } as ProfileSummary
        ]
      );
    });
  });

  describe('check for model domains only', () => {
    const badDomains = [
      CatalogueItemDomainType.Folder,
      CatalogueItemDomainType.VersionedFolder,
      CatalogueItemDomainType.DataClass,
      CatalogueItemDomainType.DataElement,
      CatalogueItemDomainType.Term
    ];

    const testRootItem = <R>(
      domain: CatalogueItemDomainType,
      action: (item: CatalogueItem) => Observable<R>
    ) => {
      const rootItem: CatalogueItem = {
        domainType: domain,
        id: '123'
      };

      const expected$ = cold('#', null, new Error());
      const actual$ = action(rootItem);
      expect(actual$).toBeObservable(expected$);
    };

    it.each(badDomains)(
      'should throw an error on getMany if domain is %p',
      (domain) => {
        testRootItem(domain, (item) =>
          service.getMany(item, {} as ProfileContextIndexPayload)
        );
      }
    );

    it.each(badDomains)(
      'should throw an error on saveMany if domain is %p',
      (domain) => {
        testRootItem(domain, (item) =>
          service.saveMany(item, {} as ProfileContextPayload)
        );
      }
    );

    it.each(badDomains)(
      'should throw an error on validateMany if domain is %p',
      (domain) => {
        testRootItem(domain, (item) =>
          service.validateMany(item, {} as ProfileContextPayload)
        );
      }
    );
  });

  describe('get many', () => {
    it('should get all profiles from Mauro', () => {
      const rootItem: CatalogueItem = {
        domainType: CatalogueItemDomainType.DataModel,
        id: '123'
      };

      const provider: ProfileProvider = {
        name: 'profile',
        namespace: 'test.profile'
      };

      const payload: ProfileContextIndexPayload = {
        multiFacetAwareItems: [],
        profileProviderServices: [provider]
      };

      const expectedResult: ProfileContextCollection = {
        count: 1,
        profilesProvided: [
          {
            profile: {
              id: rootItem.id,
              domainType: rootItem.domainType,
              label: 'profile',
              sections: []
            },
            profileProviderService: provider
          }
        ]
      };

      mauroProfilesStub.getMany.mockImplementationOnce((ci, pl) => {
        expect(ci).toBe(rootItem);
        expect(pl).toBe(payload);
        return cold('--a|', { a: expectedResult });
      });

      const expected$ = cold('--a|', { a: expectedResult });
      const actual$ = service.getMany(rootItem, payload);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('save many', () => {
    it('should save all profiles to Mauro', () => {
      const rootItem: CatalogueItem = {
        domainType: CatalogueItemDomainType.DataModel,
        id: '123'
      };

      const profile: Profile = {
        id: rootItem.id,
        domainType: rootItem.domainType,
        label: 'profile',
        sections: []
      };

      const provider: ProfileProvider = {
        name: 'profile',
        namespace: 'test.profile'
      };

      const payload: ProfileContextPayload = {
        profilesProvided: [
          {
            profile,
            profileProviderService: provider
          }
        ]
      };

      const expectedResult: ProfileContextCollection = {
        count: 1,
        profilesProvided: [
          {
            profile: {
              id: rootItem.id,
              domainType: rootItem.domainType,
              label: 'profile',
              sections: []
            },
            profileProviderService: provider
          }
        ]
      };

      mauroProfilesStub.saveMany.mockImplementationOnce((ci, pl) => {
        expect(ci).toBe(rootItem);
        expect(pl).toBe(payload);
        return cold('--a|', { a: expectedResult });
      });

      const expected$ = cold('--a|', { a: expectedResult });
      const actual$ = service.saveMany(rootItem, payload);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('validate many', () => {
    it('should validate all profiles via Mauro', () => {
      const rootItem: CatalogueItem = {
        domainType: CatalogueItemDomainType.DataModel,
        id: '123'
      };

      const profile: Profile = {
        id: rootItem.id,
        domainType: rootItem.domainType,
        label: 'profile',
        sections: []
      };

      const provider: ProfileProvider = {
        name: 'profile',
        namespace: 'test.profile'
      };

      const payload: ProfileContextPayload = {
        profilesProvided: [
          {
            profile,
            profileProviderService: provider
          }
        ]
      };

      const expectedResult: ProfileContextCollection = {
        count: 1,
        profilesProvided: [
          {
            profile: {
              id: rootItem.id,
              domainType: rootItem.domainType,
              label: 'profile',
              sections: []
            },
            profileProviderService: provider
          }
        ]
      };

      mauroProfilesStub.validateMany.mockImplementationOnce((ci, pl) => {
        expect(ci).toBe(rootItem);
        expect(pl).toBe(payload);
        return cold('--a|', { a: expectedResult });
      });

      const expected$ = cold('--a|', { a: expectedResult });
      const actual$ = service.validateMany(rootItem, payload);
      expect(actual$).toBeObservable(expected$);
    });
  });
});
