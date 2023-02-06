/*
Copyright 2020-2023 University of Oxford
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

import { SubscribedCatalogueDetailComponent } from './subscribed-catalogue-detail.component';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { ContentEditorComponent } from '@mdm/utility/content-editor/content-editor.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { FormsModule } from "@angular/forms";

describe('SubscribedCatalogueDetailComponent', () => {
  let component: SubscribedCatalogueDetailComponent;
  let fixture: ComponentFixture<SubscribedCatalogueDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService, useValue: {}
        },
      ],
      declarations: [
        SubscribedCatalogueDetailComponent,
        NgxSkeletonLoaderComponent,
        ContentEditorComponent,
        MarkdownTextAreaComponent,
        MarkdownDirective,
        InlineTextEditComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscribedCatalogueDetailComponent);
    component = fixture.componentInstance;
    component.subscribedCatalogue = {
      url: '',
      label: '',
      subscribedCatalogueType: 'test',
      subscribedCatalogueAuthenticationType: ''
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
