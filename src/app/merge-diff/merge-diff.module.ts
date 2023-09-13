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

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { SharedModule } from '@mdm/shared/shared.module';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { MergeDiffContainerComponent } from '@mdm/merge-diff/merge-diff-container/merge-diff-container.component';
import { MergeItemSelectorComponent } from './merge-item-selector/merge-item-selector.component';
import { MergeComparisonComponent } from './merge-comparsion/merge-comparsion.component';
import { CatalogueModule } from '@mdm/modules/catalogue/catalogue.module';
import { MergeFilterPipe } from './pipes/merge-filter.pipe';
import { ConflictEditorModalComponent } from './conflict-editor/conflict-editor-modal/conflict-editor-modal.component';
import { StringConflictEditorComponent } from './conflict-editor/string-conflict-editor/string-conflict-editor.component';
import { NumberConflictEditorComponent } from './conflict-editor/number-conflict-editor/number-conflict-editor.component';
import { LazyElementsModule } from '@angular-extensions/elements';

@NgModule({
  declarations: [
    MergeDiffContainerComponent,
    MergeItemSelectorComponent,
    MergeComparisonComponent,
    MergeFilterPipe,
    ConflictEditorModalComponent,
    StringConflictEditorComponent,
    NumberConflictEditorComponent,
  ],
  imports: [CommonModule, SharedModule, MaterialModule, CatalogueModule],
  exports: [MergeDiffContainerComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class MergeDiffModule {}
