/*
Copyright 2021 University of Oxford

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
import { MdmResourcesService } from '@mdm/modules/resources';

import { SubscribedCataloguesService } from './subscribed-catalogues.service';

describe('SubscribedCataloguesService', () => {
  let service: SubscribedCataloguesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {}
        }
      ]
    });
    service = TestBed.inject(SubscribedCataloguesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});