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
import { FoldersTreeComponent } from './folders-tree.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoldersTreeModule } from './folders-tree.module';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { HighlighterPipe } from '../pipes/highlighter.pipe';

describe('mdm-folders-tree', () => {
    let component: FoldersTreeComponent;
    let fixture: ComponentFixture<FoldersTreeComponent>;

    beforeEach(() => {
      // TestBed.configureTestingModule({
      //   imports: [
      //     FoldersTreeModule,

      //     // Transitive dependencies
      //     MatDialogModule,
      //     HttpClientModule,
      //     UIRouterModule.forRoot({ useHash: true }),
      //     ToastrModule.forRoot()
      //   ]
      // })
      // .compileComponents();

      // TODO: Importing modules caused jest to hang. Need to investigate.
      TestBed.configureTestingModule({
        declarations: [
          FoldersTreeComponent
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
