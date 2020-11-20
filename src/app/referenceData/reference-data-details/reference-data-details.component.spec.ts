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

import { ReferenceDataDetailsComponent } from './reference-data-details.component';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { ToastrModule } from 'ngx-toastr';
import { UIRouterModule } from '@uirouter/angular';
import { MatDialogModule } from '@angular/material/dialog';
import { empty } from 'rxjs/internal/observable/empty';
import { MatMenuModule } from '@angular/material/menu';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('ReferenceDataModelDetailsComponent', () => {
  let component: ReferenceDataDetailsComponent;
  let fixture: ComponentFixture<ReferenceDataDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatMenuModule,
        MatTooltipModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            session: {
              // tslint:disable-next-line: deprecation
              isAuthenticated: () => empty()
            },
            tree: {
              list: jest.fn()
            }
          }
        }
      ],
      declarations: [
        ReferenceDataDetailsComponent,
        ElementAliasComponent,
        EditableFormButtonsComponent
       ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceDataDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
