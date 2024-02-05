/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ToastrModule } from 'ngx-toastr';

import { FederatedDataModelDetailComponent } from './federated-data-model-detail.component';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { ContentEditorComponent } from '@mdm/utility/content-editor/content-editor.component';
import { UIRouterModule } from '@uirouter/angular';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { FormsModule } from '@angular/forms';

describe('FederatedDataModelDetailComponent', () => {
  let component: FederatedDataModelDetailComponent;
  let fixture: ComponentFixture<FederatedDataModelDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        FormsModule,
        ToastrModule.forRoot(),

        // Transitive Dependency
        UIRouterModule.forRoot({ useHash: true }),
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {}
        },
        {
          provide: MatDialog,
          useValue: {}
        },
      ],
      declarations: [
        FederatedDataModelDetailComponent,
        InlineTextEditComponent,
        ContentEditorComponent,
        MarkdownTextAreaComponent,
        MarkdownDirective
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FederatedDataModelDetailComponent);
    component = fixture.componentInstance;
    component.dataModel = { catalogueId: '', label: '', isSubscribed: false };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
