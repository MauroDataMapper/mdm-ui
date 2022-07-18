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
  isDataType
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { forkJoin, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  MauroIdentifier,
  MauroItem,
  MauroItemResponse
} from './mauro-item.types';

/**
 * Service to provide Mauro catalogue items based on any identifier information.
 */
@Injectable({
  providedIn: 'root'
})
export class MauroItemProviderService {
  constructor(private resources: MdmResourcesService) {}

  /**
   * Get any Mauro catalogue item based on the identifier information provided.
   *
   * @param identifier A {@link MauroIdentifier} containing identification information. At least an ID and
   * domain type is required, but some domain types based on hierarchy require further details.
   * @returns The requested catalogue item passed through an observable stream.
   */
  get(identifier: MauroIdentifier): Observable<MauroItem> {
    let response: Observable<MauroItemResponse>;

    if (identifier.domainType === CatalogueItemDomainType.DataModel) {
      response = this.getDataModel(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.DataClass) {
      response = this.getDataClass(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.DataElement) {
      response = this.getDataElement(identifier);
    }

    if (isDataType(identifier.domainType)) {
      response = this.getDataType(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.Terminology) {
      response = this.getTerminology(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.Term) {
      response = this.getTerm(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.CodeSet) {
      response = this.getCodeSet(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.Folder) {
      response = this.getFolder(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.VersionedFolder) {
      response = this.getVersionedFolder(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.Classifier) {
      response = this.getClassifier(identifier);
    }

    if (!response) {
      return throwError(`${identifier.domainType} is not supported`);
    }

    return response.pipe(map((res) => res.body));
  }

  /**
   * Get multiple Mauro catalogue items based on the provided identification information.
   *
   * @param identifiers An array of {@link MauroIdentifier} objects containing identification information.
   * At least an ID and domain type is required per object, but some domain types based on hierarchy require further details.
   * @returns An array of the requested catalogue items passed through an observable stream.
   */
  getMany(identifiers: MauroIdentifier[]): Observable<MauroItem[]> {
    const requests$ = identifiers.map((identifier) => this.get(identifier));
    return forkJoin(requests$);
  }

  private getDataModel(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    return this.resources.dataModel.get(identifier.id);
  }

  private getDataClass(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(
        `${identifier.domainType} ${identifier.id} has not provided a model`
      );
    }

    const dataClassId = identifier.parentDataClass ?? identifier.dataClass;
    if (dataClassId) {
      return this.resources.dataClass.getChildDataClass(
        identifier.model,
        dataClassId,
        identifier.id
      );
    }

    return this.resources.dataClass.get(identifier.model, identifier.id);
  }

  private getDataElement(
    identifier: MauroIdentifier
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

    return this.resources.dataElement.get(
      identifier.model,
      identifier.dataClass,
      identifier.id
    );
  }

  private getDataType(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(
        `${identifier.domainType} ${identifier.id} has not provided a model`
      );
    }

    return this.resources.dataType.get(identifier.model, identifier.id);
  }

  private getTerminology(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    return this.resources.terminology.get(identifier.id);
  }

  private getTerm(identifier: MauroIdentifier): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(
        `${identifier.domainType} ${identifier.id} has not provided a model`
      );
    }

    return this.resources.term.get(identifier.model, identifier.id);
  }

  private getCodeSet(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    return this.resources.codeSet.get(identifier.id);
  }

  private getFolder(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    return this.resources.folder.get(identifier.id);
  }

  private getVersionedFolder(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    return this.resources.versionedFolder.get(identifier.id);
  }

  private getClassifier(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    return this.resources.classifier.get(identifier.id);
  }
}
