import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkEditElementSelectComponent } from './bulk-edit-element-select/bulk-edit-element-select.component';
import { BulkEditProfileSelectComponent } from './bulk-edit-profile-select/bulk-edit-profile-select.component';
import { BulkEditEditorComponent } from './bulk-edit-editor/bulk-edit-editor.component';
import { BulkEditSaveModalComponent } from './modals/bulk-edit-save-modal/bulk-edit-save-modal.component';



@NgModule({
  declarations: [
    BulkEditElementSelectComponent,
    BulkEditProfileSelectComponent,
    BulkEditEditorComponent,
    BulkEditSaveModalComponent
  ],
  imports: [
    CommonModule
  ]
})
export class BulkEditModule { }
