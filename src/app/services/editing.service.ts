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
