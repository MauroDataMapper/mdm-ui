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

import { ExportModelsComponent } from './export-models.component';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '@mdm/directives/filter-pipe.directive';
import { ToastrModule } from 'ngx-toastr';
import { UIRouterModule } from '@uirouter/angular';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MatDialogModule } from '@angular/material/dialog';
import { empty } from 'rxjs';

describe('DataModelsExportComponent', () => {
  let component: ExportModelsComponent;
  let fixture: ComponentFixture<ExportModelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatProgressBarModule,
        FoldersTreeModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            // tslint:disable-next-line: deprecation
            session: { isAuthenticated: () => empty() },
            tree: {
              // tslint:disable-next-line: deprecation
              list: () => empty(),
              // tslint:disable-next-line: deprecation
              get: () => empty()
            }
          }
        }
      ],
      declarations: [
        ProfilePictureComponent,
        ByteArrayToBase64Pipe,
        FilterPipe,
        ModelSelectorTreeComponent,
        ExportModelsComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
