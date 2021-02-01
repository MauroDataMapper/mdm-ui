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
import { Subject } from "rxjs";

/**
 * Interface to define a type as resetable.
 * 
 * @typedef T The type of the object to reset state to.
 */
export interface Resetable<T> {

  /**
   * Resets this object using the original object provided.
   */
  reset(original: T): void;
}

/**
 * Represents the state of a form that can be edited.
 * 
 * @typedef T The type of the original data object.
 * @typedef F The type representing the form data to edit. Must implement the `Resetable<T>` interface.
 */
export class Editable<T, F extends Resetable<T>> {
  private onShowSource = new Subject<void>();
  private onCancelSource = new Subject<void>();

  /**
   * Observable to subscribe to when the editable object state is being shown.
   */
  onShow = this.onShowSource.asObservable();

  /**
   * Observable to subscribe to when the editable object state is being cancelled.
   */
  onCancel = this.onCancelSource.asObservable();  

  /**
   * Determine if form data is being deleted.
   */
  deletePending: boolean;

  /**
   * Determine if this form is being edited.
   */
  isEditing: boolean;

  constructor(
    private readonly original: T,
    public form: F) {
    this.deletePending = false;
    this.isEditing = false;
    this.reset();
  }

  reset() {
    this.form.reset(this.original);
  }

  show() {
    this.isEditing = true;
    this.onShowSource.next();
  }

  cancel() {
    this.isEditing = false;
    this.reset();
    this.onCancelSource.next();
  }
}