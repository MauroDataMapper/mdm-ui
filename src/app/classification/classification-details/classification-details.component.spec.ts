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

import { ClassificationDetailsComponent } from './classification-details.component';
import { TestModule } from '@mdm/modules/test/test.module';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { ShareWithComponent } from '@mdm/access/share-with/share-with.component';
import { GroupAccessNewComponent } from '@mdm/access/group-access-new.component';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { MatTableModule } from '@angular/material/table';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';

describe('ClassificationDetailsComponent', () => {
  let component: ClassificationDetailsComponent;
  let fixture: ComponentFixture<ClassificationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // TestModule
        NgxSkeletonLoaderModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatTableModule,
        MatDialogModule,
        MatPaginatorModule,
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
        MarkdownDirective,
        InlineTextEditComponent,
        MarkdownTextAreaComponent,
        EditableFormButtonsComponent,
        ShareWithComponent,
        GroupAccessNewComponent,
        ProfilePictureComponent,
        ByteArrayToBase64Pipe,
        ClassificationDetailsComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationDetailsComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
