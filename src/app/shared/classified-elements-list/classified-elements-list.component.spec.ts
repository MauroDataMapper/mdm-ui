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

import { ClassifiedElementsListComponent } from './classified-elements-list.component';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { UIRouterModule } from '@uirouter/angular';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { MatSelect } from '@angular/material/select';
import { CdkOverlayOrigin, OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PortalModule } from '@angular/cdk/portal';

describe('ClassifiedElementsListComponent', () => {
  let component: ClassifiedElementsListComponent;
  let fixture: ComponentFixture<ClassifiedElementsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ElementTypesService],
      imports: [
        HttpClientModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot(),
        MatTableModule,
        MaterialModule.forRoot(),
        FormsModule,
        BrowserAnimationsModule,
        PortalModule,
        OverlayModule],
      declarations: [
        ClassifiedElementsListComponent,
        MdmPaginatorComponent,
        MatPaginator,
        MatTooltip,
        MatSelect,
        CdkOverlayOrigin ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassifiedElementsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
