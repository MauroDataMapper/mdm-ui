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

import { CodeSetComponent } from './code-set.component';
import { TestModule } from '@mdm/modules/test/test.module';
import { CodeSetDetailsComponent } from '../code-set-details/code-set-details.component';
import { AllLinksInPagedListComponent } from '@mdm/utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CodeSetTermsTableComponent } from '@mdm/shared/code-set-terms-table/code-set-terms-table.component';
import { McDataSetMetadataComponent } from '@mdm/shared/mc-data-set-metadata/mc-data-set-metadata.component';
import { AnnotationListComponent } from '@mdm/shared/annotation-list/annotation-list.component';
import { HistoryComponent } from '@mdm/folder/history.component';
import { ElementLinkListComponent } from '@mdm/shared/element-link-list/element-link-list.component';
import { AttachmentListComponent } from '@mdm/shared/attachment-list/attachment-list.component';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { FormsModule } from '@angular/forms';
import { ElementStatusComponent } from '@mdm/utility/element-status/element-status.component';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { MatMenuModule } from '@angular/material/menu';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { ShareWithComponent } from '@mdm/access/share-with/share-with.component';
import { GroupAccessNewComponent } from '@mdm/access/group-access-new.component';
import { MultipleTermsSelectorComponent } from '@mdm/utility/multiple-terms-selector/multiple-terms-selector.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { TableButtonsComponent } from '@mdm/shared/table-buttons/table-buttons.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { MoreDescriptionComponent } from '@mdm/shared/more-description/more-description.component';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HighlighterPipe } from '@mdm/pipes/highlighter.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import { FileSizePipe } from '@mdm/directives/file-size.pipe';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CodeSetComponent', () => {
  let component: CodeSetComponent;
  let fixture: ComponentFixture<CodeSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // TestModule
        MatTabsModule,
        MatMenuModule,
        MatOptionModule,
        MatTableModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatSelectModule,
        MatFormFieldModule,
        MatPaginatorModule,
        NoopAnimationsModule,
        MatDialogModule,
        MatSortModule,
        FormsModule,
        NgxSkeletonLoaderModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService, useValue: {}
        }
      ],
      declarations: [
        CodeSetDetailsComponent,
        HighlighterPipe,
        PropertiesDirective,
        CodeSetTermsTableComponent,
        FileSizePipe,
        McDataSetMetadataComponent,
        McPagedListComponent,
        ProfilePictureComponent,
        AnnotationListComponent,
        ElementLinkComponent,
        HistoryComponent,
        ElementLinkListComponent,
        McSelectComponent,
        MultipleTermsSelectorComponent,
        ByteArrayToBase64Pipe,
        InlineTextEditComponent,
        AttachmentListComponent,
        ElementStatusComponent,
        EditableFormButtonsComponent,
        MoreDescriptionComponent,
        ShareWithComponent,
        TableButtonsComponent,
        GroupAccessNewComponent,
        MdmPaginatorComponent,
        ElementAliasComponent,
        MarkdownTextAreaComponent,
        ElementClassificationsComponent,
        MarkdownDirective,
        AllLinksInPagedListComponent,
        CodeSetComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
