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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MdmResourcesService } from '@mdm/modules/resources';
import { EMPTY } from 'rxjs';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { ReferenceDataValuesComponent } from './reference-data-values.component';
import { FormsModule } from '@angular/forms';
import { SkeletonBadgeComponent } from '@mdm/utility/skeleton-badge/skeleton-badge.component';

describe('ReferenceDataValuesComponent', () => {
  let component: ReferenceDataValuesComponent;
  let fixture: ComponentFixture<ReferenceDataValuesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatPaginatorModule,
        NgxSkeletonLoaderModule,
        MatTableModule,
        NoopAnimationsModule,
        FormsModule
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            referenceDataValue: {
              // tslint:disable-next-line: deprecation
              list: () => EMPTY,
              // tslint:disable-next-line: deprecation
              search: () => EMPTY
            }
          }
        }
      ],
      declarations: [ReferenceDataValuesComponent, MdmPaginatorComponent, SkeletonBadgeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceDataValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
