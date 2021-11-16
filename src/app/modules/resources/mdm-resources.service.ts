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
import {
  MdmResourcesConfiguration,
  MdmClassifierResource,
  MdmCatalogueItemResource,
  MdmDataClassResource,
  MdmDataElementResource,
  MdmFolderResource,
  MdmTerminologyResource,
  MdmTermResource,
  MdmCatalogueUserResource,
  MdmSecurityResource,
  MdmProviderResource,
  MdmSessionResource,
  MdmImporterResource,
  MdmAdminResource,
  MdmDataModelResource,
  MdmDataFlowResource,
  MdmEnumerationValuesResource,
  MdmDataTypeResource,
  MdmCodeSetResource,
  MdmFacetsResource,
  MdmMetadataResource,
  MdmSummaryMetadataResource,
  MdmTreeItemResource,
  MdmEditResource,
  MdmSecurableResource,
  MdmUserGroupsResource,
  MdmVersionLinkResource,
  MdmUserImageFileResource,
  MdmReferenceDataModelResource,
  MdmReferenceDataElementResource,
  MdmReferenceDataTypeResource,
  MdmReferenceDataValueResource,
  MdmVersioningResource,
  MdmApiPropertyResources,
  MdmSubscribedCataloguesResource,
  MdmProfileResource,
  MdmVersionedFolderResource,
  MdmPluginOpenIdConnectResource,
  MdmMergeResource,
  MdmPluginDoiResource,
  MdmTermRelationshipTypeResource
} from '@maurodatamapper/mdm-resources';
import { MdmRestHandlerService } from './mdm-rest-handler.service';

/**
 * Make @mdm-api/resources available through Angular service.
 */
@Injectable()
export class MdmResourcesService {

  /**
   * @param resourcesConfig Customize apiEndpoint.
   * @param restHandler Custom rest requests handler. In this case injecting rest handler that uses Angular's HttpClient.
   */

  classifier = new MdmClassifierResource(this.resourcesConfig, this.restHandler);
  terminology = new MdmTerminologyResource(this.resourcesConfig, this.restHandler);
  terms = new MdmTermResource(this.resourcesConfig, this.restHandler);
  term = new MdmTermResource(this.resourcesConfig, this.restHandler);
  termRelationshipTypes = new MdmTermRelationshipTypeResource(this.resourcesConfig, this.restHandler);
  folder = new MdmFolderResource(this.resourcesConfig, this.restHandler);
  versionedFolder = new MdmVersionedFolderResource(this.resourcesConfig, this.restHandler);
  catalogueUser = new MdmCatalogueUserResource(this.resourcesConfig, this.restHandler);
  catalogueItem = new MdmCatalogueItemResource(this.resourcesConfig, this.restHandler);
  enumerationValues = new MdmEnumerationValuesResource(this.resourcesConfig, this.restHandler);
  security = new MdmSecurityResource(this.resourcesConfig, this.restHandler);
  session = new MdmSessionResource(this.resourcesConfig, this.restHandler);
  tree = new MdmTreeItemResource(this.resourcesConfig, this.restHandler);
  metadata = new MdmMetadataResource(this.resourcesConfig, this.restHandler);
  facets = new MdmFacetsResource(this.resourcesConfig, this.restHandler);
  dataModel = new MdmDataModelResource(this.resourcesConfig, this.restHandler);
  dataFlow = new MdmDataFlowResource(this.resourcesConfig, this.restHandler);
  dataClass = new MdmDataClassResource(this.resourcesConfig, this.restHandler);
  dataType = new MdmDataTypeResource(this.resourcesConfig, this.restHandler);
  admin = new MdmAdminResource(this.resourcesConfig, this.restHandler);
  dataElement = new MdmDataElementResource(this.resourcesConfig, this.restHandler);
  importer = new MdmImporterResource(this.resourcesConfig, this.restHandler);
  codeSet = new MdmCodeSetResource(this.resourcesConfig, this.restHandler);
  provider = new MdmProviderResource(this.resourcesConfig, this.restHandler);
  edit = new MdmEditResource(this.resourcesConfig, this.restHandler);
  summaryMetadata = new MdmSummaryMetadataResource(this.resourcesConfig, this.restHandler);
  userGroups = new MdmUserGroupsResource(this.resourcesConfig, this.restHandler);
  securableResource = new MdmSecurableResource(this.resourcesConfig, this.restHandler);
  versionLink = new MdmVersionLinkResource(this.resourcesConfig, this.restHandler);
  userImage = new MdmUserImageFileResource(this.resourcesConfig, this.restHandler);
  versioning = new MdmVersioningResource(this.resourcesConfig, this.restHandler);
  referenceDataModel = new MdmReferenceDataModelResource(this.resourcesConfig, this.restHandler);
  referenceDataElement = new MdmReferenceDataElementResource(this.resourcesConfig, this.restHandler);
  referenceDataType = new MdmReferenceDataTypeResource(this.resourcesConfig, this.restHandler);
  referenceDataValue = new MdmReferenceDataValueResource(this.resourcesConfig, this.restHandler);
  profile = new MdmProfileResource(this.resourcesConfig, this.restHandler);
  apiProperties = new MdmApiPropertyResources(this.resourcesConfig, this.restHandler);
  subscribedCatalogues = new MdmSubscribedCataloguesResource(this.resourcesConfig, this.restHandler);
  pluginOpenIdConnect = new MdmPluginOpenIdConnectResource(this.resourcesConfig, this.restHandler);
  pluginDoi = new MdmPluginDoiResource(this.resourcesConfig, this.restHandler);
  merge = new MdmMergeResource(this.resourcesConfig, this.restHandler);

  constructor(private resourcesConfig: MdmResourcesConfiguration, private restHandler: MdmRestHandlerService) { }
}
