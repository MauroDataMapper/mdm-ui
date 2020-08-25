/*
Copyright 2020 University of Oxford

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
import {TestBed} from '@angular/core/testing';

import { YoutrackService } from './youtrack.service';
import { HttpClientModule } from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {SharedService} from '@mdm/services/shared.service';
import {SecurityHandlerService} from '@mdm/services/handlers/security-handler.service';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';

describe('YoutrackService', () => {
  let service: YoutrackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {}
        },
        ElementTypesService
      ]
    });
    service = TestBed.inject(YoutrackService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
