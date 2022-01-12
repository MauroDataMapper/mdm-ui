import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkEditElementSelectComponent } from './bulk-edit-element-select/bulk-edit-element-select.component';
import { BulkEditProfileSelectComponent } from './bulk-edit-profile-select/bulk-edit-profile-select.component';
import { BulkEditEditorComponent } from './bulk-edit-editor/bulk-edit-editor.component';
import { AgGridModule } from 'ag-grid-angular';
import { BulkEditContainerComponent } from './bulk-edit-container/bulk-edit-container.component';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { FormsModule } from '@angular/forms';
import { CheckboxRendererComponent } from './bulk-edit-editor/renderers/checkbox-renderer/checkbox-renderer.component';
import { DateCellEditorComponent } from './bulk-edit-editor/renderers/date-cell-editor/date-cell-editor.component';
import { CalendarModule } from 'primeng/calendar';


@NgModule({
  declarations: [
    BulkEditElementSelectComponent,
    BulkEditProfileSelectComponent,
    BulkEditEditorComponent,
    BulkEditContainerComponent,
    CheckboxRendererComponent,
    DateCellEditorComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    CalendarModule,
    FormsModule,
    AgGridModule.withComponents([CheckboxRendererComponent, DateCellEditorComponent])
  ],
  exports: [
    BulkEditElementSelectComponent,
    BulkEditProfileSelectComponent,
    BulkEditEditorComponent,
    BulkEditContainerComponent
  ]
})
export class BulkEditModule { }
