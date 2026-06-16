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
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { ModelsTreeTabStateService } from './models-tree-tab-state.service';

describe('ModelsTreeTabStateService', () => {
  let service: ModelsTreeTabStateService;

  beforeEach(() => {
    service = setupTestModuleForService(ModelsTreeTabStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should consume and clear the next active tab', () => {
    service.setNextActiveTab('favourites');

    expect(service.consumeNextActiveTab()).toBe('favourites');
    expect(service.consumeNextActiveTab()).toBeUndefined();
  });
});
