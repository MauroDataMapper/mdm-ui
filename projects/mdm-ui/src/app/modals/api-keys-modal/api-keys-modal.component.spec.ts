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

import { ApiKeysModalComponent } from './api-keys-modal.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

describe('ApiKeysModalComponent', () => {
  let component: ApiKeysModalComponent;
  let fixture: ComponentFixture<ApiKeysModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
         MatRadioModule,
         MatDialogModule,
         MatFormFieldModule,
         MatInputModule,
         BrowserAnimationsModule,
         FormsModule,
         MatButtonModule
       ],
       providers: [{provide : MatDialogRef, useValue : {}}, { provide: MAT_DIALOG_DATA, useValue: {} }],
      declarations: [ ApiKeysModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiKeysModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
