/*
Copyright 2020-2023 University of Oxford
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
import { FormControl, FormGroup } from '@angular/forms';
import {
  CatalogueItemDomainType,
  Classifier,
  MdmTreeItem,
  ModelDomainType
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from '@mdm/services';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { of } from 'rxjs';
import { CatalogueSearchAdvancedFormComponent } from '../catalogue-search-advanced/catalogue-search-advanced-form.component';
import { CatalogueSearchFormComponent } from '../catalogue-search-form/catalogue-search-form.component';
import { CatalogueSearchComponent } from './catalogue-search.component';

interface StateHandlerServiceStub {
  Go: jest.Mock;
}

describe('CatalogueSearchComponent', () => {
  let harness: ComponentHarness<CatalogueSearchComponent>;

  const stateHandlerStub: StateHandlerServiceStub = {
    Go: jest.fn()
  };

  const resourcesStub = {
    classifier: {
      list: jest.fn()
    }
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(CatalogueSearchComponent, {
      declarations: [
        CatalogueSearchFormComponent,
        CatalogueSearchAdvancedFormComponent
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
    // SET UP TEST DATA
    resourcesStub.classifier.list.mockImplementationOnce(() =>
      of({
        body: {
          items: []
        }
      })
    );
    harness.component.catalogueSearchFormComponent.ngOnInit();
    harness.component.catalogueSearchAdvancedFormComponent.ngOnInit();
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should Use values to call the router', () => {
    // set up searchform data
    harness.component.catalogueSearchFormComponent.formGroup = new FormGroup({
      searchTerms: new FormControl('testSearch')
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

    harness.component.catalogueSearchAdvancedFormComponent.formGroup = new FormGroup(
      {
        context: new FormControl(contextTest),
        domainTypes: new FormControl([
          ModelDomainType.DataModels,
          ModelDomainType.Classifiers
        ]),
        labelOnly: new FormControl(true),
        exactMatch: new FormControl(true),
        classifiers: new FormControl(classifiers),
        createdAfter: new FormControl(new Date('July 21, 1983 01:15:00')),
        createdBefore: new FormControl(new Date('July 22, 1983 01:15:00')),
        lastUpdatedAfter: new FormControl(new Date('July 23, 1983 01:15:00')),
        lastUpdatedBefore: new FormControl(new Date('July 24, 1983 01:15:00'))
      }
    );

    harness.component.search();

    expect(stateHandlerStub.Go).toHaveBeenCalledWith(
      'appContainer.mainApp.catalogueSearchListing',
      {
        contextDomainType: context.domainType,
        contextId: context.id,
        contextLabel: context.label,
        contextParentId: context.parentId,
        contextDataModelId: context.modelId,
        classifiers: ['testLabel1', 'testLabel2'],
        createdAfter: '1983-06-21',
        createdBefore: '1983-06-22',
        domainTypes: ['dataModels', 'classifiers'],
        exactMatch: true,
        labelOnly: true,
        lastUpdatedAfter: '1983-06-23',
        lastUpdatedBefore: '1983-06-24',
        search: 'testSearch'
      }
    );
  });

  it('should ResetValues', () => {
    const formSpy = jest.spyOn(
      harness.component.catalogueSearchFormComponent,
      'reset'
    );
    const advancedSpy = jest.spyOn(
      harness.component.catalogueSearchAdvancedFormComponent,
      'reset'
    );

    harness.component.reset();
    expect(formSpy).toHaveBeenCalled();
    expect(advancedSpy).toHaveBeenCalled();
  });
});
