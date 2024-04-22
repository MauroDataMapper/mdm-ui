/*
Copyright 2020-2024 University of Oxford and NHS England

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
  RemoveQueryParameters
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  MauroIdentifier,
  MauroItem,
  MauroItemResponse
} from './mauro-item.types';

@Injectable({
  providedIn: 'root'
})
export class MauroItemRemoveService {
  constructor(private resources: MdmResourcesService) {}

  remove(
    identifier: MauroIdentifier,
    query?: RemoveQueryParameters
  ): Observable<unknown> {
    if (identifier.domainType === CatalogueItemDomainType.DataModel) {
      return this.removeDataModel(identifier, query);
    }

    if (identifier.domainType === CatalogueItemDomainType.Terminology) {
      return this.removeTerminology(identifier, query);
    }

    if (identifier.domainType === CatalogueItemDomainType.CodeSet) {
      return this.removeCodeSet(identifier, query);
    }

    if (identifier.domainType === CatalogueItemDomainType.ReferenceDataModel) {
      return this.removeReferenceDataModel(identifier, query);
    }

    if (identifier.domainType === CatalogueItemDomainType.Folder) {
      return this.removeFolder(identifier, query);
    }

    if (identifier.domainType === CatalogueItemDomainType.VersionedFolder) {
      return this.removeVersionedFolder(identifier, query);
    }

    if (identifier.domainType === CatalogueItemDomainType.Classifier) {
      return this.removeClassifier(identifier, query);
    }

    if (identifier.domainType === CatalogueItemDomainType.DataClass) {
      return this.removeDataClass(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.DataElement) {
      return this.removeDataElement(identifier);
    }

    if (isDataType(identifier.domainType)) {
      return this.removeDataType(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.Term) {
      return this.removeTerm(identifier);
    }

    return throwError(`${identifier.domainType} is not supported`);
  }

  restore(identifier: MauroIdentifier): Observable<MauroItem> {
    let response: Observable<MauroItemResponse>;

    if (identifier.domainType === CatalogueItemDomainType.DataModel) {
      response = this.restoreDataModel(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.Terminology) {
      response = this.restoreTerminology(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.CodeSet) {
      response = this.restoreCodeSet(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.ReferenceDataModel) {
      response = this.restoreReferenceDataModel(identifier);
    }

    if (!response) {
      return throwError(`${identifier.domainType} is not supported`);
    }

    return response.pipe(map((res) => res.body));
  }

  private removeDataModel(
    identifier: MauroIdentifier,
    query?: RemoveQueryParameters
  ) {
    return this.resources.dataModel.remove(identifier.id, query);
  }

  private removeTerminology(
    identifier: MauroIdentifier,
    query?: RemoveQueryParameters
  ) {
    return this.resources.terminology.remove(identifier.id, query);
  }

  private removeCodeSet(
    identifier: MauroIdentifier,
    query?: RemoveQueryParameters
  ) {
    return this.resources.codeSet.remove(identifier.id, query);
  }

  private removeReferenceDataModel(
    identifier: MauroIdentifier,
    query?: RemoveQueryParameters
  ) {
    return this.resources.referenceDataModel.remove(identifier.id, query);
  }

  private removeFolder(
    identifier: MauroIdentifier,
    query?: RemoveQueryParameters
  ) {
    return this.resources.folder.remove(identifier.id, query);
  }

  private removeVersionedFolder(
    identifier: MauroIdentifier,
    query?: RemoveQueryParameters
  ) {
    return this.resources.versionedFolder.remove(identifier.id, query);
  }

  private removeClassifier(
    identifier: MauroIdentifier,
    query?: RemoveQueryParameters
  ) {
    return this.resources.classifier.remove(identifier.id, query);
  }

  private removeDataClass(identifier: MauroIdentifier) {
    if (identifier.parentDataClass) {
      return this.resources.dataClass.removeChildDataClass(
        identifier.model,
        identifier.parentDataClass,
        identifier.id
      );
    }

    return this.resources.dataClass.remove(identifier.model, identifier.id);
  }

  private removeDataElement(identifier: MauroIdentifier) {
    return this.resources.dataElement.remove(
      identifier.model,
      identifier.dataClass,
      identifier.id
    );
  }

  private removeDataType(identifier: MauroIdentifier) {
    return this.resources.dataType.remove(identifier.model, identifier.id);
  }

  private removeTerm(identifier: MauroIdentifier) {
    return this.resources.term.remove(identifier.model, identifier.id);
  }

  private restoreDataModel(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    return this.resources.dataModel.undoSoftDelete(identifier.id);
  }

  private restoreTerminology(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    return this.resources.terminology.undoSoftDelete(identifier.id);
  }

  private restoreCodeSet(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    return this.resources.codeSet.undoSoftDelete(identifier.id);
  }

  private restoreReferenceDataModel(
    identifier: MauroIdentifier
  ): Observable<MauroItemResponse> {
    return this.resources.referenceDataModel.undoSoftDelete(identifier.id);
  }
}
