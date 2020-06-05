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

import { DataElementStep2Component } from './data-element-step2.component';
import { HttpClientModule } from '@angular/common/http';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { TestModule } from '@mdm/modules/test/test.module';
import { NgForm, FormsModule } from '@angular/forms';

describe('DataElementStep2Component', () => {
  let component: DataElementStep2Component;
  let fixture: ComponentFixture<DataElementStep2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot(),
        TestModule,        
      ],
      declarations: [DataElementStep2Component, NgForm],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementStep2Component);
    component = fixture.componentInstance;
    component.step = { scope: { model: {} } };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
