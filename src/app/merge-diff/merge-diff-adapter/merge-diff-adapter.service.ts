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
import { CommitMergePayload, CommittedMergeResponse, MainBranchResponse, MdmResponse, MergableCatalogueItem, MergableMultiFacetAwareDomainType, MergeDiff, MergeDiffResponse, MultiFacetAwareDomainType, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { EMPTY, Observable, throwError } from 'rxjs';
import { MessageHandlerService } from '@mdm/services';
import { catchError, map } from 'rxjs/operators';


/**
 * Adapter service around {@link MdmResourcesService} to wrap around
 * merge and diff endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class MergeDiffAdapterService {
  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService) { }

  getCatalogueItemDetails(
    domainType: MergableMultiFacetAwareDomainType,
    id: Uuid): Observable<MdmResponse<MergableCatalogueItem>> {
    switch (domainType) {
      case MultiFacetAwareDomainType.DataModels:
        return this.resources.dataModel.get(id);
      case MultiFacetAwareDomainType.ReferenceDataModels:
        return this.resources.referenceDataModel.get(id);
      case MultiFacetAwareDomainType.Terminologies:
        return this.resources.terminology.get(id);
      case MultiFacetAwareDomainType.VersionedFolders:
        return this.resources.versionedFolder.get(id);
      default:
        return throwError(`Cannot get catalogue item details for ${domainType} ${id}: unrecognised domain type.`);
    }
  }

  getMainBranch(domainType: MergableMultiFacetAwareDomainType, id: Uuid): Observable<MainBranchResponse> {
    return this.resources.merge.currentMainBranch(domainType, id);
  }

  getMergeDiff(
    domainType: MergableMultiFacetAwareDomainType,
    sourceId: Uuid,
    targetId: Uuid): Observable<MergeDiff> {
    return this.resources.merge
      .mergeDiff(domainType, sourceId, targetId)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem analysing the differences between these two items.', error);
          return EMPTY;
        }),
        map((response: MergeDiffResponse) => response.body)
      );
  }

  commitMergePatches(
    domainType: MergableMultiFacetAwareDomainType,
    sourceId: Uuid,
    targetId: Uuid,
    data: CommitMergePayload): Observable<MergableCatalogueItem> {
    return this.resources.merge
      .mergeInto(domainType, sourceId, targetId, data)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem committing the changes to the target item.', error);
          return EMPTY;
        }),
        map((response: CommittedMergeResponse) => response.body)
      );
  }
}
