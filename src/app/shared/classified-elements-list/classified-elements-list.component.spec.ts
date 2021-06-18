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

import { ClassifiedElementsListComponent } from './classified-elements-list.component';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UIRouterModule } from '@uirouter/angular';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PortalModule } from '@angular/cdk/portal';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { MoreDescriptionComponent } from '../more-description/more-description.component';
import { AllLinksInPagedListComponent } from '@mdm/utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import { MdmResourcesService } from '@mdm/modules/resources';

describe('ClassifiedElementsListComponent', () => {
  let component: ClassifiedElementsListComponent;
  let fixture: ComponentFixture<ClassifiedElementsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot(),
        MatTableModule,
        MaterialModule.forRoot(),
        FormsModule,
        BrowserAnimationsModule,
        PortalModule,
        OverlayModule,
        NgxSkeletonLoaderModule
      ],
      providers: [
        {
          provide: MdmResourcesService, useValue: {}
        },
        ElementTypesService
      ],
      declarations: [
        ClassifiedElementsListComponent,
        ElementLinkComponent,
        ModelPathComponent,
        McPagedListComponent,
        MoreDescriptionComponent,
        AllLinksInPagedListComponent,
        MdmPaginatorComponent
      ]
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
