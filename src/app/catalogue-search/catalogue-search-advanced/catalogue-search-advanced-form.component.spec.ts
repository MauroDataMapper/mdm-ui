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
  Classifier,
  MdmTreeItem,
  ModelDomainType
} from '@maurodatamapper/mdm-resources';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { CatalogueSearchAdvancedFormComponent } from './catalogue-search-advanced-form.component';

describe('CatalogueSearchFormAdvancedComponent', () => {
  let harness: ComponentHarness<CatalogueSearchAdvancedFormComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(
      CatalogueSearchAdvancedFormComponent,
      {}
    );
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('it should reset', () => {
    const value: MdmTreeItem[] = [];

    harness.component.context.setValue(value);
    harness.component.domainTypes.setValue([
      ModelDomainType.DataModels,
      ModelDomainType.Classifiers
    ]);
    harness.component.labelOnly.setValue(true);
    harness.component.exactMatch.setValue(true);
    harness.component.classifiers.setValue(['classifiers']);
    harness.component.createdAfter.setValue(new Date('July 21, 1983 01:15:00'));
    harness.component.createdBefore.setValue(
      new Date('July 22, 1983 01:15:00')
    );
    harness.component.lastUpdatedAfter.setValue(
      new Date('July 23, 1983 01:15:00')
    );
    harness.component.lastUpdatedBefore.setValue(
      new Date('July 24, 1983 01:15:00')
    );

    harness.component.reset();
    expect(harness.component.context.value).toBe(null);
    expect(harness.component.domainTypes.value).toBe(null);
    expect(harness.component.labelOnly.value).toBe(null);
    expect(harness.component.exactMatch.value).toBe(null);
    expect(harness.component.classifiers.value).toBe(null);
    expect(harness.component.createdAfter.value).toBe(null);
    expect(harness.component.createdBefore.value).toBe(null);
    expect(harness.component.lastUpdatedAfter.value).toBe(null);
    expect(harness.component.lastUpdatedBefore.value).toBe(null);
  });

  it('it should format dates correctly', () => {
    harness.component.createdAfter.setValue(new Date('July 21, 1983 01:15:00'));
    expect(
      harness.component.formatDate(harness.component.createdAfter.value)
    ).toMatch('1983-06-21');
  });

  it('it should return classifer lables in an array', () => {
    const testClassifier: Classifier = {
      domainType: CatalogueItemDomainType.Classifier,
      label: 'testLabel1'
    };
    const testClassifier2: Classifier = {
      domainType: CatalogueItemDomainType.Classifier,
      label: 'testLabel2'
    };
    const classifiers: Classifier[] = [testClassifier, testClassifier2];
    harness.component.classifiers.setValue(classifiers);

    expect(harness.component.classifierNames).toEqual([
      'testLabel1',
      'testLabel2'
    ]);
  });
});
