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

/**
 * Prefixes used in Mauro to represent Fully Qualified Paths (FQPs).
 */
import {
  CatalogueItemDomainType,
  PathableDomainType
} from '@maurodatamapper/mdm-resources';

/**
 * Prefixes used in Mauro to represent Fully Qualified Paths (FQPs).
 */
export enum PathElementType {
  ApiKey = 'ak',
  Annotation = 'ann',
  ApiProperty = 'api',
  Authority = 'auth',
  Classifier = 'cl',
  CodeSet = 'cs',
  CatalogueUser = 'cu',
  DataClass = 'dc',
  DataClassComponent = 'dcc',
  DataElement = 'de',
  DataElementComponent = 'dec',
  DataFlow = 'df',
  DataModel = 'dm',
  EnumerationType = 'dt',
  Edit = 'ed',
  EnumerationValue = 'ev',
  Folder = 'fo',
  GroupRole = 'gr',
  Metadata = 'md',
  ReferenceDataElement = 'rde',
  ReferenceDataModel = 'rdm',
  ReferenceEnumerationType = 'rdt',
  ReferenceDataValue = 'rdv',
  ReferenceEnumerationValue = 'rev',
  ReferenceFile = 'rf',
  RuleRepresentation = 'rr',
  ReferenceSummaryMetadata = 'rsm',
  ReferenceSummaryMetadataReport = 'rsmr',
  Rule = 'ru',
  SemanticLink = 'sl',
  SummaryMetadata = 'sm',
  SummaryMetadataReport = 'smr',
  SecurableResourceGroupRole = 'srgr',
  SubscribedCatalogue = 'subc',
  SubscribedModel = 'subm',
  Terminology = 'te',
  Term = 'tm',
  TermRelationship = 'tr',
  TermRelationshipType = 'trt',
  UserGroup = 'ug',
  UserImageFile = 'uif',
  ThemeImageFile = 'tif',
  VersionedFolder = 'vf',
  VersionLink = 'vl'
}

export const pathElementTypeNames = new Map<PathElementType, string>([
  [PathElementType.ApiKey, 'API key'],
  [PathElementType.Annotation, 'Annotation'],
  [PathElementType.ApiProperty, 'API property'],
  [PathElementType.Authority, 'Authority'],
  [PathElementType.Classifier, 'Classifier'],
  [PathElementType.CodeSet, 'Code set'],
  [PathElementType.CatalogueUser, 'Catalogue user'],
  [PathElementType.DataClass, 'Data class'],
  [PathElementType.DataClassComponent, 'Data class component'],
  [PathElementType.DataElement, 'Data element'],
  [PathElementType.DataElementComponent, 'Data element component'],
  [PathElementType.DataFlow, 'Data flow'],
  [PathElementType.DataModel, 'Data model'],
  [PathElementType.EnumerationType, 'Enumeration type'],
  [PathElementType.Edit, 'Edit'],
  [PathElementType.EnumerationValue, 'Enumeration value'],
  [PathElementType.Folder, 'Folder'],
  [PathElementType.GroupRole, 'Group role'],
  [PathElementType.Metadata, 'Metadata'],
  [PathElementType.ReferenceDataElement, 'Reference data element'],
  [PathElementType.ReferenceDataModel, 'Reference data model'],
  [PathElementType.ReferenceEnumerationType, 'Reference enumeration type'],
  [PathElementType.ReferenceDataValue, 'Reference data value'],
  [PathElementType.ReferenceEnumerationValue, 'Reference enumeration value'],
  [PathElementType.ReferenceFile, 'Reference file'],
  [PathElementType.RuleRepresentation, 'Rule representation'],
  [PathElementType.ReferenceSummaryMetadata, 'Reference summary metadata'],
  [
    PathElementType.ReferenceSummaryMetadataReport,
    'Reference summary metadata report'
  ],
  [PathElementType.Rule, 'Rule'],
  [PathElementType.SemanticLink, 'Semantic link'],
  [PathElementType.SummaryMetadata, 'Summary metadata'],
  [PathElementType.SummaryMetadataReport, 'Summary metadata report'],
  [PathElementType.SecurableResourceGroupRole, 'Securable resource group role'],
  [PathElementType.SubscribedCatalogue, 'Subscribed catalogue'],
  [PathElementType.SubscribedModel, 'Subscribed model'],
  [PathElementType.Terminology, 'Terminology'],
  [PathElementType.Term, 'Term'],
  [PathElementType.TermRelationship, 'Term relationship'],
  [PathElementType.TermRelationshipType, 'Term relationship type'],
  [PathElementType.UserGroup, 'User group'],
  [PathElementType.UserImageFile, 'User image file'],
  [PathElementType.ThemeImageFile, 'Theme image file'],
  [PathElementType.VersionedFolder, 'Versioned folder'],
  [PathElementType.VersionLink, 'Version link']
]);

export const pathElementDomainTypes = new Map<
  CatalogueItemDomainType,
  PathElementType
>([
  [CatalogueItemDomainType.CodeSet, PathElementType.CodeSet],
  [CatalogueItemDomainType.DataClass, PathElementType.DataClass],
  [CatalogueItemDomainType.DataElement, PathElementType.DataElement],
  [CatalogueItemDomainType.DataModel, PathElementType.DataModel],
  [CatalogueItemDomainType.EnumerationType, PathElementType.EnumerationType],
  [CatalogueItemDomainType.Folder, PathElementType.Folder],
  [
    CatalogueItemDomainType.ReferenceDataModel,
    PathElementType.ReferenceDataModel
  ],
  [CatalogueItemDomainType.Term, PathElementType.Term],
  [CatalogueItemDomainType.Terminology, PathElementType.Terminology],
  [CatalogueItemDomainType.VersionedFolder, PathElementType.VersionedFolder]
]);

export const pathableDomainTypesFromPrefix = new Map<
  PathElementType,
  PathableDomainType
>([
  [PathElementType.Annotation, 'annotations'],
  [PathElementType.Authority, 'authorities'],
  [PathElementType.Classifier, 'classifiers'],
  [PathElementType.CodeSet, 'codeSets'],
  [PathElementType.CatalogueUser, 'catalogueUsers'],
  [PathElementType.DataClass, 'dataClasses'],
  [PathElementType.DataClassComponent, 'dataClassComponents'],
  [PathElementType.DataElement, 'dataElements'],
  [PathElementType.DataElementComponent, 'dataElementComponents'],
  [PathElementType.DataFlow, 'dataFlows'],
  [PathElementType.DataModel, 'dataModels'],
  [PathElementType.EnumerationType, 'enumerationTypes'],
  [PathElementType.Edit, 'edits'],
  [PathElementType.EnumerationValue, 'enumerationValues'],
  [PathElementType.Folder, 'folders'],
  [PathElementType.GroupRole, 'groupRoles'],
  [PathElementType.Metadata, 'metadata'],
  [PathElementType.ReferenceDataElement, 'referenceDataElements'],
  [PathElementType.ReferenceDataModel, 'referenceDataModels'],
  [PathElementType.ReferenceEnumerationType, 'referenceEnumerationTypes'],
  [PathElementType.ReferenceDataValue, 'referenceDataValues'],
  [PathElementType.ReferenceEnumerationValue, 'referenceEnumerationValues'],
  [PathElementType.ReferenceFile, 'referenceFiles'],
  [PathElementType.RuleRepresentation, 'ruleRepresentations'],
  [PathElementType.ReferenceSummaryMetadata, 'referenceSummaryMetadata'],
  [
    PathElementType.ReferenceSummaryMetadataReport,
    'referenceSummaryMetadataReports'
  ],
  [PathElementType.Rule, 'rules'],
  [PathElementType.SemanticLink, 'semanticLinks'],
  [PathElementType.SummaryMetadata, 'summaryMetadata'],
  [PathElementType.SummaryMetadataReport, 'summaryMetadataReports'],
  [PathElementType.Terminology, 'terminologies'],
  [PathElementType.Term, 'terms'],
  [PathElementType.TermRelationship, 'termRelationships'],
  [PathElementType.TermRelationshipType, 'termRelationshipTypes'],
  [PathElementType.UserGroup, 'userGroups'],
  [PathElementType.UserImageFile, 'userImageFiles'],
  [PathElementType.ThemeImageFile, 'themeImageFiles'],
  [PathElementType.VersionedFolder, 'versionedFolders'],
  [PathElementType.VersionLink, 'versionLinks']
]);

export interface PathProperty {
  name: string;
  qualifiedName: string[];
}

export interface PathElement {
  type: PathElementType;
  typeName: string;
  label: string;
  version?: string;
  property?: PathProperty;
}
