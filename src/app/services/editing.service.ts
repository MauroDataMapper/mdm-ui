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
import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { dia } from 'jointjs';

const editableRouteNames = [
  'appContainer.mainApp.twoSidePanel.catalogue.dataModel',
  'appContainer.mainApp.twoSidePanel.catalogue.dataClass',
  'appContainer.mainApp.twoSidePanel.catalogue.classification',
  'appContainer.mainApp.twoSidePanel.catalogue.codeSet',
  'appContainer.mainApp.twoSidePanel.catalogue.dataType',
  'appContainer.mainApp.twoSidePanel.catalogue.dataElement',
  'appContainer.mainApp.twoSidePanel.catalogue.folder',
  'appContainer.mainApp.twoSidePanel.catalogue.ReferenceDataModel'
];

export interface EditableObject {
  inEdit?: boolean
}

/**
 * Service to manage global editing state of the application.
 * 
 * Used to track when editing is happening and to confirm whether it is safe to leave views/editors during edits.
 */
@Injectable({
  providedIn: 'root'
})
export class EditingService {

  private _isEditing: boolean = false;

  constructor() { }

  /**
   * Mark the application as starting edits.
   */
  start(): void { this._isEditing = true; }

  /**
   * Mark the application as stopping edits.
   */
  stop(): void { this._isEditing = false; }

  /**
   * Determine if something in the application is editing currently.
   */
  isEditing = () => this._isEditing;

  /**
   * Determine if a route is allowed to be edited and should be checked before transitioning out of the view.
   * 
   * @param name The name of the route
   */
  isRouteEditable = (name: string) => editableRouteNames.indexOf(name) !== -1;

  /**
   * Mark the application as being in edit mode if any item in the given collection states it is being edited.
   * 
   * @param items Array of `EditableObject` items which should contain an `inEdit` property
   */
  setFromCollection(items: Array<EditableObject>) {
    if (!items) {
      return;
    }

    this._isEditing = items.some(item => item.inEdit);
  }

  /**
   * Set a custom click event handler to a `MatTabGroup` to add confirmation to each tab click.
   * 
   * @param tabGroup The `MatTabGroup` to modify.
   * 
   * The `MatTabGroup` responds to click events when a tab is clicked but does not provide the ability
   * to cancel that click event. For the case when something is still being edited, the cancellation of a tab click
   * is important.
   * 
   * A custom click event handler is therefore attached to intercept the click event and first check if editing is in
   * place. If not or the user allows the transition, the original tab click event will be carried out.
   */
  setTabGroupClickEvent(tabGroup: MatTabGroup) {
    tabGroup._handleClick = (tab: MatTab, tabHeader: MatTabHeader, index: number) => {
      if (this.confirmLeave()) {
        // Manually stop "editing" so that other transition hooks don't trigger another confirmation message
        this.stop();
        MatTabGroup.prototype._handleClick.apply(tabGroup, [tab, tabHeader, index]);
      }      
    };
  }

  /**
   * Configure a `MatDialogRef` to handle editing state tracking and confirmations.
   * 
   * @param dialogRef The `MatDialogRef` to configure
   * 
   * Configuring the dialog will involve the following:
   * 
   * * Subscribing to the `afterOpened()` observable to track state after opening
   * * Subscribing to the `afterClosed()` observable to track state after closing
   * * Subscribing to the `backdropClick()` observable to confirm if the dialog should be closed
   * 
   * Use this function if a dialog contains any component that edit data to ensure that editing state is
   * correctly maintained for the duration of the dialog.
   */
  configureDialogRef<T, R>(dialogRef: MatDialogRef<T, R>) {
    dialogRef.afterOpened().subscribe(() => this.start());

    dialogRef.afterClosed().subscribe(() => this.stop());

    dialogRef.disableClose = true;
    dialogRef.backdropClick().subscribe(() => {
      if (this.confirmCancel()) {
        dialogRef.close();
      }
    });
  }

  /**
   * Confirm if it is safe to leave a view to transition to another.
   */
  confirmLeave = (): boolean => this.confirmStop('Are you sure you want to leave this view? Any unsaved changes will be lost.');

  /**
   * Confirm if it is safe to cancel a form edit view.
   */
  confirmCancel = (): boolean => this.confirmStop('Are you sure you want to cancel? Any unsaved changes will be lost.');    

  private confirmStop(message: string): boolean {
    if (!this._isEditing) {
      return true;
    }

    return confirm(message);
  }
}
