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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReferenceDataElementComponent } from './reference-data-element.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { EMPTY } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SkeletonBadgeComponent } from '@mdm/utility/skeleton-badge/skeleton-badge.component';

describe('ReferenceDataElementComponent', () => {
  let component: ReferenceDataElementComponent;
  let fixture: ComponentFixture<ReferenceDataElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatPaginatorModule,
        MatDialogModule,
        NgxSkeletonLoaderModule,
        MatTableModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            referenceDataElement: {
              // tslint:disable-next-line: deprecation
              list: () => EMPTY
            }
          }
        }
      ],
      declarations: [
        ReferenceDataElementComponent,
        MdmPaginatorComponent,
        SkeletonBadgeComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceDataElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
