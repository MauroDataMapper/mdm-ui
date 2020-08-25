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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorComponent } from './error.component';
import { TestModule } from '@mdm/modules/test/test.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';
import { HttpClientModule } from '@angular/common/http';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // TestModule
        NgxSkeletonLoaderModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        NgxJsonViewerModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot(),
        HttpClientModule
      ],
      providers: [
        { provide: MdmResourcesService, useValue: {} }
      ],
      declarations: [ ErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
