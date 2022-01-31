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
import { TestBed } from '@angular/core/testing';

import { UserSettingsHandlerService } from './user-settings-handler.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MdmResourcesService } from '@mdm/modules/resources';

describe('UserSettingsHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      UIRouterModule.forRoot({ useHash: true }),
      ToastrModule.forRoot()
    ],
    providers: [
      {
        provide: MdmResourcesService, useValue: {}
      },
      ElementTypesService
    ]
  }));

  it('should be created', () => {
    const service: UserSettingsHandlerService = TestBed.inject(UserSettingsHandlerService);
    expect(service).toBeTruthy();
  });
});
