/*
Copyright 2020-2021 University of Oxford
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
import { TestBed } from '@angular/core/testing';

import { LinkCreatorService } from './link-creator.service';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';

describe('LinkCreatorService', () => {
  let service: LinkCreatorService;

  beforeEach(() => {
    service = setupTestModuleForService(LinkCreatorService);

    // TestBed.configureTestingModule({
    //   imports: [
    //     UIRouterModule.forRoot({ useHash: true }),
    //     ToastrModule.forRoot()
    //   ],
    //   providers: [ElementTypesService]

    // });
    // service = TestBed.inject(LinkCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
