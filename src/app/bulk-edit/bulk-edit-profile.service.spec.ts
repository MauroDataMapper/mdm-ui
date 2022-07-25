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
  ProfileProvider,
  ProfileSummary
} from '@maurodatamapper/mdm-resources';
import { MauroItem } from '@mdm/mauro/mauro-item.types';
import { DefaultProfileProviderService } from '@mdm/mauro/profiles/default-profile-provider.service';
import { MauroProfileProviderService } from '@mdm/mauro/profiles/mauro-profile-provider.service';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { cold } from 'jest-marbles';
import { Observable } from 'rxjs';
import { BulkEditProfileService } from './bulk-edit-profile.service';

describe('BulkEditProfileService', () => {
  const createProfileProviderServiceStub = () => {
    return {
      usedProfiles: jest.fn() as jest.MockedFunction<
        (item: MauroItem) => Observable<ProfileSummary[]>
      >,
      unusedProfiles: jest.fn() as jest.MockedFunction<
        (item: MauroItem) => Observable<ProfileSummary[]>
      >,
      getMany: jest.fn(),
      saveMany: jest.fn(),
      validateMany: jest.fn()
    };
  };

  let service: BulkEditProfileService;

  const mauroProfileProvider = createProfileProviderServiceStub();
  const defaultProfileProvider = createProfileProviderServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(BulkEditProfileService, {
      providers: [
        {
          provide: MauroProfileProviderService,
          useValue: mauroProfileProvider
        },
        {
          provide: DefaultProfileProviderService,
          useValue: defaultProfileProvider
        }
      ]
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list available profiles', () => {
    const item: MauroItem = {
      id: '123',
      domainType: CatalogueItemDomainType.DataModel,
      label: 'test'
    };

    const testListAvailableProfiles = (
      used: ProfileSummary[],
      unused: ProfileSummary[]
    ) => {
      mauroProfileProvider.usedProfiles.mockImplementationOnce((it) => {
        expect(it).toStrictEqual(item);
        return cold('-a|', { a: used });
      });

      defaultProfileProvider.usedProfiles.mockImplementationOnce((it) => {
        expect(it).toStrictEqual(item);
        return cold('-a|', { a: used });
      });

      mauroProfileProvider.unusedProfiles.mockImplementationOnce((it) => {
        expect(it).toStrictEqual(item);
        return cold('-a|', { a: unused });
      });

      defaultProfileProvider.unusedProfiles.mockImplementationOnce((it) => {
        expect(it).toStrictEqual(item);
        return cold('-a|', { a: unused });
      });

      // Duplicate used/unused concatenations to simulate coming from both profile provider services
      const expectedProfiles = [...used, ...unused, ...used, ...unused];

      const expected$ = cold('--(a|)', { a: expectedProfiles });

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
      action: (item: MauroItem) => Observable<R>
    ) => {
      const rootItem: MauroItem = {
        domainType: domain,
        id: '123',
        label: 'test'
      };

      const expected$ = cold('#', null, new Error());
      const actual$ = action(rootItem);
      expect(actual$).toBeObservable(expected$);
    };

    it.each(badDomains)(
      'should throw an error on getMany if domain is %p',
      (domain) => {
        testRootItem(domain, (item) =>
          service.getMany(item, [], {} as ProfileProvider)
        );
      }
    );

    it.each(badDomains)(
      'should throw an error on saveMany if domain is %p',
      (domain) => {
        testRootItem(domain, (item) =>
          service.saveMany(item, {} as ProfileProvider, [])
        );
      }
    );

    it.each(badDomains)(
      'should throw an error on validateMany if domain is %p',
      (domain) => {
        testRootItem(domain, (item) =>
          service.validateMany(item, {} as ProfileProvider, [])
        );
      }
    );
  });
});
