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
import { NewDataTypeInlineComponent } from './new-data-type-inline.component';
import { McEnumerationListWithCategoryComponent } from '../mc-enumeration-list-with-category/mc-enumeration-list-with-category.component';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { McSelectComponent } from '../mc-select/mc-select.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ElementClassificationsComponent } from '../element-classifications/element-classifications.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ModelPathComponent } from '../model-path/model-path.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSortModule } from '@angular/material/sort';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { empty } from 'rxjs/internal/observable/empty';
import '@mdm/utility/extensions/mat-dialog.extensions';

describe('NewDataTypeInlineComponent', () => {
  let component: NewDataTypeInlineComponent;
  let fixture: ComponentFixture<NewDataTypeInlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatOptionModule,
        MatSelectModule,
        MatTableModule,
        MatIconModule,
        MatSortModule,
        DragDropModule,
        MatPaginatorModule,
        MatFormFieldModule,
        FoldersTreeModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            terminology: {
              // tslint:disable-next-line: deprecation
              list: () => empty()
            },
            codeSet: {
               // tslint:disable-next-line: deprecation
               list: () => empty()
             },
             referenceDataModel: {
               // tslint:disable-next-line: deprecation
               list: () => empty()
             }
          }
        }
      ],
      declarations: [
        McEnumerationListWithCategoryComponent,
        ModelSelectorTreeComponent,
        McSelectComponent,
        ModelPathComponent,
        ElementClassificationsComponent,
        PropertiesDirective,
        MdmPaginatorComponent,
        NewDataTypeInlineComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDataTypeInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
