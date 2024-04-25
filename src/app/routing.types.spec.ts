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
  PathableDomainType,
  isDataType
} from '@maurodatamapper/mdm-resources';
import {
  StateDeclaration,
  Transition,
  UIInjector,
  UIRouter
} from '@uirouter/core';
import { MauroItem, MauroItemLocateOptions } from './mauro/mauro-item.types';
import { Observable, of } from 'rxjs';
import { redirectUsingPath } from './routing.types';

describe('Routing', () => {
  describe('redirect using path', () => {
    const mauroItemProviderStub = {
      locate: jest.fn() as jest.MockedFunction<
        (
          path: string,
          options?: MauroItemLocateOptions
        ) => Observable<MauroItem>
      >
    };

    // Fake an Angular injector to always return a MauroItemProviderService
    const injector = {
      get: jest.fn(() => mauroItemProviderStub)
    };

    const routerStub = {
      stateRegistry: {
        get: jest.fn() as jest.MockedFunction<() => StateDeclaration[]>
      }
    };

    const buildTransition = (
      domain: PathableDomainType,
      path: string
    ): Transition => {
      return {
        params: () => ({ domain, path }),
        injector: () => (injector as unknown) as UIInjector,
        router: (routerStub as unknown) as UIRouter
      } as Transition;
    };

    it('should redirect to "not found" for unknown paths', async () => {
      const transition = buildTransition('dataModels', 'dm:Missing model');

      mauroItemProviderStub.locate.mockImplementationOnce(() => of(null));

      const actual = await redirectUsingPath(transition);

      expect(actual).toStrictEqual({
        state: 'appContainer.mainApp.twoSidePanel.catalogue.notFound'
      });
    });

    it('should redirect to "not found" if catalogue item does not have a router state to view', async () => {
      const transition = buildTransition('dataModels', 'dm:Found model');

      mauroItemProviderStub.locate.mockImplementationOnce(() =>
        of({
          id: '123',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'test item'
        })
      );

      // Setup router states that don't match the given item
      routerStub.stateRegistry.get.mockImplementationOnce(() => {
        return [
          {
            name: 'test.state',
            url: '/test/state',
            data: {
              domainType: CatalogueItemDomainType.DataClass
            }
          }
        ];
      });

      const actual = await redirectUsingPath(transition);

      expect(actual).toStrictEqual({
        state: 'appContainer.mainApp.twoSidePanel.catalogue.notFound'
      });
    });

    /**
     * Define the test cases for as many redirects to domains as possible.
     * Requires domains, paths and item domains.
     * Additional properties can be tested too which may then require more
     * expected parameters returned in the redirect result.
     */
    const redirectTestCases: [
      PathableDomainType,
      string,
      CatalogueItemDomainType,
      any,
      any
    ][] = [
      ['folders', 'fo:Data sets', CatalogueItemDomainType.Folder, null, null],
      [
        'versionedFolders',
        'vf:Simple Versioned Folder$1.0.0',
        CatalogueItemDomainType.VersionedFolder,
        null,
        null
      ],
      [
        'classifiers',
        'cl:NIHR Health Data Finder',
        CatalogueItemDomainType.Classifier,
        null,
        null
      ],
      [
        'dataModels',
        'dm:Model Version Tree DataModel$1.0.0|dc:V1 Modify Data Class',
        CatalogueItemDomainType.DataClass,
        { model: '456' },
        { dataModelId: '456', dataClassId: '' }
      ],
      [
        'dataModels',
        'dm:test request 3$main|dc:Diagnosis|dc:Diagnosis (ARIA MedOnc)',
        CatalogueItemDomainType.DataClass,
        { model: '456', parentDataClass: '789' },
        { dataModelId: '456', dataClassId: '789' }
      ],
      [
        'dataModels',
        'dm:Finalised Example Test DataModel$1.0.0|dc:Finalised Data Class|de:Another DataElement',
        CatalogueItemDomainType.DataElement,
        { model: '456', dataClass: '789' },
        { dataModelId: '456', dataClassId: '789' }
      ],
      [
        'dataModels',
        'dm:Complex Test DataModel$main|dt:string',
        CatalogueItemDomainType.PrimitiveType,
        { model: '456' },
        { dataModelId: '456' }
      ],
      [
        'dataModels',
        'dm:Complex Test DataModel$main|dt:Model reference',
        CatalogueItemDomainType.ModelDataType,
        { dataModel: { id: '456' } },
        { dataModelId: '456' }
      ],
      [
        'terminologies',
        'te:Simple Test Terminology$main',
        CatalogueItemDomainType.Terminology,
        null,
        null
      ],
      [
        'terminologies',
        'te:Complex Test Terminology$main|tm:CTT1001',
        CatalogueItemDomainType.Term,
        { model: '456' },
        { terminologyId: '456', dataModelId: '456' }
      ],
      [
        'codeSets',
        'cs:Simple Test CodeSet$1.0.0',
        CatalogueItemDomainType.CodeSet,
        null,
        null
      ],
      [
        'referenceDataModels',
        'rdm:Simple Reference Data Model$1.0.0',
        CatalogueItemDomainType.ReferenceDataModel,
        null,
        null
      ]
    ];

    it.each(redirectTestCases)(
      'should redirect to domain %p with path %p',
      async (
        pathDomain: PathableDomainType,
        path: string,
        itemDomain: CatalogueItemDomainType,
        itemProps: any,
        expectedParams: any
      ) => {
        const transition = buildTransition(pathDomain, path);

        const item: MauroItem = {
          id: '123',
          domainType: itemDomain,
          label: 'test item',
          ...itemProps
        };

        const needMultipleDomainTypes = isDataType(itemDomain);

        const state: StateDeclaration = {
          name: 'matching.state',
          url: '/matching/state',
          data: {
            ...(!needMultipleDomainTypes && { domainType: item.domainType }),
            ...(needMultipleDomainTypes && { domainTypes: [item.domainType] })
          }
        };

        mauroItemProviderStub.locate.mockImplementationOnce(() => of(item));
        routerStub.stateRegistry.get.mockImplementationOnce(() => [state]);

        const actual = await redirectUsingPath(transition);

        expect(actual).toStrictEqual({
          state: state.name,
          params: {
            id: item.id,
            ...expectedParams
          }
        });
      }
    );
  });
});
