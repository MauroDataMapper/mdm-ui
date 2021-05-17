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
import { CodeSetDetailsComponent } from './code-set-details.component';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { ElementStatusComponent } from '@mdm/utility/element-status/element-status.component';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { MatMenuModule } from '@angular/material/menu';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { ShareWithComponent } from '@mdm/access/share-with/share-with.component';
import { GroupAccessNewComponent } from '@mdm/access/group-access-new.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import '@mdm/utility/extensions/mat-dialog.extensions';

describe('CodeSetDetailsComponent', () => {
  let component: CodeSetDetailsComponent;
  let fixture: ComponentFixture<CodeSetDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSkeletonLoaderModule,
        MatTooltipModule,
        MatMenuModule,
        MatCheckboxModule,
        MatTableModule,
        MatPaginatorModule,
        MatOptionModule,
        MatDialogModule,
        MatSelectModule,
        MatFormFieldModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {}
        }
      ],
      declarations: [
        McSelectComponent,
        MdmPaginatorComponent,
        EditableFormButtonsComponent,
        ShareWithComponent,
        GroupAccessNewComponent,
        InlineTextEditComponent,
        ElementStatusComponent,
        ElementAliasComponent,
        MarkdownTextAreaComponent,
        ElementClassificationsComponent,
        ProfilePictureComponent,
        PropertiesDirective,
        MarkdownDirective,
        ByteArrayToBase64Pipe,
        CodeSetDetailsComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
