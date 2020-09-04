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

import { ClassifierMainComponent } from './classifier-main.component';
import { TestModule } from '@mdm/modules/test/test.module';
import { DclWrapperComponent } from '@mdm/wizards/dcl-wrapper.component';
import { MatStepperModule } from '@angular/material/stepper';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';
import { empty } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ClassifierMainComponent', () => {
  let component: ClassifierMainComponent;
  let fixture: ComponentFixture<ClassifierMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // TestModule
        MatStepperModule,
        NoopAnimationsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            folder: {
              get: () => empty()
            }
          }
        }
      ],
      declarations: [
        DclWrapperComponent,
        ClassifierMainComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassifierMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
