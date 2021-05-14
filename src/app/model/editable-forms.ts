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
import { EditableObject } from '@mdm/services/editing.service';
import { Subject } from 'rxjs';

/**
 * Interface to define a type as resetable.
 *
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
 */
export class Editable<T, F extends Resetable<T>> {
  private onShowSource = new Subject<void>();
  private onCancelSource = new Subject<void>();
  private onResetSource = new Subject<T>();

  /**
   * Observable to subscribe to when the editable object state is being shown.
   */
  onShow = this.onShowSource.asObservable();

  /**
   * Observable to subscribe to when the editable object state is being cancelled.
   */
  onCancel = this.onCancelSource.asObservable();

  /**
   * Observable to subscribe to when the editable object state is being reset.
   *
   * Use this when it is required to set further data to `F` that `T` provides only the basis of, for instance
   * `T` may provide an `id` property but `F` requires the data object associated with that ID.
   */
  onReset = this.onResetSource.asObservable();

   /**
    * Determine if form data is being deleted.
    */
  deletePending: boolean;

  /**
   * Determine if this form is being edited.
   */
  isEditing: boolean;

  constructor(
    private original: T,
    public form: F) {
    this.deletePending = false;
    this.isEditing = false;
    this.reset();
  }

  /**
   * Reset the form state of this object.
   *
   * @param next The next `T` object to set to `original` if overriding the original value. If not provided, the value
   * currently stored in `original` will be used.
   */
  reset(next?: T) {
    if (next) {
      this.original = next;
    }

    this.form.reset(this.original);
    this.onResetSource.next(this.original);
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

export class EditableRecord<T, E> implements EditableObject {

  isNew: boolean;
  inEdit: boolean;

  constructor(
    public source: T,
    public edit: E,
    settings: { isNew: boolean; inEdit: boolean }) {
      this.isNew = settings.isNew;
      this.inEdit = settings.inEdit;
    }
}