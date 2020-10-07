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

import { ModelSelectorTreeComponent } from './model-selector-tree.component';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { FormsModule } from '@angular/forms';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { empty } from 'rxjs';

describe('ModelSelectorTreeComponent', () => {
  let component: ModelSelectorTreeComponent;
  let fixture: ComponentFixture<ModelSelectorTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSkeletonLoaderModule,
        FormsModule,
        FoldersTreeModule,
        MatTooltipModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            tree: {
              // tslint:disable-next-line: deprecation
              list: (domainType: any, options: any) => empty()
            }
          }
        },
        ElementTypesService
      ],
      declarations: [
        ByteArrayToBase64Pipe,
        ProfilePictureComponent,
        ModelSelectorTreeComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelSelectorTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
