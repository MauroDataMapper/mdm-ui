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
import { FormGroup } from '@angular/forms';
import {
  CatalogueItemDomainType,
  Classifier,
  ClassifierIndexResponse,
  FilterQueryParameters,
  MdmTreeItem,
  ModelDomainType,
  ProfileSummaryIndexResponse
} from '@maurodatamapper/mdm-resources';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from '@mdm/services';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { MockComponent } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { CatalogueSearchAdvancedFormComponent } from '../catalogue-search-advanced/catalogue-search-advanced-form.component';
import { CatalogueSearchFormComponent } from '../catalogue-search-form/catalogue-search-form.component';
import { CatalogueSearchProfileFilterListComponent } from '../catalogue-search-profile-filter-list/catalogue-search-profile-filter-list.component';
import { CatalogueSearchComponent } from './catalogue-search.component';

describe('CatalogueSearchComponent', () => {
  let harness: ComponentHarness<CatalogueSearchComponent>;

  const stateHandlerStub = {
    Go: jest.fn()
  };

  const resourcesStub = {
    classifier: {
      list: jest.fn() as jest.MockedFunction<
        (query?: FilterQueryParameters) => Observable<ClassifierIndexResponse>
      >
    },
    profile: {
      providers: jest.fn() as jest.MockedFunction<
        () => Observable<ProfileSummaryIndexResponse>
      >
    }
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(CatalogueSearchComponent, {
      declarations: [
        CatalogueSearchFormComponent,
        CatalogueSearchAdvancedFormComponent,
        CatalogueSearchProfileFilterListComponent,
        MockComponent(ModelSelectorTreeComponent)
      ],
      providers: [
        {
          provide: StateHandlerService,
          useValue: stateHandlerStub
        },
        {
          provide: MdmResourcesService,
          useValue: resourcesStub
        }
      ]
    });
  });

  beforeEach(() => {
    resourcesStub.classifier.list.mockImplementation(() =>
      of({
        body: {
          count: 0,
          items: []
        }
      })
    );

    resourcesStub.profile.providers.mockImplementation(() => of({ body: [] }));

    // "Expand" the filters section and force change detection so that
    // the @ViewChild elements will get populated
    harness.component.showMore = true;
    harness.detectChanges();

    harness.component.searchForm.ngOnInit();
    harness.component.advancedForm.ngOnInit();
    harness.component.profileFiltersForm.ngOnInit();
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('trigger search', () => {
    beforeEach(() => stateHandlerStub.Go.mockClear());

    it('should use values to call the router', () => {
      harness.component.searchForm.formGroup.setValue({
        searchTerms: 'testSearch'
      });

      const context: MdmTreeItem = {
        domainType: CatalogueItemDomainType.Folder,
        id: 'testId',
        label: 'testContextLabel',
        parentId: 'testParentId',
        modelId: 'testModelId',
        availableActions: null
      };

      // set up advanced form data
      const contextTest: MdmTreeItem[] = [context];
      const testClassifier: Classifier = {
        domainType: CatalogueItemDomainType.Classifier,
        label: 'testLabel1'
      };
      const testClassifier2: Classifier = {
        domainType: CatalogueItemDomainType.Classifier,
        label: 'testLabel2'
      };
      const classifiers: Classifier[] = [testClassifier, testClassifier2];

      harness.component.advancedForm.formGroup.setValue({
        context: contextTest,
        domainTypes: [ModelDomainType.DataModels, ModelDomainType.Classifiers],
        labelOnly: true,
        exactMatch: true,
        classifiers,
        createdAfter: new Date('July 21, 1983 01:15:00'),
        createdBefore: new Date('July 22, 1983 01:15:00'),
        lastUpdatedAfter: new Date('July 23, 1983 01:15:00'),
        lastUpdatedBefore: new Date('July 24, 1983 01:15:00'),
        includeSuperseded: true
      });

      harness.component.search();

      expect(stateHandlerStub.Go).toHaveBeenCalledWith(
        'appContainer.mainApp.catalogueSearchListing',
        {
          cxdt: context.domainType,
          cxid: context.id,
          cxl: context.label,
          cxpid: context.parentId,
          cxmid: context.modelId,
          cls: ['testLabel1', 'testLabel2'],
          ca: '1983-07-21',
          cb: '1983-07-22',
          dt: ['dataModels', 'classifiers'],
          e: true,
          is: true,
          l: true,
          lua: '1983-07-23',
          lub: '1983-07-24',
          search: 'testSearch'
        }
      );
    });

    it('should send serialized profile filters to search listing page', () => {
      harness.component.profileFiltersForm.addFilter();

      const namespace = 'test.namespace';
      const name = 'TestProfile';
      const version = '1.0.0';
      const metadataPropertyName = 'testKey';
      const value = 'testValue';

      const filter = harness.component.profileFiltersForm.filters.at(
        0
      ) as FormGroup<any>;
      filter.patchValue({
        provider: {
          namespace,
          name,
          version
        },
        key: {
          metadataPropertyName
        },
        value
      });

      const expectedMdBase64 =
        'eyJ0ZXN0Lm5hbWVzcGFjZXxUZXN0UHJvZmlsZXwxLjAuMCI6eyJ0ZXN0S2V5IjoidGVzdFZhbHVlIn19';

      harness.component.search();

      expect(stateHandlerStub.Go).toHaveBeenCalledWith(
        'appContainer.mainApp.catalogueSearchListing',
        {
          cls: [],
          dt: [],
          l: true,
          md: expectedMdBase64
        }
      );
    });
  });

  it('should reset all values', () => {
    const formSpy = jest.spyOn(harness.component.searchForm, 'reset');
    const advancedSpy = jest.spyOn(harness.component.advancedForm, 'reset');
    const profileFiltersSpy = jest.spyOn(
      harness.component.profileFiltersForm,
      'reset'
    );

    harness.component.reset();
    expect(formSpy).toHaveBeenCalled();
    expect(advancedSpy).toHaveBeenCalled();
    expect(profileFiltersSpy).toHaveBeenCalled();
  });

  it.each([true, false])(
    'should toggle the advanced filters when initial state is %p',
    (initial) => {
      harness.component.showMore = initial;
      harness.component.toggleShowMore();
      expect(harness.component.showMore).toBe(!initial);
    }
  );

  // Testing validity of the parent component requires modifying data in child forms
  // This raises change events to update parent state
  describe('validity', () => {
    beforeEach(() => {
      // Fake initial state
      harness.component.valid = true;

      // Profile filters list is only child form that can potentially have invalid data
      // Having a new filter row with no values set counts as invalid
      harness.component.profileFiltersForm.addFilter();
    });

    it('should mark component as invalid when errors in child forms', () => {
      expect(harness.component.valid).toBe(false);
    });

    it('should mark component as valid when child forms are valid', () => {
      expect(harness.component.valid).toBe(false);

      const filter = harness.component.profileFiltersForm.filters.at(
        0
      ) as FormGroup<any>;
      filter.patchValue({
        provider: 'provider',
        key: 'key',
        value: 'value'
      });

      expect(harness.component.valid).toBe(true);
    });
  });
});
