/*
Copyright 2020-2022 University of Oxford
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
import { NgModule } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FoldersTreeComponent } from './folders-tree.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StringifyPipe } from '../pipes/stringify.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FolderService } from './folder.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PipesModule } from '@mdm/modules/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatTreeModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    PipesModule
  ],
  declarations: [
    FoldersTreeComponent,
    StringifyPipe
  ],
  entryComponents: [
    FoldersTreeComponent
  ],
  exports: [
    FoldersTreeComponent,
    StringifyPipe,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [
    FolderService
  ]
})
export class FoldersTreeModule {
}
