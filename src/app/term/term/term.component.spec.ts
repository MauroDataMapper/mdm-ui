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
import { TermComponent } from './term.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AttachmentListComponent } from '@mdm/shared/attachment-list/attachment-list.component';
import { ElementLinkListComponent } from '@mdm/shared/element-link-list/element-link-list.component';
import { AnnotationListComponent } from '@mdm/shared/annotation-list/annotation-list.component';
import { McDataSetMetadataComponent } from '@mdm/shared/mc-data-set-metadata/mc-data-set-metadata.component';
import { TermRelationshipsComponent } from '@mdm/utility/term-relationships/term-relationships.component';
import { TermDetailsComponent } from '../term-details/term-details.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { TableButtonsComponent } from '@mdm/shared/table-buttons/table-buttons.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { FileSizePipe } from '@mdm/directives/file-size.pipe';
import { MatSortModule } from '@angular/material/sort';
import { HighlighterPipe } from '@mdm/pipes/highlighter.pipe';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { FormsModule } from '@angular/forms';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { MoreDescriptionComponent } from '@mdm/shared/more-description/more-description.component';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TermComponent', () => {
  let component: TermComponent;
  let fixture: ComponentFixture<TermComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatTabsModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatToolbarModule,
        MatTableModule,
        MatSelectModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatOptionModule,
        MatDialogModule,
        MatSortModule,
        NoopAnimationsModule,
        NgxSkeletonLoaderModule,
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
        AttachmentListComponent,
        ElementLinkListComponent,
        ProfilePictureComponent,
        ElementAliasComponent,
        PropertiesDirective,
        ElementClassificationsComponent,
        InlineTextEditComponent,
        ByteArrayToBase64Pipe,
        McPagedListComponent,
        McSelectComponent,
        MoreDescriptionComponent,
        MarkdownTextAreaComponent,
        MarkdownDirective,
        TableButtonsComponent,
        FileSizePipe,
        AnnotationListComponent,
        HighlighterPipe,
        ElementLinkComponent,
        MdmPaginatorComponent,
        McDataSetMetadataComponent,
        TermRelationshipsComponent,
        TermDetailsComponent,
        TermComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
