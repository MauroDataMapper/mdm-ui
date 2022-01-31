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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferenceDataTypeComponent } from './reference-data-type.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { empty } from 'rxjs';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';

describe('ReferenceDataTypeComponent', () => {
  let component: ReferenceDataTypeComponent;
  let fixture: ComponentFixture<ReferenceDataTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
              // tslint:disable-next-line: deprecation
              list: () => empty()
            }
          }
        }
      ],
      declarations: [
         ReferenceDataTypeComponent,
         MdmPaginatorComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceDataTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
