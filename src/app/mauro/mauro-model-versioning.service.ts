/*
Copyright 2020-2023 University of Oxford and NHS England

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
  FinalisePayload,
  ModelVersion,
  ModelVersionResponse
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
export class MauroModelVersioningService {
  constructor(private resources: MdmResourcesService) {}

  getLatestModelVersion(identifier: MauroIdentifier): Observable<ModelVersion> {
    let response: Observable<ModelVersionResponse>;

    if (identifier.domainType === CatalogueItemDomainType.DataModel) {
      response = this.getLatestDataModelVersion(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.Terminology) {
      response = this.getLatestTerminologyVersion(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.CodeSet) {
      response = this.getLatestCodeSetVersion(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.ReferenceDataModel) {
      response = this.getLatestReferenceDataModelVersion(identifier);
    }

    if (identifier.domainType === CatalogueItemDomainType.VersionedFolder) {
      response = this.getLatestVersionedFolderVersion(identifier);
    }

    if (!response) {
      return throwError(`${identifier.domainType} is not supported`);
    }

    return response.pipe(map((res) => res.body));
  }

  finalise(
    identifier: MauroIdentifier,
    payload: FinalisePayload
  ): Observable<MauroItem> {
    let response: Observable<MauroItemResponse>;

    if (identifier.domainType === CatalogueItemDomainType.DataModel) {
      response = this.finaliseDataModel(identifier, payload);
    }

    if (identifier.domainType === CatalogueItemDomainType.Terminology) {
      response = this.finaliseTerminology(identifier, payload);
    }

    if (identifier.domainType === CatalogueItemDomainType.CodeSet) {
      response = this.finaliseCodeSet(identifier, payload);
    }

    if (identifier.domainType === CatalogueItemDomainType.ReferenceDataModel) {
      response = this.finaliseReferenceDataModel(identifier, payload);
    }

    if (identifier.domainType === CatalogueItemDomainType.VersionedFolder) {
      response = this.finaliseVersionedFolder(identifier, payload);
    }

    if (!response) {
      return throwError(`${identifier.domainType} is not supported`);
    }

    return response.pipe(map((res) => res.body));
  }

  private getLatestDataModelVersion(
    identifier: MauroIdentifier
  ): Observable<ModelVersionResponse> {
    return this.resources.dataModel.latestModelVersion(identifier.id);
  }

  private getLatestTerminologyVersion(
    identifier: MauroIdentifier
  ): Observable<ModelVersionResponse> {
    return this.resources.terminology.latestModelVersion(identifier.id);
  }

  private getLatestCodeSetVersion(
    identifier: MauroIdentifier
  ): Observable<ModelVersionResponse> {
    return this.resources.codeSet.latestModelVersion(identifier.id);
  }

  private getLatestReferenceDataModelVersion(
    identifier: MauroIdentifier
  ): Observable<ModelVersionResponse> {
    return this.resources.referenceDataModel.latestModelVersion(identifier.id);
  }

  private getLatestVersionedFolderVersion(
    identifier: MauroIdentifier
  ): Observable<ModelVersionResponse> {
    return this.resources.versionedFolder.latestModelVersion(identifier.id);
  }

  private finaliseDataModel(
    identifier: MauroIdentifier,
    payload: FinalisePayload
  ): Observable<MauroItemResponse> {
    return this.resources.dataModel.finalise(identifier.id, payload);
  }

  private finaliseTerminology(
    identifier: MauroIdentifier,
    payload: FinalisePayload
  ): Observable<MauroItemResponse> {
    return this.resources.terminology.finalise(identifier.id, payload);
  }

  private finaliseCodeSet(
    identifier: MauroIdentifier,
    payload: FinalisePayload
  ): Observable<MauroItemResponse> {
    return this.resources.codeSet.finalise(identifier.id, payload);
  }

  private finaliseReferenceDataModel(
    identifier: MauroIdentifier,
    payload: FinalisePayload
  ): Observable<MauroItemResponse> {
    return this.resources.referenceDataModel.finalise(identifier.id, payload);
  }

  private finaliseVersionedFolder(
    identifier: MauroIdentifier,
    payload: FinalisePayload
  ): Observable<MauroItemResponse> {
    return this.resources.versionedFolder.finalise(identifier.id, payload);
  }
}
