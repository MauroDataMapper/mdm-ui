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
  VersionedFolder = 'vf',
  VersionLink = 'vl'
}

export const pathElementTypeNames = new Map<PathElementType, string>(
  [
    [ PathElementType.ApiKey, 'API key'],
    [ PathElementType.Annotation, 'Annotation'],
    [ PathElementType.ApiProperty, 'API property'],
    [ PathElementType.Authority, 'Authority'],
    [ PathElementType.Classifier, 'Classifier'],
    [ PathElementType.CodeSet, 'Code set'],
    [ PathElementType.CatalogueUser, 'Catalogue user'],
    [ PathElementType.DataClass, 'Data class'],
    [ PathElementType.DataClassComponent, 'Data class component'],
    [ PathElementType.DataElement, 'Data element'],
    [ PathElementType.DataElementComponent, 'Data element component'],
    [ PathElementType.DataFlow, 'Data flow'],
    [ PathElementType.DataModel, 'Data model'],
    [ PathElementType.EnumerationType, 'Enumeration type'],
    [ PathElementType.Edit, 'Edit'],
    [ PathElementType.EnumerationValue, 'Enumeration value'],
    [ PathElementType.Folder, 'Folder'],
    [ PathElementType.GroupRole, 'Group role'],
    [ PathElementType.Metadata, 'Metadata'],
    [ PathElementType.ReferenceDataElement, 'Reference data element'],
    [ PathElementType.ReferenceDataModel, 'Reference data model'],
    [ PathElementType.ReferenceEnumerationType, 'Reference enumeration type'],
    [ PathElementType.ReferenceDataValue, 'Reference data value'],
    [ PathElementType.ReferenceEnumerationValue, 'Reference enumeration value'],
    [ PathElementType.ReferenceFile, 'Reference file'],
    [ PathElementType.RuleRepresentation, 'Rule representation'],
    [ PathElementType.ReferenceSummaryMetadata, 'Reference summary metadata'],
    [ PathElementType.ReferenceSummaryMetadataReport, 'Reference summary metadata report'],
    [ PathElementType.Rule, 'Rule'],
    [ PathElementType.SemanticLink, 'Semantic link'],
    [ PathElementType.SummaryMetadata, 'Summary metadata'],
    [ PathElementType.SummaryMetadataReport, 'Summary metadata report'],
    [ PathElementType.SecurableResourceGroupRole, 'Securable resource group role'],
    [ PathElementType.SubscribedCatalogue, 'Subscribed catalogue'],
    [ PathElementType.SubscribedModel, 'Subscribed model'],
    [ PathElementType.Terminology, 'Terminology'],
    [ PathElementType.Term, 'Term'],
    [ PathElementType.TermRelationship, 'Term relationship'],
    [ PathElementType.TermRelationshipType, 'Term relationship type'],
    [ PathElementType.UserGroup, 'User group'],
    [ PathElementType.UserImageFile, 'User image file'],
    [ PathElementType.VersionedFolder, 'Versioned folder'],
    [ PathElementType.VersionLink, 'Version link']
  ]
);

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