/*
Copyright 2020-2024 University of Oxford and NHS England

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
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from '@angular/material/dialog';
import {
  Branchable,
  CatalogueItem,
  CatalogueItemDetail,
  Modelable,
  SecurableModel
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import {
  ElementSearchDialogComponent,
  ElementSearchDialogData,
  ElementSearchDialogResponse
} from '@mdm/content/element-search-dialog/element-search-dialog.component';
import {
  ChangeBranchNameModalComponent,
  ChangeBranchNameModalData,
  ChangeBranchNameModalResult
} from '@mdm/modals/change-branch-name-modal/change-branch-name-modal.component';
import {
  ChangeLabelModalComponent,
  ChangeLabelModalData,
  ChangeLabelModalResult
} from '@mdm/modals/change-label-modal/change-label-modal.component';
import {
  ConfirmationModalComponent,
  ConfirmationModalConfig,
  ConfirmationModalResult
} from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import {
  ExportModelDialogComponent,
  ExportModelDialogOptions,
  ExportModelDialogResponse
} from '@mdm/modals/export-model-dialog/export-model-dialog.component';
import { SecurityModalComponent } from '@mdm/modals/security-modal/security-modal.component';
import {
  SecurityAccessResource,
  SecurityModalConfiguration
} from '@mdm/modals/security-modal/security-modal.model';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map, mergeMap } from 'rxjs/operators';

declare module '@angular/material/dialog' {
  interface MatDialog {
    /**
     * Extension method to open a modal dialog containing the `ConfirmationModalComponent`.
     *
     * @param config The dialog configuration to supply.
     * @returns Reference to the newly opened dialog.
     *
     * A complete `ModalDialogRef` object is returned to handle specific dialog actions. If requiring simpler
     * confirmation dialogs, consider using `openConfirmationAsync()` instead.
     *
     * @see `ConfirmationModalComponent`
     * @see `ConfirmationModalConfig`
     * @see `ConfirmationModalResult`
     */
    openConfirmation(
      config: MatDialogConfig<ConfirmationModalConfig>
    ): MatDialogRef<ConfirmationModalComponent, ConfirmationModalResult>;

    /**
     * Extension method to open a modal dialog containing the `ConfirmationModalComponent` and asynchronously
     * return the success result.
     *
     * @param config The dialog configuration to supply.
     * @returns An `Observable<void>` to subscribe to for acting when the user clicks "OK".
     *
     * An observable is returned so that the actions to perform after selecting "OK" can be carried out when ready. In the case
     * when the dialog is cancelled, these actions will not be carried out.
     *
     * @example
     *
     * ```ts
     * dialog.openConfirmationAsync(config)
     *  .subscribe(() => {
     *    // Clicked 'OK', do something here...
     *  })
     * ```
     *
     * @see `openConfirmation()`
     * @see `openDoubleConfirmationAsync()`
     */
    openConfirmationAsync(
      config: MatDialogConfig<ConfirmationModalConfig>
    ): Observable<void>;

    /**
     * Extension method to open two modal dialogs in succession containing the `ConfirmationModalComponent` and asynchronously
     * return the success result. This is usually used for deletion scenarios to be sure the user wants something to
     * happen.
     *
     * @param firstConfig The dialog configuration to supply to the first dialog.
     * @param finalConfig The dialog configuration to suppy to the final dialog.
     * @returns An `Observable<void>` to subscribe to for acting when the user clicks "OK" to both dialogs.
     *
     * An observable is returned so that the actions to perform after selecting "OK" can be carried out when ready. In the case
     * when the dialog is cancelled, these actions will not be carried out.
     *
     * @example
     *
     * ```ts
     * dialog.openDoubleConfirmationAsync(config1, config2)
     *  .subscribe(() => {
     *    // Clicked 'OK', do something here...
     *  })
     * ```
     *
     * @see `openConfirmation()`
     * @see `openConfirmationAsync()`
     */
    openDoubleConfirmationAsync(
      firstConfig: MatDialogConfig<ConfirmationModalConfig>,
      finalConfig: MatDialogConfig<ConfirmationModalConfig>
    ): Observable<void>;

    /**
     * Extension method to open the user/group access security dialog and control read access for a catalogue item.
     * Only domains defined in the {@link SecurityAccessResource} can be used.
     *
     * @param element The catalogue item element to change security access for.
     * @param resource The resource name that applies to this element.
     * @returns The dialog reference to observe.
     */
    openSecurityAccess(
      element: CatalogueItem & SecurableModel,
      resource: SecurityAccessResource
    ): MatDialogRef<SecurityModalComponent, ModalDialogStatus>;

    /**
     * Extension method to open a modal dialog containing the `ChangeLabelModalComponent`.
     *
     * @param item The item containing the details and the label to change.
     * @returns An observable for when a new label is chosen.
     *
     * @see `ChangeLabelModalComponent`
     * @see `ChangeLabelModalData`
     * @see `ChangeLabelModalResult`
     */
    openChangeLabel(
      item: CatalogueItemDetail
    ): Observable<ChangeLabelModalResult>;

    /**
     * Extension method to open a modal dialog containing the `ChangeBranchNameModalComponent`.
     *
     * @param model The model containing the details and the branch name to change.
     * @returns An observable for when a new branch name is chosen.
     *
     * @see `ChangeBranchNameModalComponent`
     * @see `ChangeBranchNameModalData`
     * @see `ChangeBranchNameModalResult`
     */
    openChangeBranchName(
      model: Modelable & Branchable
    ): Observable<ChangeBranchNameModalResult>;

    openExportModel(
      data: ExportModelDialogOptions
    ): Observable<ExportModelDialogResponse>;

    openElementSearch(
      root: CatalogueItem,
      searchTerm?: string
    ): MatDialogRef<ElementSearchDialogComponent, ElementSearchDialogResponse>;
  }
}

MatDialog.prototype.openConfirmation = function (
  this: MatDialog,
  config: MatDialogConfig<ConfirmationModalConfig>
): MatDialogRef<ConfirmationModalComponent, ConfirmationModalResult> {
  return this.open<
    ConfirmationModalComponent,
    ConfirmationModalConfig,
    ConfirmationModalResult
  >(ConfirmationModalComponent, config);
};

MatDialog.prototype.openConfirmationAsync = function (
  this: MatDialog,
  config: MatDialogConfig<ConfirmationModalConfig>
): Observable<void> {
  return this.openConfirmation(config)
    .afterClosed()
    .pipe(
      filter(
        (result) =>
          (result?.status ?? ModalDialogStatus.Close) === ModalDialogStatus.Ok
      ),
      map(() => {})
    );
};

MatDialog.prototype.openDoubleConfirmationAsync = function (
  this: MatDialog,
  firstConfig: MatDialogConfig<ConfirmationModalConfig>,
  finalConfig: MatDialogConfig<ConfirmationModalConfig>
): Observable<void> {
  return this.openConfirmation(firstConfig)
    .afterClosed()
    .pipe(
      filter(
        (result) =>
          (result?.status ?? ModalDialogStatus.Close) === ModalDialogStatus.Ok
      ),
      mergeMap(() => {
        return this.openConfirmation(finalConfig)
          .afterClosed()
          .pipe(
            filter((result2) => result2.status === ModalDialogStatus.Ok),
            map(() => {})
          );
      })
    );
};

MatDialog.prototype.openSecurityAccess = function (
  this: MatDialog,
  element: CatalogueItem & SecurableModel,
  resource: SecurityAccessResource
): MatDialogRef<SecurityModalComponent, ModalDialogStatus> {
  return this.open<
    SecurityModalComponent,
    SecurityModalConfiguration,
    ModalDialogStatus
  >(SecurityModalComponent, {
    data: {
      element,
      resource
    },
    panelClass: 'security-modal'
  });
};

MatDialog.prototype.openChangeLabel = function (
  this: MatDialog,
  item: CatalogueItemDetail
): Observable<ChangeLabelModalResult> {
  return this.open<
    ChangeLabelModalComponent,
    ChangeLabelModalData,
    ChangeLabelModalResult
  >(ChangeLabelModalComponent, {
    data: {
      item
    }
  })
    .afterClosed()
    .pipe(
      filter(
        (result) =>
          (result?.status ?? ModalDialogStatus.Close) === ModalDialogStatus.Ok
      )
    );
};

MatDialog.prototype.openChangeBranchName = function (
  this: MatDialog,
  model: Modelable & Branchable
): Observable<ChangeBranchNameModalResult> {
  return this.open<
    ChangeBranchNameModalComponent,
    ChangeBranchNameModalData,
    ChangeBranchNameModalResult
  >(ChangeBranchNameModalComponent, {
    data: {
      model
    }
  })
    .afterClosed()
    .pipe(
      filter(
        (result) =>
          (result?.status ?? ModalDialogStatus.Close) === ModalDialogStatus.Ok
      )
    );
};

MatDialog.prototype.openExportModel = function (
  this: MatDialog,
  data: ExportModelDialogOptions
): Observable<ExportModelDialogResponse> {
  return this.open<
    ExportModelDialogComponent,
    ExportModelDialogOptions,
    ExportModelDialogResponse
  >(ExportModelDialogComponent, {
    data,
    maxWidth: 600
  })
    .afterClosed()
    .pipe(filter((response) => response.status === ModalDialogStatus.Ok));
};

MatDialog.prototype.openElementSearch = function (
  this: MatDialog,
  root: CatalogueItem,
  searchTerm?: string
): MatDialogRef<ElementSearchDialogComponent, ElementSearchDialogResponse> {
  return this.open<
    ElementSearchDialogComponent,
    ElementSearchDialogData,
    ElementSearchDialogResponse
  >(ElementSearchDialogComponent, {
    data: {
      root,
      searchTerm
    },
    minWidth: 600,
    autoFocus: true
  });
};
