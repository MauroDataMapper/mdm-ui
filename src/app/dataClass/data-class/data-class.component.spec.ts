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
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileSizePipe } from '@mdm/directives/file-size.pipe';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { AdvancedSearchBarComponent } from '@mdm/search/advanced-search-bar/advanced-search-bar.component';
import { DateFromToComponent } from '@mdm/search/date-from-to/date-from-to.component';
import { AnnotationListComponent } from '@mdm/shared/annotation-list/annotation-list.component';
import { AttachmentListComponent } from '@mdm/shared/attachment-list/attachment-list.component';
import { ContentTableComponent } from '@mdm/shared/content-table/content-table.component';
import { ElementDataTypeComponent } from '@mdm/shared/element-data-type/element-data-type.component';
import { ElementLinkListComponent } from '@mdm/shared/element-link-list/element-link-list.component';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { McDataSetMetadataComponent } from '@mdm/shared/mc-data-set-metadata/mc-data-set-metadata.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MoreDescriptionComponent } from '@mdm/shared/more-description/more-description.component';
import { MultiplicityComponent } from '@mdm/shared/multiplicity/multiplicity.component';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { SummaryMetadataChartComponent } from '@mdm/shared/summary-metadata/summary-metadata-chart/summary-metadata-chart.component';
import { SummaryMetadataTableComponent } from '@mdm/shared/summary-metadata/summary-metadata-table/summary-metadata-table.component';
import { TableButtonsComponent } from '@mdm/shared/table-buttons/table-buttons.component';
import { AllLinksInPagedListComponent } from '@mdm/utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { ChartsModule } from 'ng2-charts';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DataClassDetailsComponent } from '../data-class-details/data-class-details.component';
import { DataClassComponent } from './data-class.component';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { empty } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import '@mdm/utility/extensions/mat-dialog.extensions'


describe('DataClassComponent', () => {
  let component: DataClassComponent;
  let fixture: ComponentFixture<DataClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSkeletonLoaderModule,
        MatTooltipModule,
        MatTabsModule,
        MatMenuModule,
        MatDividerModule,
        MatCheckboxModule,
        MatTableModule,
        MatCheckboxModule,
        MatOptionModule,
        MatFormFieldModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatCardModule,
        MatProgressBarModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        FoldersTreeModule,
        ChartsModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            dataClass: {
              // tslint:disable-next-line: deprecation
              getChildDataClass: () => empty(),
              // tslint:disable-next-line: deprecation
              get: () => empty()
            }
          }
        }
      ],
      declarations: [
        ProfilePictureComponent,
        ContentTableComponent,
        McDataSetMetadataComponent,
        AnnotationListComponent,
        ElementLinkListComponent,
        InlineTextEditComponent,
        PropertiesDirective,
        DataClassDetailsComponent,
        ElementAliasComponent,
        DateFromToComponent,
        ModelSelectorTreeComponent,
        ElementLinkComponent,
        MoreDescriptionComponent,
        ModelPathComponent,
        ElementClassificationsComponent,
        McSelectComponent,
        EditableFormButtonsComponent,
        MarkdownTextAreaComponent,
        TableButtonsComponent,
        ElementDataTypeComponent,
        AllLinksInPagedListComponent,
        MultiplicityComponent,
        MarkdownDirective,
        MdmPaginatorComponent,
        SummaryMetadataTableComponent,
        SummaryMetadataChartComponent,
        FileSizePipe,
        AdvancedSearchBarComponent,
        AttachmentListComponent,
        McPagedListComponent,
        ByteArrayToBase64Pipe,
        DataClassComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
