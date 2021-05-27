/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
 * @typedef T The type of the original object state.
 * @typedef F The type of the form state to track against the original state in {@link T}.
 */
export class FormState<T, F extends FormGroupState<T>> {
  private onShowSource = new Subject<void>();
  private onCancelSource = new Subject<void>();
  private onResetSource = new Subject<T>();
  private onFinishSource = new Subject<void>();

  /**
   * Observable to subscribe to when the editable form is being shown.
   */
  onShow = this.onShowSource.asObservable();

  /**
   * Observable to subscribe to when the editable form is being cancelled.
   */
  onCancel = this.onCancelSource.asObservable();

  /**
   * Observable to subscribe to when the editable form is being reset.
   *
   * Use this when it is required to set further data to `F` that `T` provides only the basis of, for instance
   * `T` may provide an `id` property but `F` requires the data object associated with that ID.
   */
  onReset = this.onResetSource.asObservable();

  /**
   * Observable to subscribe to when the editable form has finished editing.
   */
  onFinish = this.onFinishSource.asObservable();

  isEditing = false;

  /**
   * Helper property to get the {@link FormGroup} to use for rendering.
   */
  get formGroup(): FormGroup {
    return this.form.formGroup;
  }

  /**
   * Creates a new FormState object.
   *
   * @param original The original object state.
   * @param form The form definition to map to the original object state and track changes made.
   */
  constructor(
    public original: T,
    public form: F) {
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

  /**
   * Show the form for editing.
   */
  show() {
    this.isEditing = true;
    this.onShowSource.next();
  }

  /**
   * Cancel editing the form and reset the form state back to the {@link original}.
   */
  cancel() {
    this.isEditing = false;
    this.reset();
    this.onCancelSource.next();
  }

  /**
   * Finish editing the form after saving, setting the current form state to the new object state.
   *
   * @param next The new object state after saving.
   */
  finish(next: T) {
    this.isEditing = false;
    this.reset(next);
    this.onFinishSource.next();
  }
}

/**
 * Wrapper around an Angular {@link FormGroup} to track state easier.
 *
 * This is an abstract class and should be derived from. Each derived class should:
 *
 * 1. Define the {@link FormGroup} and controls required to define the form.
 * 2. Add `get` properties to access the form controls.
 */
export abstract class FormGroupState<T> implements Resetable<T> {

  /**
   * Helper property to check if the form is currently valid.
   */
  get valid() {
    return this.formGroup.valid;
  }

  /**
   * Creates a new `FormGroupState`.
   *
   * @param formGroup The {@link FormGroup} to track.
   */
  constructor(public formGroup: FormGroup) { }

  /**
   * Resets the form group to a new object state.
   *
   * @param state The object state to reset the form to.
   *
   * The property keys in `state` should match the form control names.
   */
  reset(state: T): void {
    this.formGroup.reset(state);
  }

  /**
   * Enable the controls in the form group.
   */
  enable() {
    this.formGroup.enable();
  }

  /**
   * Disable the controls in the form group.
   */
  disable() {
    this.formGroup.disable();
  }
}

/**
 * `FormGroupState` object to track form fields related to catalogue item details.
 *
 * This state object tracks changes to catalogue item labels.
 */
export class CatalogueItemDetailForm<T extends Labelable> extends FormGroupState<T> {

  get label() {
    return this.formGroup.get('label');
  }

  constructor() {
    super(new FormGroup({
      label: new FormControl('', [
        Validators.required // eslint-disable-line @typescript-eslint/unbound-method
      ])
    }));
  }
}

/**
 * `FormGroupState` object to track form fields related to container default profiles.
 *
 * This state object tracks changes to description fields of container types.
 */
export class ContainerDefaultProfileForm<T extends Describable> extends FormGroupState<T> {

  get description() {
    return this.formGroup.get('description');
  }

  set descriptionValue(value: string) {
    this.description.setValue(value);
  }

  constructor() {
    super(new FormGroup({
      description: new FormControl('')
    }));
  }
}

/**
 * Represents the state of a form that can be edited.
 *
 * @deprecated Use {@link FormState} instead. Phase out this class type.
 */
export class Editable<T, F extends Resetable<T>> {
  private onShowSource = new Subject<void>();
  private onCancelSource = new Subject<void>();
  private onResetSource = new Subject<T>();
  private onFinishSource = new Subject<void>();

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
   * Observable to subscribe to when the editable object state has finished editing.
   */
  onFinish = this.onFinishSource.asObservable();

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

  finish(next: T) {
    this.isEditing = false;
    this.reset(next);
    this.onFinishSource.next();
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

export interface Labelable {
  label: string;
}

export interface Describable {
  description?: string;
}