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
import { DataClassDetailsComponent } from './data-class-details.component';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { MultiplicityComponent } from '@mdm/shared/multiplicity/multiplicity.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ToastrModule } from 'ngx-toastr';
import { UIRouterModule } from '@uirouter/angular';
import { MatDialogModule } from '@angular/material/dialog';
import '@mdm/utility/extensions/mat-dialog.extensions';

describe('DataClassDetailsComponent', () => {
  let component: DataClassDetailsComponent;
  let fixture: ComponentFixture<DataClassDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSkeletonLoaderModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatCheckboxModule,
        MatOptionModule,
        MatSelectModule,
        MatFormFieldModule,
        MatDialogModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService, useValue: {}
        }
      ],
      declarations: [
        InlineTextEditComponent,
        ElementAliasComponent,
        MarkdownTextAreaComponent,
        ModelPathComponent,
        MultiplicityComponent,
        ElementClassificationsComponent,
        EditableFormButtonsComponent,
        ProfilePictureComponent,
        PropertiesDirective,
        MarkdownDirective,
        ByteArrayToBase64Pipe,
        DataClassDetailsComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataClassDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
