/*
Copyright 2020-2023 University of Oxford and NHS England

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
import { AgGridModule } from '@ag-grid-community/angular';
import { BulkEditContainerComponent } from './bulk-edit-container/bulk-edit-container.component';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { FormsModule } from '@angular/forms';
import { CheckboxCellRendererComponent } from './bulk-edit-editor/cell-renderers/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { DateCellEditorComponent } from './bulk-edit-editor/cell-editors/date-cell-editor/date-cell-editor.component';
import { SharedModule } from '@mdm/shared/shared.module';
import { BulkEditSelectComponent } from './bulk-edit-select/bulk-edit-select.component';
import { BulkEditEditorGroupComponent } from './bulk-edit-editor-group/bulk-edit-editor-group.component';
import { TextAreaCellEditorComponent } from './bulk-edit-editor/cell-editors/text-area-cell-editor/text-area-cell-editor.component';
import { FullContentEditDialogComponent } from './bulk-edit-editor/dialogs/full-content-edit-dialog/full-content-edit-dialog.component';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ContentModule } from '@mdm/content/content.module';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@NgModule({
  declarations: [
    BulkEditEditorComponent,
    BulkEditContainerComponent,
    CheckboxCellRendererComponent,
    DateCellEditorComponent,
    BulkEditSelectComponent,
    BulkEditEditorGroupComponent,
    TextAreaCellEditorComponent,
    FullContentEditDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    SharedModule,
    AgGridModule,
    ContentModule
  ],
  exports: [BulkEditEditorComponent, BulkEditContainerComponent]
})
export class BulkEditModule {}
