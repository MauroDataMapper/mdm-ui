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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { FeaturesService } from '@mdm/services/features.service';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { FoldersTreeComponent } from './folders-tree.component';
import { FoldersTreeModule } from './folders-tree.module';

describe('mdm-folders-tree', () => {
    let component: FoldersTreeComponent;
    let fixture: ComponentFixture<FoldersTreeComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          FoldersTreeModule,

          // Transitive dependencies
          MatDialogModule,
          HttpClientTestingModule,
          UIRouterModule.forRoot({ useHash: true }),
          ToastrModule.forRoot()
        ],
        providers: [
          { provide: MdmResourcesService, useValue: {} },
          {
            provide: FeaturesService,
            useValue: jest.fn()
          }
        ]
      })
      .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(FoldersTreeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
