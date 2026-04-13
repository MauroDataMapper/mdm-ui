/*
Copyright 2020-2025 University of Oxford and NHS England

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
import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';
import { LocationPathComponent } from './location-path.component';

describe('LocationPathComponent', () => {
  let harness: ComponentHarness<LocationPathComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(LocationPathComponent);
  });

  it('should create', () => {
    expect(harness?.isComponentCreated).toBeTruthy();
  });

  it('should build breadcrumb items from an uppercase merge path', () => {
    harness.detectChanges((component) => {
      component.path = 'FO:Root Folder|DC:Clinical Data@description';
    });

    expect(harness.component.items).toEqual([
      expect.objectContaining({
        label: 'Root Folder',
        icon: 'fa-folder',
        typeName: 'Folder'
      }),
      expect.objectContaining({
        label: 'Clinical Data',
        icon: 'fa-puzzle-piece',
        typeName: 'Data class',
        propertyName: 'description'
      })
    ]);
  });

  it('should skip the first breadcrumb item when configured', () => {
    harness.detectChanges((component) => {
      component.path = 'FO:Root Folder|DC:Clinical Data@description';
      component.skipFirst = true;
    });

    expect(harness.component.items).toEqual([
      expect.objectContaining({
        label: 'Clinical Data',
        icon: 'fa-puzzle-piece',
        typeName: 'Data class',
        propertyName: 'description'
      })
    ]);
  });
});


