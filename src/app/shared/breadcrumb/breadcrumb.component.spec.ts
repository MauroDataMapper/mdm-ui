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
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';

import { BreadcrumbComponent, TrailableItem } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let harness: ComponentHarness<BreadcrumbComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BreadcrumbComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.item).toBeUndefined();
  });

  it('should render a crumb per item in the breadcrumb', () => {
    const dom = harness.fixture.nativeElement;

    const item: TrailableItem = {
      id: '1',
      label: 'item',
      domainType: CatalogueItemDomainType.DataElement,
      breadcrumbs: [
        {
          id: '2',
          label: 'root',
          domainType: CatalogueItemDomainType.DataModel
        },
        {
          id: '3',
          label: 'parent',
          domainType: CatalogueItemDomainType.DataClass
        }
      ]
    };

    harness.component.item = item;
    harness.detectChanges();

    const crumbSpans = dom.querySelectorAll('span');
    // Note: don't display breadcrumb for the data model
    expect(crumbSpans.length).toBe(item.breadcrumbs!.length + 1); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  });
});
