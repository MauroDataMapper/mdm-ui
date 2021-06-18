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

import { ElementClassificationsComponent } from './element-classifications.component';
import { MatSelectModule } from '@angular/material/select';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';
import { empty } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

describe('ElementClassificationsComponent', () => {
  let component: ElementClassificationsComponent;
  let fixture: ComponentFixture<ElementClassificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot(),
        MatInputModule,
        MatFormFieldModule
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            classifier: {
              // tslint:disable-next-line: deprecation
              list: () => empty()
            }
          }
        }
      ],
      declarations: [
        PropertiesDirective,
        ElementClassificationsComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementClassificationsComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
