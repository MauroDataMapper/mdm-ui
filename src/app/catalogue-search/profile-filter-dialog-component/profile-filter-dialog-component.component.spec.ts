/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileFilterDialogComponent } from './profile-filter-dialog-component';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MockComponent, MockDirective } from 'ng-mocks';
import { CatalogueSearchProfileFilterListComponent } from '@mdm/catalogue-search/catalogue-search-profile-filter-list/catalogue-search-profile-filter-list.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ClassifierIndexResponse, FilterQueryParameters, ProfileSummaryIndexResponse } from '../../../../../mdm-resources';
import { Observable } from 'rxjs';

describe('ProfileFilterDialogComponent', () => {
  let component: ProfileFilterDialogComponent;
  let fixture: ComponentFixture<ProfileFilterDialogComponent>;

  const resourcesStub = {
    classifier: {
      list: jest.fn() as jest.MockedFunction<
        (query?: FilterQueryParameters) => Observable<ClassifierIndexResponse>
      >
    },
    profile: {
      providers: jest.fn() as jest.MockedFunction<
        () => Observable<ProfileSummaryIndexResponse>
      >
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ProfileFilterDialogComponent,
        MockComponent(CatalogueSearchProfileFilterListComponent),
        MockDirective(MatDialogContent),
        MockDirective(MatDialogActions)],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jest.fn()
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: jest.fn()
        },
        {
          provide: MdmResourcesService,
          useValue: resourcesStub
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
