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
import { DebugElement } from '@angular/core';
import { ClassificationDetailsComponent } from './classification-details.component';
import { MatMenuModule } from '@angular/material/menu';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { FormsModule } from '@angular/forms';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { ElementDataTypeComponent } from '@mdm/shared/element-data-type/element-data-type.component';
import { NewDataTypeInlineComponent } from '@mdm/utility/new-data-type-inline/new-data-type-inline.component';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { McEnumerationListWithCategoryComponent } from '@mdm/utility/mc-enumeration-list-with-category/mc-enumeration-list-with-category.component';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { MatTableModule } from '@angular/material/table';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSortModule } from '@angular/material/sort';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import '@mdm/utility/extensions/mat-dialog.extensions';
import { ClassifierDetail } from '@maurodatamapper/mdm-resources';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';

const createClassifierDetails = () => {
    const classifier: ClassifierDetail = {
          label: 'test classifier',
          domainType: CatalogueItemDomainType.Classifier,
          id: '55209886-b784-46fb-8ad7-cdd6ad6e0329',
          availableActions: ['comment', 'delete', 'editDescription',
                              'save', 'show', 'softDelete', 'update'],
          lastUpdated: '2021-09-10T23:58:54.042Z',
          readableByEveryone: false,
          readableByAuthenticatedUsers: true
    };

    return classifier;
};

describe('ClassificationDetailsComponent', () => {
  let component: ClassificationDetailsComponent;
  let fixture: ComponentFixture<ClassificationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSkeletonLoaderModule,
        DragDropModule,
        MatTooltipModule,
        MatMenuModule,
        MatProgressBarModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatIconModule,
        MatDialogModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule,
        FormsModule,
        FoldersTreeModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService, useValue: {}
        },
      ],
      declarations: [
        ModelSelectorTreeComponent,
        InlineTextEditComponent,
        ElementAliasComponent,
        MarkdownTextAreaComponent,
        MdmPaginatorComponent,
        ElementDataTypeComponent,
        NewDataTypeInlineComponent,
        PropertiesDirective,
        McSelectComponent,
        ElementLinkComponent,
        McEnumerationListWithCategoryComponent,
        MarkdownTextAreaComponent,
        MarkdownDirective,
        ModelPathComponent,
        ElementClassificationsComponent,
        EditableFormButtonsComponent,
        ProfilePictureComponent,
        ByteArrayToBase64Pipe,
        ClassificationDetailsComponent
      ]
    })
    .compileComponents();
  }
  )
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationDetailsComponent);
    component = fixture.componentInstance;
    component.classification = createClassifierDetails();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Display Edit User Access button', () => {
    const classificationDetailsDE: DebugElement = fixture.debugElement;
    const classificationDetailsEl: HTMLElement = classificationDetailsDE.nativeElement;
    const button = classificationDetailsEl.querySelector('[aria-label="User & Group Access"]');
    expect(button).toBeTruthy();
  });
});


