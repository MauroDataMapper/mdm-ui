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
import { GroupAccessNewComponent } from './group-access-new.component';
import { TestModule } from '@mdm/modules/test/test.module';
import { MatTableModule } from '@angular/material/table';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { empty } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('GroupAccessNewComponent', () => {
  let component: GroupAccessNewComponent;
  let fixture: ComponentFixture<GroupAccessNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // TestModule
        NgxSkeletonLoaderModule,
        MatTableModule,
        MatPaginatorModule,
        FormsModule,
        NoopAnimationsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            securableResource: {
              // tslint:disable-next-line: deprecation
              getGroupRoles: () => empty()
            },
            session: {
              // tslint:disable-next-line: deprecation
              isAuthenticated: () => empty()
            }
          }
        }
      ],
      declarations: [
        McSelectComponent,
        MdmPaginatorComponent,
        GroupAccessNewComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAccessNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
