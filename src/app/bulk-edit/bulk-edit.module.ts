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
