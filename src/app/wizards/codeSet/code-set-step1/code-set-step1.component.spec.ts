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

import { CodeSetStep1Component } from './code-set-step1.component';
import { TestModule } from '@mdm/modules/test/test.module';
import { FormsModule, FormBuilder } from '@angular/forms';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { MultipleTermsSelectorComponent } from '@mdm/utility/multiple-terms-selector/multiple-terms-selector.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';
import { empty } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CodeSetStep1Component', () => {
  let component: CodeSetStep1Component;
  let fixture: ComponentFixture<CodeSetStep1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // TestModule
        FormsModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        MatInputModule,
        NoopAnimationsModule,
        MatTableModule,
        MatCheckboxModule,
        MatTooltipModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: FormBuilder, useValue: {}
        },
        {
          provide: MdmResourcesService,
          useValue: {
            terminology: {
              list: () => empty()
            },
            classifier: {
              list: () => empty()
            }
          }
        }
      ],
      declarations: [
        ElementLinkComponent,
        PropertiesDirective,
        ElementClassificationsComponent,
        McPagedListComponent,
        McSelectComponent,
        MultipleTermsSelectorComponent,
        CodeSetStep1Component
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSetStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
