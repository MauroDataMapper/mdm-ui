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
import { MatDialog } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { UIRouterGlobals } from '@uirouter/core';

import { AsyncJobDetailComponent } from './async-job-detail.component';

describe('AsyncJobDetailComponent', () => {
  let harness: ComponentHarness<AsyncJobDetailComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(AsyncJobDetailComponent, {
      declarations: [AsyncJobDetailComponent],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: jest.fn()
        },
        {
          provide: UIRouterGlobals,
          useValue: jest.fn()
        },
        {
          provide: MessageHandlerService,
          useValue: jest.fn()
        },
        {
          provide: StateHandlerService,
          useValue: jest.fn()
        },
        {
          provide: MatDialog,
          useValue: jest.fn()
        }
      ]
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
