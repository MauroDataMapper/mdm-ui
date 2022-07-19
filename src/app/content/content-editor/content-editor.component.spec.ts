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
import { UserSettingsHandlerService } from '@mdm/services';
import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';

import { ContentEditorComponent } from './content-editor.component';

describe('ContentEditorComponent', () => {
  let harness: ComponentHarness<ContentEditorComponent>;

  const userSettingsStub = {
    get: jest.fn()
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(ContentEditorComponent, {
      providers: [
        {
          provide: UserSettingsHandlerService,
          useValue: userSettingsStub
        }
      ]
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});