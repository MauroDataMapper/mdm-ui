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
import { CommonModule } from '@angular/common';
import { BulkEditEditorComponent } from './bulk-edit-editor/bulk-edit-editor.component';
import { AgGridModule } from 'ag-grid-angular';
import { BulkEditContainerComponent } from './bulk-edit-container/bulk-edit-container.component';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { FormsModule } from '@angular/forms';
import { CheckboxCellRendererComponent } from './bulk-edit-editor/cell-renderers/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { DateCellEditorComponent } from './bulk-edit-editor/cell-editors/date-cell-editor/date-cell-editor.component';
import { SharedModule } from '@mdm/modules/shared/shared.module';
import { BulkEditSelectComponent } from './bulk-edit-select/bulk-edit-select.component';
import { BulkEditEditorGroupComponent } from './bulk-edit-editor-group/bulk-edit-editor-group.component';


@NgModule({
  declarations: [
    BulkEditEditorComponent,
    BulkEditContainerComponent,
    CheckboxCellRendererComponent,
    DateCellEditorComponent,
    BulkEditSelectComponent,
    BulkEditEditorGroupComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    SharedModule,
    AgGridModule.withComponents([
      CheckboxCellRendererComponent,
      DateCellEditorComponent
    ])
  ],
  exports: [
    BulkEditEditorComponent,
    BulkEditContainerComponent
  ]
})
export class BulkEditModule { }
