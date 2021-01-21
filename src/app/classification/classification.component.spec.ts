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

import { ClassificationComponent } from './classification.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ClassificationDetailsComponent } from './classification-details/classification-details.component';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { FormsModule } from '@angular/forms';
import { GroupAccessNewComponent } from '@mdm/access/group-access-new.component';
import { ShareWithComponent } from '@mdm/access/share-with/share-with.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AdvancedSearchBarComponent } from '@mdm/search/advanced-search-bar/advanced-search-bar.component';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { DateFromToComponent } from '@mdm/search/date-from-to/date-from-to.component';
import { MatOptionModule } from '@angular/material/core';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { HistoryComponent } from '@mdm/shared/history/history.component';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClassifiedElementsListComponent } from '@mdm/shared/classified-elements-list/classified-elements-list.component';
import { MatSortModule } from '@angular/material/sort';
import { MoreDescriptionComponent } from '@mdm/shared/more-description/more-description.component';
import { AllLinksInPagedListComponent } from '@mdm/utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import '@mdm/utility/extensions/mat-dialog.extensions';

describe('ClassificationComponent', () => {
  let component: ClassificationComponent;
  let fixture: ComponentFixture<ClassificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSkeletonLoaderModule,
        FormsModule,
        DragDropModule,
        MatTableModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatOptionModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatSelectModule,
        FoldersTreeModule,
        MatDatepickerModule,
        MatTabsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        { provide: MdmResourcesService, useValue: {} }
      ],
      declarations: [
        ClassificationDetailsComponent,
        InlineTextEditComponent,
        GroupAccessNewComponent,
        ShareWithComponent,
        MarkdownTextAreaComponent,
        EditableFormButtonsComponent,
        MdmPaginatorComponent,
        McSelectComponent,
        MarkdownDirective,
        AdvancedSearchBarComponent,
        McPagedListComponent,
        ClassifiedElementsListComponent,
        ModelSelectorTreeComponent,
        DateFromToComponent,
        ElementLinkComponent,
        ModelPathComponent,
        HistoryComponent,
        ProfilePictureComponent,
        MoreDescriptionComponent,
        AllLinksInPagedListComponent,
        ByteArrayToBase64Pipe,
        ClassificationComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
