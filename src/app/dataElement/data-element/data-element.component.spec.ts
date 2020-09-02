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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { AnnotationListComponent } from '@mdm/shared/annotation-list/annotation-list.component';
import { AttachmentListComponent } from '@mdm/shared/attachment-list/attachment-list.component';
import { ElementDataTypeComponent } from '@mdm/shared/element-data-type/element-data-type.component';
import { ElementLinkListComponent } from '@mdm/shared/element-link-list/element-link-list.component';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { McDataSetMetadataComponent } from '@mdm/shared/mc-data-set-metadata/mc-data-set-metadata.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MoreDescriptionComponent } from '@mdm/shared/more-description/more-description.component';
import { SummaryMetadataTableComponent } from '@mdm/shared/summary-metadata/summary-metadata-table/summary-metadata-table.component';
import { TableButtonsComponent } from '@mdm/shared/table-buttons/table-buttons.component';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { McEnumerationListWithCategoryComponent } from '@mdm/utility/mc-enumeration-list-with-category/mc-enumeration-list-with-category.component';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { NewDataTypeInlineComponent } from '@mdm/utility/new-data-type-inline/new-data-type-inline.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DataElementDetailsComponent } from '../data-element-details/data-element-details.component';
import { DataElementComponent } from './data-element.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { SummaryMetadataChartComponent } from '@mdm/shared/summary-metadata/summary-metadata-chart/summary-metadata-chart.component';
import { ChartsModule } from 'ng2-charts';
import { FileSizePipe } from '@mdm/directives/file-size.pipe';


describe('DataElementComponent', () => {
  let component: DataElementComponent;
  let fixture: ComponentFixture<DataElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // TestModule
        NgxSkeletonLoaderModule,
        MatTabsModule,
        MatProgressBarModule,
        MatSortModule,
        MatOptionModule,
        DragDropModule,
        MatIconModule,
        FoldersTreeModule,
        MatSelectModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatTooltipModule,
        ChartsModule,
        MatFormFieldModule,
        MatTableModule,
        FormsModule
      ],
      declarations: [
        DataElementDetailsComponent,
        McDataSetMetadataComponent,
        InlineTextEditComponent,
        FileSizePipe,
        ProfilePictureComponent,
        ElementAliasComponent,
        SummaryMetadataChartComponent,
        ByteArrayToBase64Pipe,
        McEnumerationListWithCategoryComponent,
        InlineTextEditComponent,
        ModelSelectorTreeComponent,
        MarkdownTextAreaComponent,
        ElementDataTypeComponent,
        MarkdownDirective,
        NewDataTypeInlineComponent,
        McSelectComponent,
        ElementLinkComponent,
        MoreDescriptionComponent,
        ModelPathComponent,
        TableButtonsComponent,
        MdmPaginatorComponent,
        ElementClassificationsComponent,
        EditableFormButtonsComponent,
        PropertiesDirective,
        AnnotationListComponent,
        ElementLinkListComponent,
        SummaryMetadataTableComponent,
        AttachmentListComponent,
        DataElementComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
