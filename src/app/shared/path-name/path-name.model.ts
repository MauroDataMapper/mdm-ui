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

export interface PathProperty {
  name: string;
  qualifiedName: string[];
}

export interface PathElement {
  type: PathElementType;
  label: string;
  property?: PathProperty;
}