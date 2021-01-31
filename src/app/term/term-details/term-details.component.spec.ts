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
import { TermDetailsComponent } from './term-details.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MatDialogModule } from '@angular/material/dialog';

describe('TermDetailsComponent', () => {
  let component: TermDetailsComponent;
  let fixture: ComponentFixture<TermDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSkeletonLoaderModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatOptionModule,
        MatSelectModule,
        MatDialogModule,
        MatFormFieldModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {}
        }
      ],
      declarations: [
        ProfilePictureComponent,
        ElementAliasComponent,
        ElementLinkComponent,
        InlineTextEditComponent,
        MarkdownTextAreaComponent,
        PropertiesDirective,
        ElementClassificationsComponent,
        MarkdownDirective,
        ByteArrayToBase64Pipe,
        TermDetailsComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
