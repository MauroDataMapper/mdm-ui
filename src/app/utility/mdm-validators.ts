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
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/**
 * Custom validator functions to compliment {@link Validators} from `@angular/forms`
 */
export class MdmValidators {
  /**
   * Validator that requires a control value to be non-empty only if a condition is met.
   *
   * @param predicate The predicate to return true, meaning the value is required.
   * @returns An error map with the `required` property if `predicate()` returns `true` and the validation
   * check fails, otherwise `null`.
   */
  static requiredConditional(predicate: (() => boolean)): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return predicate() ? Validators.required(control) : null;
    };
  }

  /**
   * Validator that requires a control value to be a valid URL.
   *
   * @returns An error map with the `url` property returning `true` if the validation
   * check fails, otherwise `null`.
   */
  static url(control: AbstractControl): ValidationErrors | null {
    const fn = Validators.pattern(/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i);
    const errors = fn(control);
    return errors !== null ? { url: true } : null;
  }
}
