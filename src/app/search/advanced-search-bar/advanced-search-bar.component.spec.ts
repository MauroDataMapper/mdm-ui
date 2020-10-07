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

import { AdvancedSearchBarComponent } from './advanced-search-bar.component';
import { TestModule } from '@mdm/modules/test/test.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { DateFromToComponent } from '../date-from-to/date-from-to.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { empty } from 'rxjs';

describe('AdvancedSearchBarComponent', () => {
  let component: AdvancedSearchBarComponent;
  let fixture: ComponentFixture<AdvancedSearchBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // TestModule
        MatPaginatorModule,
        MatCardModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatOptionModule,
        MatTableModule,
        FoldersTreeModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            classifier: {
              // tslint:disable-next-line: deprecation
              list: () => empty()
            }
          }
        }
      ],
      declarations: [
        MarkdownTextAreaComponent,
        ModelPathComponent,
        DateFromToComponent,
        ModelSelectorTreeComponent,
        MarkdownDirective,
        ElementLinkComponent,
        AdvancedSearchBarComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
