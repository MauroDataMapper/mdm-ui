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
import { Injectable } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';

/**
 * Adapter service around {@link MdmResourcesService} to wrap around
 * merge and diff endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class MergeDiffAdapterService {

  constructor(private resources : MdmResourcesService) { }
  /*
  TODO: add in adapter functions when required here.

  Idea of the adapter is to:

  1. Correctly map types from mdm-resources to the UI. The types for merge/diff data should be
  defined in mdm-resources, but the adapter functions here can make them nicer to use, e.g.

  ```
  getMergeDiff(sourceId: Uuid, targetId: Uuid): Observable<MdmMergeDiffItem[]> {
    return this.resources.merge
      .mergeDiff(sourceId, targetId)
      .pipe(
        catchError(error => ...),  // Common error handling (maybe)
        map((response: MdmMergeDiffResponse) => response.body)  // Map to types we care about
      );
  }
  ```

  2. Act as proxies whilst the backend endpoints are being developed, allowing the UI to
  define the low level functionality required for the UI components, but temporarily return fake
  data. e.g.

  ```
  import * as data from './fake-data.json';

  getMergeDiff(sourceId: Uuid, targetId: Uuid): Observable<MdmMergeDiffItem[]> {
    return of(data);
  }
  ```
  */
}
