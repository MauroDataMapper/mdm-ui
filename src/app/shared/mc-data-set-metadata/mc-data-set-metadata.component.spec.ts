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
import { McDataSetMetadataComponent } from './mc-data-set-metadata.component';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { TableButtonsComponent } from '../table-buttons/table-buttons.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { MoreDescriptionComponent } from '../more-description/more-description.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { FormsModule } from '@angular/forms';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('McDataSetMetadataComponent', () => {
  let component: McDataSetMetadataComponent;
  let fixture: ComponentFixture<McDataSetMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSkeletonLoaderModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatTableModule,
        MatDialogModule,
        NoopAnimationsModule,
        MatInputModule,
        MatSortModule,
        MatCheckboxModule,
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
        MdmPaginatorComponent,
        McSelectComponent,
        TableButtonsComponent,
        MarkdownTextAreaComponent,
        MarkdownDirective,
        MoreDescriptionComponent,
        McDataSetMetadataComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(McDataSetMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
