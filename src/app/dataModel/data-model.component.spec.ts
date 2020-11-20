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
import { DataModelComponent } from './data-model.component';
import { DataModelDetailComponent } from './data-model-detail.component';
import { AdvancedSearchBarComponent } from '@mdm/search/advanced-search-bar/advanced-search-bar.component';
import { AllLinksInPagedListComponent } from '@mdm/utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { ShareWithComponent } from '@mdm/access/share-with/share-with.component';
import { GroupAccessNewComponent } from '@mdm/access/group-access-new.component';
import { MatTabsModule } from '@angular/material/tabs';
import { HistoryComponent } from '@mdm/shared/history/history.component';
import { ElementChildDataClassesListComponent } from '@mdm/shared/element-child-data-classes-list/element-child-data-classes-list.component';
import { ElementOwnedDataTypeListComponent } from '@mdm/shared/element-owned-data-type-list/element-owned-data-type-list.component';
import { McDataSetMetadataComponent } from '@mdm/shared/mc-data-set-metadata/mc-data-set-metadata.component';
import { SummaryMetadataTableComponent } from '@mdm/shared/summary-metadata/summary-metadata-table/summary-metadata-table.component';
import { AnnotationListComponent } from '@mdm/shared/annotation-list/annotation-list.component';
import { DiagramTabComponent } from '@mdm/diagram/diagram-tab/diagram-tab.component';
import { ElementLinkListComponent } from '@mdm/shared/element-link-list/element-link-list.component';
import { AttachmentListComponent } from '@mdm/shared/attachment-list/attachment-list.component';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { ElementStatusComponent } from '@mdm/utility/element-status/element-status.component';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { MatMenuModule } from '@angular/material/menu';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateFromToComponent } from '@mdm/search/date-from-to/date-from-to.component';
import { MatOptionModule } from '@angular/material/core';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import { MoreDescriptionComponent } from '@mdm/shared/more-description/more-description.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MultiplicityComponent } from '@mdm/shared/multiplicity/multiplicity.component';
import { ElementDataTypeComponent } from '@mdm/shared/element-data-type/element-data-type.component';
import { MatDividerModule } from '@angular/material/divider';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { TableButtonsComponent } from '@mdm/shared/table-buttons/table-buttons.component';
import { SummaryMetadataChartComponent } from '@mdm/shared/summary-metadata/summary-metadata-chart/summary-metadata-chart.component';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { DiagramToolbarComponent } from '@mdm/diagram/diagram-toolbar/diagram-toolbar.component';
import { DiagramComponent } from '@mdm/diagram/diagram/diagram.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ChartsModule } from 'ng2-charts';
import { FileSizePipe } from '@mdm/directives/file-size.pipe';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { empty } from 'rxjs/internal/observable/empty';

describe('DataModelComponent', () => {
  let component: DataModelComponent;
  let fixture: ComponentFixture<DataModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatTabsModule,
        MatDividerModule,
        MatMenuModule,
        MatProgressBarModule,
        MatOptionModule,
        MatTooltipModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        MatDatepickerModule,
        MatCardModule,
        MatSelectModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatCheckboxModule,
        FormsModule,
        NgxSkeletonLoaderModule,
        FoldersTreeModule,
        CodemirrorModule,
        ChartsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            session: {
              // tslint:disable-next-line: deprecation
              isAuthenticated: () => empty()
            },
            tree: {
              list: jest.fn()
            }
          }
        }
      ],
      declarations: [
        DataModelDetailComponent,
        AdvancedSearchBarComponent,
        FileSizePipe,
        PropertiesDirective,
        MarkdownDirective,
        DiagramToolbarComponent,
        DiagramComponent,
        MultiplicityComponent,
        ElementDataTypeComponent,
        AllLinksInPagedListComponent,
        ProfilePictureComponent,
        HistoryComponent,
        McPagedListComponent,
        MoreDescriptionComponent,
        ElementChildDataClassesListComponent,
        ElementOwnedDataTypeListComponent,
        McDataSetMetadataComponent,
        InlineTextEditComponent,
        SummaryMetadataTableComponent,
        AnnotationListComponent,
        EditableFormButtonsComponent,
        ByteArrayToBase64Pipe,
        ModelSelectorTreeComponent,
        ModelPathComponent,
        ElementLinkComponent,
        DateFromToComponent,
        ElementStatusComponent,
        MdmPaginatorComponent,
        ElementAliasComponent,
        MarkdownTextAreaComponent,
        DiagramTabComponent,
        ElementClassificationsComponent,
        McSelectComponent,
        TableButtonsComponent,
        SummaryMetadataChartComponent,
        AttachmentListComponent,
        ElementLinkListComponent,
        ShareWithComponent,
        GroupAccessNewComponent,
        DataModelComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
