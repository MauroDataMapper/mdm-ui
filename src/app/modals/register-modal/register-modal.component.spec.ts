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
import { RegisterModalComponent } from './register-modal.component';
import '@mdm/utility/extensions/mat-legacy-dialog.extensions';
import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';

describe('RegisterModalComponent', () => {
  let harness: ComponentHarness<RegisterModalComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(RegisterModalComponent)
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
