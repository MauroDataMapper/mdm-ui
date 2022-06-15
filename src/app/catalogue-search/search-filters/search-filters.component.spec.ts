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
import { MatSelectChange } from '@angular/material/select';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '@mdm/testing/testing.helpers';

import { SearchFiltersComponent } from './search-filters.component';

describe('SearchFiltersComponent', () => {
  let harness: ComponentHarness<SearchFiltersComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(SearchFiltersComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('has values', () => {
    it('should have no values in an empty fields list', () => {
      expect(harness.component.hasValues).toBeFalsy();
    });

    it('should have no values when fields have no value', () => {
      harness.component.fields = [
        {
          name: 'filter1',
          label: 'filter1',
          dataType: 'enumeration',
        },
        {
          name: 'filter2',
          label: 'filter2',
          dataType: 'enumeration',
        },
      ];

      expect(harness.component.hasValues).toBeFalsy();
    });

    it('should have values when at least one field has a value', () => {
      harness.component.fields = [
        {
          name: 'filter1',
          label: 'filter1',
          dataType: 'enumeration',
          currentValue: 'test',
        },
        {
          name: 'filter2',
          label: 'filter2',
          dataType: 'enumeration',
        },
      ];

      expect(harness.component.hasValues).toBeTruthy();
    });
  });

  describe('event handlers', () => {
    it('should raise a filter change event when a value has changed', () => {
      const spy = jest.spyOn(harness.component.filterChange, 'emit');
      const name = 'testFilter';
      const event = { value: 'val' } as MatSelectChange;

      harness.component.selectionChanged(name, event);
      expect(spy).toHaveBeenCalledWith({ name, value: event.value });
    });

    it('should raise a filter change event to clear a single filter', () => {
      const spy = jest.spyOn(harness.component.filterChange, 'emit');
      const name = 'testFilter';

      harness.component.clearSelection(name);
      expect(spy).toHaveBeenCalledWith({ name });
    });

    it('should raise a filter reset event to clear all filters', () => {
      const spy = jest.spyOn(harness.component.filterReset, 'emit');
      harness.component.clearAll();
      expect(spy).toHaveBeenCalled();
    });
  });
});
