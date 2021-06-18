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

import { DataElementStep2Component } from './data-element-step2.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MoreDescriptionComponent } from '@mdm/shared/more-description/more-description.component';
import { ElementDataTypeComponent } from '@mdm/shared/element-data-type/element-data-type.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { NewDataTypeInlineComponent } from '@mdm/utility/new-data-type-inline/new-data-type-inline.component';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { McEnumerationListWithCategoryComponent } from '@mdm/utility/mc-enumeration-list-with-category/mc-enumeration-list-with-category.component';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MdmResourcesService } from '@mdm/modules/resources';
import '@mdm/utility/extensions/mat-dialog.extensions';

describe('DataElementStep2Component', () => {
  let component: DataElementStep2Component;
  let fixture: ComponentFixture<DataElementStep2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot(),
        MatTableModule,
        MatCheckboxModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatSortModule,
        MatOptionModule,
        DragDropModule,
        MatSelectModule,
        MatProgressBarModule,
        FormsModule,
        FoldersTreeModule
      ],
      providers: [
        {
          provide: MdmResourcesService, useValue: {}
        }
      ],
      declarations: [
        McSelectComponent,
        MoreDescriptionComponent,
        PropertiesDirective,
        ElementDataTypeComponent,
        ModelSelectorTreeComponent,
        MdmPaginatorComponent,
        ModelPathComponent,
        NewDataTypeInlineComponent,
        ElementLinkComponent,
        McEnumerationListWithCategoryComponent,
        ElementClassificationsComponent,
        DataElementStep2Component
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementStep2Component);
    component = fixture.componentInstance;
    component.step = { scope: { model: {} } };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
