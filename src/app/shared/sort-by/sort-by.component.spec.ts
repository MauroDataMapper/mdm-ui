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
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { MockComponent, MockDirective } from 'ng-mocks';
import { SortByComponent } from './sort-by.component';

describe('SortByComponent', () => {
  let harness: ComponentHarness<SortByComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(SortByComponent, {
      declarations: [
        MockComponent(MatFormField),
        MockDirective(MatLabel),
        MockComponent(MatSelect),
      ],
      providers: [],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should fire an update when new option selected', () => {
    const sortByOption = { value: 'val', displayName: 'name' };
    const changedSortByOption = { value: 'new-val', displayName: 'new-name' };
    const matChange = { value: changedSortByOption } as MatSelectChange;
    const spy = jest.spyOn(harness.component.valueChange, 'emit');

    harness.component.value = sortByOption;
    harness.component.select(matChange);

    expect(spy).toHaveBeenCalled();
  });
});
