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
import { RequestSettings } from '@maurodatamapper/mdm-resources';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Interface to define standard properties/options for the `MdmRestHandlerService`.
 *
 * @see MdmRestHandlerService
 */
export interface MdmHttpHandlerOptions {
  /**
   * Determine if the `MdmRestHandlerService` should automatically handle `GET` request errors.
   *
   * If `true`, any `GET` request that returns a status code in the 4XX range will be automatically handled by the `MdmRestHandlerService`.
   * Provide a `false` value to override this behaviour and handle any HTTP error yourself.
   *
   * If no value is provided or is undefined, the default value is considered to be `true`.
   */
  handleGetErrors?: boolean;
}

export type MdmRestHandlerOptions = RequestSettings & MdmHttpHandlerOptions;

/**
 * Represents a generic error from an `mdm-resources` operation.
 */
export class MdmResourcesError {
  constructor(public response: HttpErrorResponse) { }
}
