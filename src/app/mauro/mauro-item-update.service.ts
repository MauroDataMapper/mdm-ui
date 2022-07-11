/*
Copyright 2020-2022 University of Oxford
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
import {
  CatalogueItemDomainType,
  isDataType,
  Term
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { forkJoin, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  MauroIdentifier,
  MauroItem,
  MauroItemResponse,
  MauroUpdatePayload
} from './mauro-item.types';

/**
 * Service to update any Mauro catalogue item based on identifying information and data to update.
 */
@Injectable({
  providedIn: 'root'
})
export class MauroItemUpdateService {
  constructor(private resources: MdmResourcesService) {}

  /**
   * Saves any Mauro catalogue item back to Mauro.
   *
   * @param identifier A {@link MauroIdentifier} containing identification information. At least an ID and
   * domain type is required, but some domain types based on hierarchy require further details.
   * @param item The item and data to save. This should contain the necessary fields to update.
   * @returns The updated catalogue item passed through an observable stream, if successful.
   */
  save(identifier: MauroIdentifier, item: MauroItem): Observable<MauroItem> {
    let response: Observable<MauroItemResponse>;

    if (identifier.domainType === CatalogueItemDomainType.DataModel) {
      response = this.saveDataModel(identifier, item);
    }

    if (identifier.domainType === CatalogueItemDomainType.DataClass) {
      response = this.saveDataClass(identifier, item);
    }

    if (identifier.domainType === CatalogueItemDomainType.DataElement) {
      response = this.saveDataElement(identifier, item);
    }

    if (isDataType(identifier.domainType)) {
      response = this.saveDataType(identifier, item);
    }

    if (identifier.domainType === CatalogueItemDomainType.Terminology) {
      response = this.saveTerminology(identifier, item);
    }

    if (identifier.domainType === CatalogueItemDomainType.Term) {
      response = this.saveTerm(identifier, item);
    }

    if (identifier.domainType === CatalogueItemDomainType.CodeSet) {
      response = this.saveCodeSet(identifier, item);
    }

    if (identifier.domainType === CatalogueItemDomainType.Folder) {
      response = this.saveFolder(identifier, item);
    }

    if (identifier.domainType === CatalogueItemDomainType.VersionedFolder) {
      response = this.saveVersionedFolder(identifier, item);
    }

    if (identifier.domainType === CatalogueItemDomainType.Classifier) {
      response = this.saveClassifier(identifier, item);
    }

    if (!response) {
      return throwError(`${identifier.domainType} is not supported`);
    }

    return response.pipe(map((res) => res.body));
  }

  /**
   * Save multiple Mauro catalogue items back to Mauro.
   *
   * @param payloads An array of Mauro items and identifiers required to update in bulk.
   * @returns An array of the updated catalogue items passed through an observable stream, if successful.
   */
  saveMany(payloads: MauroUpdatePayload[]): Observable<MauroItem[]> {
    const requests$ = payloads.map((payload) =>
      this.save(payload.identifier, payload.item)
    );

    return forkJoin(requests$);
  }

  private saveDataModel(
    identifier: MauroIdentifier,
    item: MauroItem
  ): Observable<MauroItemResponse> {
    return this.resources.dataModel.update(identifier.id, item);
  }

  private saveDataClass(
    identifier: MauroIdentifier,
    item: MauroItem
  ): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(
        `${identifier.domainType} ${identifier.id} has not provided a model`
      );
    }

    const dataClassId = identifier.parentDataClass ?? identifier.dataClass;
    if (dataClassId) {
      return this.resources.dataClass.updateChildDataClass(
        identifier.model,
        dataClassId,
        identifier.id,
        item
      );
    }

    return this.resources.dataClass.update(
      identifier.model,
      identifier.id,
      item
    );
  }

  private saveDataElement(
    identifier: MauroIdentifier,
    item: MauroItem
  ): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(
        `${identifier.domainType} ${identifier.id} has not provided a model`
      );
    }

    if (!identifier.dataClass) {
      return throwError(
        `${identifier.domainType} ${identifier.id} has not provided a data class`
      );
    }

    return this.resources.dataElement.update(
      identifier.model,
      identifier.dataClass,
      identifier.id,
      item
    );
  }

  private saveDataType(
    identifier: MauroIdentifier,
    item: MauroItem
  ): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(
        `${identifier.domainType} ${identifier.id} has not provided a model`
      );
    }

    return this.resources.dataType.update(
      identifier.model,
      identifier.id,
      item
    );
  }

  private saveTerminology(
    identifier: MauroIdentifier,
    item: MauroItem
  ): Observable<MauroItemResponse> {
    return this.resources.terminology.update(identifier.id, item);
  }

  private saveTerm(
    identifier: MauroIdentifier,
    item: MauroItem
  ): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(
        `${identifier.domainType} ${identifier.id} has not provided a model`
      );
    }

    return this.resources.term.update(
      identifier.model,
      identifier.id,
      item as Term
    );
  }

  private saveCodeSet(
    identifier: MauroIdentifier,
    item: MauroItem
  ): Observable<MauroItemResponse> {
    return this.resources.codeSet.update(identifier.id, item);
  }

  private saveFolder(
    identifier: MauroIdentifier,
    item: MauroItem
  ): Observable<MauroItemResponse> {
    return this.resources.folder.update(identifier.id, item);
  }

  private saveVersionedFolder(
    identifier: MauroIdentifier,
    item: MauroItem
  ): Observable<MauroItemResponse> {
    return this.resources.versionedFolder.update(identifier.id, item);
  }

  private saveClassifier(
    identifier: MauroIdentifier,
    item: MauroItem
  ): Observable<MauroItemResponse> {
    return this.resources.classifier.update(identifier.id, item);
  }
}
