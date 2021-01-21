/*
Copyright 2021 University of Oxford

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
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog'
import { ConfirmationModalComponent, ConfirmationModalConfig, ConfirmationModalResult } from '@mdm/modals/confirmation-modal/confirmation-modal.component'

declare module '@angular/material/dialog/dialog' {
    interface MatDialog {
        /**
         * Extension method to open a modal dialog containing the `ConfirmationModelComponent`.
         * 
         * @param config The dialog configuration to supply.
         * @returns Reference to the newly opened dialog.
         * 
         * @see `ConfirmationModalComponent`
         * 
         * @see `ConfirmationModalConfig`
         * 
         * @see `ConfirmationModalResult`
         */
        openConfirmation(config: MatDialogConfig<ConfirmationModalConfig>): MatDialogRef<ConfirmationModalComponent, ConfirmationModalResult>;
    }
}

MatDialog.prototype.openConfirmation = function(
    this: MatDialog, 
    config: MatDialogConfig<ConfirmationModalConfig>)
    : MatDialogRef<ConfirmationModalComponent, ConfirmationModalResult> {
    return this.open<ConfirmationModalComponent, ConfirmationModalConfig, ConfirmationModalResult>(
        ConfirmationModalComponent, 
        config);
}