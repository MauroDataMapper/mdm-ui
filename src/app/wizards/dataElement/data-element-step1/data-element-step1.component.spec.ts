/*
Copyright 2020-2021 University of Oxford
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

import { DataElementStep1Component } from './data-element-step1.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { MatRadioModule } from '@angular/material/radio';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { FormsModule } from '@angular/forms';

describe('DataElementStep1Component', () => {
  let component: DataElementStep1Component;
  let fixture: ComponentFixture<DataElementStep1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatRadioModule,
        MatTooltipModule,
        FoldersTreeModule,
        FormsModule
      ],
      declarations: [
        ElementLinkComponent,
        ModelSelectorTreeComponent,
        DataElementStep1Component
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
