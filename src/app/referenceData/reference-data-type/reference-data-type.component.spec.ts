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
import { ReferenceDataTypeComponent } from './reference-data-type.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { EMPTY } from 'rxjs';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { StateHandlerService } from '@mdm/services';

describe('ReferenceDataTypeComponent', () => {
  let harness: ComponentHarness<ReferenceDataTypeComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(ReferenceDataTypeComponent, {
      imports: [
        NgxSkeletonLoaderModule,
        MatPaginatorModule,
        MatTableModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            referenceDataType: {
              list: () => EMPTY
            }
          }
        },
        {
          provide: StateHandlerService,
          useValue: jest.fn()
        }
      ],
      declarations: [ReferenceDataTypeComponent, MdmPaginatorComponent]
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
