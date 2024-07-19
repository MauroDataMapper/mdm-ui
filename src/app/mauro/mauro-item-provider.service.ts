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
  PathQueryParameters
} from '@maurodatamapper/mdm-resources';
import {
  MdmHttpHandlerOptions,
  MdmResourcesService
} from '@mdm/modules/resources';
import { PathNameService } from '@mdm/shared/path-name/path-name.service';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  MauroIdentifier,
  MauroItem,
  MauroItemLocateOptions,
  MauroItemResponse
} from './mauro-item.types';

/**
 * Service to provide Mauro catalogue items based on any identifier information.
 */
@Injectable({
  providedIn: 'root'
})
export class MauroItemProviderService {
  constructor(
    private resources: MdmResourcesService,
    private pathNames: PathNameService
  ) {}

  /**
   * Get any Mauro catalogue item based on the identifier information provided.
   *
   * @param identifier A {@link MauroIdentifier} containing identification information. At least an ID and
   * domain type is required, but some domain types based on hierarchy require further details.
   * @returns The requested catalogue item passed through an observable stream.
   *
   * In case of trying to get an item that does not exist, you can pass the {@link MauroIdentifierFetchOptions.failSilently}
   * option. If an item cannot be retrieved then an object identifier with an `error` and `errorStatus` property
   * will be returned instead.
   */
  get(identifier: MauroIdentifier): Observable<MauroItem> {
    const options: MdmHttpHandlerOptions = {
      handleGetErrors: !identifier.fetchOptions?.failSilently ?? true
    };
    let response: Observable<MauroItemResponse>;

    if (identifier.domainType === CatalogueItemDomainType.DataModel) {
      response = this.getDataModel(identifier, options);
    }

    if (identifier.domainType === CatalogueItemDomainType.DataClass) {
      response = this.getDataClass(identifier, options);
    }

    if (identifier.domainType === CatalogueItemDomainType.DataElement) {
      response = this.getDataElement(identifier, options);
    }

    if (isDataType(identifier.domainType)) {
      response = this.getDataType(identifier, options);
    }

    if (identifier.domainType === CatalogueItemDomainType.Terminology) {
      response = this.getTerminology(identifier, options);
    }

    if (identifier.domainType === CatalogueItemDomainType.Term) {
      response = this.getTerm(identifier, options);
    }

    if (identifier.domainType === CatalogueItemDomainType.CodeSet) {
      response = this.getCodeSet(identifier, options);
    }

    if (identifier.domainType === CatalogueItemDomainType.Folder) {
      response = this.getFolder(identifier, options);
    }

    if (identifier.domainType === CatalogueItemDomainType.VersionedFolder) {
      response = this.getVersionedFolder(identifier, options);
    }

    if (identifier.domainType === CatalogueItemDomainType.Classifier) {
      response = this.getClassifier(identifier, options);
    }

    if (!response) {
      return throwError(() => new Error(`${identifier.domainType} is not supported`));
    }

    return response.pipe(
      map((res) => res.body),
      catchError((error) => {
        if (identifier.fetchOptions?.failSilently) {
          return of({
            ...identifier,
            label: '',
            error: true,
            errorStatus: error.status
          });
        }

        return throwError(() => error);
      })
    );
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

  /**
   * Locate a catalogue item from its path.
   *
   * @param path The path to locate.
   * @param options The options to control the locate function.
   * @returns The matching catalogue item if found.
   */
  locate(
    path: string,
    options?: MauroItemLocateOptions
  ): Observable<MauroItem> {
    const domain =
      options?.domain ?? this.pathNames.getPathableDomainFromPath(path);
    const query: PathQueryParameters = {
      ...(options?.finalisedOnly && { finalised: options.finalisedOnly })
    };

    const request$: Observable<MauroItemResponse> = options?.parentId
      ? this.resources.catalogueItem.getPathFromParent(
          domain,
          options.parentId,
          path,
          query
        )
      : this.resources.catalogueItem.getPath(domain, path, query);

    return request$.pipe(map((response) => response.body));
  }

  private getDataModel(
    identifier: MauroIdentifier,
    options: MdmHttpHandlerOptions
  ): Observable<MauroItemResponse> {
    return this.resources.dataModel.get(identifier.id, {}, options);
  }

  private getDataClass(
    identifier: MauroIdentifier,
    options: MdmHttpHandlerOptions
  ): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(() =>
        new Error(`${identifier.domainType} ${identifier.id} has not provided a model`)
      );
    }

    const dataClassId = identifier.parentDataClass ?? identifier.dataClass;
    if (dataClassId) {
      return this.resources.dataClass.getChildDataClass(
        identifier.model,
        dataClassId,
        identifier.id,
        {},
        options
      );
    }

    return this.resources.dataClass.get(
      identifier.model,
      identifier.id,
      {},
      options
    );
  }

  private getDataElement(
    identifier: MauroIdentifier,
    options: MdmHttpHandlerOptions
  ): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(() =>
        new Error(`${identifier.domainType} ${identifier.id} has not provided a model`)
      );
    }

    if (!identifier.dataClass) {
      return throwError(() =>
        new Error(`${identifier.domainType} ${identifier.id} has not provided a data class`)
      );
    }

    return this.resources.dataElement.get(
      identifier.model,
      identifier.dataClass,
      identifier.id,
      {},
      options
    );
  }

  private getDataType(
    identifier: MauroIdentifier,
    options: MdmHttpHandlerOptions
  ): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(() =>
        new Error(`${identifier.domainType} ${identifier.id} has not provided a model`)
      );
    }

    return this.resources.dataType.get(
      identifier.model,
      identifier.id,
      {},
      options
    );
  }

  private getTerminology(
    identifier: MauroIdentifier,
    options: MdmHttpHandlerOptions
  ): Observable<MauroItemResponse> {
    return this.resources.terminology.get(identifier.id, {}, options);
  }

  private getTerm(
    identifier: MauroIdentifier,
    options: MdmHttpHandlerOptions
  ): Observable<MauroItemResponse> {
    if (!identifier.model) {
      return throwError(() =>
        new Error(`${identifier.domainType} ${identifier.id} has not provided a model`)
      );
    }

    return this.resources.term.get(
      identifier.model,
      identifier.id,
      {},
      options
    );
  }

  private getCodeSet(
    identifier: MauroIdentifier,
    options: MdmHttpHandlerOptions
  ): Observable<MauroItemResponse> {
    return this.resources.codeSet.get(identifier.id, {}, options);
  }

  private getFolder(
    identifier: MauroIdentifier,
    options: MdmHttpHandlerOptions
  ): Observable<MauroItemResponse> {
    return this.resources.folder.get(identifier.id, {}, options);
  }

  private getVersionedFolder(
    identifier: MauroIdentifier,
    options: MdmHttpHandlerOptions
  ): Observable<MauroItemResponse> {
    return this.resources.versionedFolder.get(identifier.id, {}, options);
  }

  private getClassifier(
    identifier: MauroIdentifier,
    options: MdmHttpHandlerOptions
  ): Observable<MauroItemResponse> {
    return this.resources.classifier.get(identifier.id, {}, options);
  }
}
