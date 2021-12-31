import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkEditElementSelectComponent } from './bulk-edit-element-select/bulk-edit-element-select.component';
import { BulkEditProfileSelectComponent } from './bulk-edit-profile-select/bulk-edit-profile-select.component';
import { BulkEditEditorComponent } from './bulk-edit-editor/bulk-edit-editor.component';
import { BulkEditSaveModalComponent } from './modals/bulk-edit-save-modal/bulk-edit-save-modal.component';
import { AgGridModule } from 'ag-grid-angular';
import { BulkEditBaseComponent } from './bulk-edit-base/bulk-edit-base.component';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { FormsModule } from '@angular/forms';
import { CheckboxRendererComponent } from './checkbox-renderer/checkbox-renderer.component';



@NgModule({
  declarations: [
    BulkEditElementSelectComponent,
    BulkEditProfileSelectComponent,
    BulkEditEditorComponent,
    BulkEditSaveModalComponent,
    BulkEditBaseComponent,
    CheckboxRendererComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    AgGridModule.withComponents([CheckboxRendererComponent])
  ],
  exports: [
    BulkEditElementSelectComponent,
    BulkEditProfileSelectComponent,
    BulkEditEditorComponent,
    BulkEditSaveModalComponent,
    BulkEditBaseComponent
  ]
})
export class BulkEditModule { }
