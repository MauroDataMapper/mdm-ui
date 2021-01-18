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

/**
 * Service to manage global editing state of the application.
 * 
 * Used to manage/cancel transitions to other parts of the application if there is the potential to lose unsaved changes.
 */
@Injectable({
  providedIn: 'root'
})
export class EditingService {

  private _isEditing: boolean = false;

  get isEditing() {
    return this._isEditing;
  }

  set isEditing(val: boolean) {
    this._isEditing = val;
  }

  constructor() { }
}
