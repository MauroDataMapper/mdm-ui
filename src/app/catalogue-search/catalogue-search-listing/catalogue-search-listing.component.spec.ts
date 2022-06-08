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
  CatalogueItemSearchResult
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { StateParams, UIRouterGlobals } from '@uirouter/core';
import { of, throwError } from 'rxjs';
import {
  CatalogueSearchParameters,
  mapSearchParametersToRawParams
} from '../catalogue-search.types';

import { CatalogueSearchListingComponent } from './catalogue-search-listing.component';

interface MdmResourcesServiceStub {
  catalogueItem: {
    search: jest.Mock;
  };
}

const resourcesStub: MdmResourcesServiceStub = {
  catalogueItem: {
    search: jest.fn()
  }
};

describe('CatalogueSearchListingComponent', () => {
  let harness: ComponentHarness<CatalogueSearchListingComponent>;

  const setupComponentTest = async (parameters: CatalogueSearchParameters) => {
    const params = mapSearchParametersToRawParams(parameters);

    const routerGlobalsStub: UIRouterGlobals = {
      params: new StateParams(params)
    } as UIRouterGlobals;

    return await setupTestModuleForComponent(CatalogueSearchListingComponent, {
      providers: [
        {
          provide: UIRouterGlobals,
          useValue: routerGlobalsStub
        },
        {
          provide: MdmResourcesService,
          useValue: resourcesStub
        }
      ]
    });
  };

  describe('creation', () => {
    beforeEach(async () => {
      harness = await setupComponentTest({});
    });

    it('should create', () => {
      expect(harness.isComponentCreated).toBeTruthy();
      expect(harness.component.status).toBe('init');
      expect(harness.component.parameters).toStrictEqual({});
      expect(harness.component.resultSet).toBeUndefined();
    });
  });

  describe('standard initialisation', () => {
    const parameters: CatalogueSearchParameters = {
      search: 'test'
    };

    beforeEach(async () => {
      harness = await setupComponentTest(parameters);

      // Don't care about what mock search returns for these scenarios
      resourcesStub.catalogueItem.search.mockImplementationOnce(() => {
        return of({});
      });

      harness.component.ngOnInit();
    });

    it('should set the parameters to the page', () => {
      expect(harness.component.parameters.search).toBe(parameters.search);
    });

    it('should set the starting search term on the page', () => {
      expect(harness.component.searchTerms).toBe(parameters.search);
    });
  });

  describe('no search terms provided', () => {
    const parameters: CatalogueSearchParameters = {
      search: ''
    };

    beforeEach(async () => {
      harness = await setupComponentTest(parameters);
      harness.component.ngOnInit();
    });

    it('should render an empty state to the page', () => {
      expect(harness.component.resultSet.totalResults).toBe(0);
      expect(harness.component.status).toBe('ready');
    });
  });

  describe('full catalogue search', () => {
    const parameters: CatalogueSearchParameters = {
      search: 'test'
    };

    beforeEach(async () => {
      harness = await setupComponentTest(parameters);
    });

    it('should display the expected search results', () => {
      const totalResults = 100;
      const catalogueItems: CatalogueItemSearchResult[] = [
        {
          label: 'item 1',
          domainType: CatalogueItemDomainType.DataModel,
          breadcrumbs: []
        },
        {
          label: 'item 2',
          domainType: CatalogueItemDomainType.DataClass,
          breadcrumbs: []
        },
        {
          label: 'item 3',
          domainType: CatalogueItemDomainType.DataElement,
          breadcrumbs: []
        }
      ];

      resourcesStub.catalogueItem.search.mockImplementationOnce(() => {
        return of({
          body: {
            count: totalResults,
            items: catalogueItems
          }
        });
      });

      harness.component.ngOnInit();

      expect(harness.component.resultSet.totalResults).toBe(totalResults);
      expect(harness.component.resultSet.items).toBe(catalogueItems);
      expect(harness.component.status).toBe('ready');
      expect(harness.component.paginator).toBeTruthy();
    });

    it('should paginate results', () => {
      const totalResults = 100;
      const catalogueItems: CatalogueItemSearchResult[] = [
        {
          label: 'item 1',
          domainType: CatalogueItemDomainType.DataModel,
          breadcrumbs: []
        },
        {
          label: 'item 2',
          domainType: CatalogueItemDomainType.DataClass,
          breadcrumbs: []
        },
        {
          label: 'item 3',
          domainType: CatalogueItemDomainType.DataElement,
          breadcrumbs: []
        }
      ];

      resourcesStub.catalogueItem.search.mockImplementationOnce(() => {
        return of({
          body: {
            count: totalResults,
            items: catalogueItems
          }
        });
      });

      harness.component.onPageChange();

      expect(harness.component.resultSet.totalResults).toBe(totalResults);
      expect(harness.component.resultSet.items).toBe(catalogueItems);
      expect(harness.component.status).toBe('ready');
      expect(harness.component.paginator).toBeTruthy();      
    });

    it('should display an error when search fails', () => {
      resourcesStub.catalogueItem.search.mockImplementation(() =>
        throwError(new Error())
      );

      harness.component.ngOnInit();

      expect(harness.component.status).toBe('error');
      expect(harness.component.resultSet).toBeUndefined();
    });
  });
});
