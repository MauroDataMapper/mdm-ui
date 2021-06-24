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
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

/**
 * Custom validator functions to compliment {@link Validators} from `@angular/forms`
 */
export class MdmValidators {
  /**
   * Validator that requires a control value to be non-empty only if a condition is met.
   * @param predicate The predicate to return true, meaning the value is required.
   * @returns An error map with the `required` property if `predicate()` returns `true` and the validation
   * check fails, otherwise `null`.
   */
  static requiredConditional(predicate: () => boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return predicate() ? Validators.required(control) : null;
    };
  }
}
