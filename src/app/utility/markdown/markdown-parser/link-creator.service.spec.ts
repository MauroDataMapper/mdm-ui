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

import { LinkCreatorService } from './link-creator.service';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';

describe('LinkCreatorService', () => {
  let service: LinkCreatorService;

  beforeEach(() => {
    service = setupTestModuleForService(LinkCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('render urls as HTML', () => {
    expect(service.createLink('http://localhost', '', 'link')).toEqual('http://localhost');
  });

  it('render emails as HTML', () => {
    expect(service.createLink('mailto:user@test.com', '', 'email')).toEqual('mailto:user@test.com');
  });
});
