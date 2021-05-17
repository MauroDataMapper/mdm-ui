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
import { CodeSetTermsTableComponent } from './code-set-terms-table.component';
import { MatSortModule } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MultipleTermsSelectorComponent } from '@mdm/utility/multiple-terms-selector/multiple-terms-selector.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { TableButtonsComponent } from '../table-buttons/table-buttons.component';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import { FormsModule } from '@angular/forms';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ToastrModule } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CodeSetTermsTableComponent', () => {
  let component: CodeSetTermsTableComponent;
  let fixture: ComponentFixture<CodeSetTermsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSkeletonLoaderModule,
        MatTableModule,
        MatFormFieldModule,
        MatTooltipModule,
        NoopAnimationsModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatInputModule,
        MatSortModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService, useValue: {}
        }
      ],
      declarations: [
        ProfilePictureComponent,
        McPagedListComponent,
        ByteArrayToBase64Pipe,
        MultipleTermsSelectorComponent,
        ElementLinkComponent,
        ElementAliasComponent,
        McSelectComponent,
        TableButtonsComponent,
        MdmPaginatorComponent,
        PropertiesDirective,
        CodeSetTermsTableComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSetTermsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
