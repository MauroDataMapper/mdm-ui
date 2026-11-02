/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { ChangeDetectorRef } from '@angular/core';
import { ValidatorService } from '@mdm/services/validator.service';
import { of } from 'rxjs';
import { McSelectComponent } from './mc-select.component';

describe('McSelectComponent', () => {
  let component: McSelectComponent;
  const changeRef = { detectChanges: jest.fn() };
  const validator = {} as ValidatorService;

  beforeEach(() => {
    component = new McSelectComponent(
      changeRef as unknown as ChangeDetectorRef,
      validator,
      {} as Document
    );
    component.valueType = 'dynamic';
    component.inputText = 'term';
    component.displayValues = [{ id: 'one' }, { id: 'two' }];
    component.pagination = { offset: 0, limit: 2, count: 4 };
    component.loadingDynamicData = false;
    changeRef.detectChanges.mockClear();
  });

  it('loads and appends the next page when the dropdown is scrolled near the bottom', () => {
    component.loadDynamicValues = jest.fn(() =>
      of({ body: { items: [{ id: 'three' }, { id: 'four' }], count: 4 } })
    );
    component.record = { fieldName: 'Terminology terms' };

    component.onScroll({
      target: { scrollTop: 100, clientHeight: 200, scrollHeight: 500 }
    });

    expect(component.loadDynamicValues).toHaveBeenCalledWith(
      'term',
      false,
      2,
      2,
      component.record
    );
    expect(component.displayValues).toEqual([
      { id: 'one' },
      { id: 'two' },
      { id: 'three' },
      { id: 'four' }
    ]);
    expect(component.pagination).toEqual({ offset: 2, limit: 2, count: 4 });
  });

  it('does not request another page after all reported results have loaded', () => {
    component.loadDynamicValues = jest.fn();
    component.pagination = { offset: 0, limit: 2, count: 2 };

    component.onScroll({
      target: { scrollTop: 100, clientHeight: 200, scrollHeight: 500 }
    });

    expect(component.loadDynamicValues).not.toHaveBeenCalled();
  });
});
