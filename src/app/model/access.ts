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
 * Represents access/permissions flags to determine what a catalogue item can do.
 *
 * @see {@link SecurityHandlerService.elementAccess}
 */
export interface Access {
  showEdit: boolean;
  canEditDescription: boolean;
  showNewVersion?: boolean;
  showFinalise: boolean;
  showPermission: boolean;
  showSoftDelete: boolean;
  showPermanentDelete: boolean;
  canAddAnnotation: boolean;
  canAddMetadata: boolean;
  showDelete: boolean;
  canAddLink: boolean;
  canCreateFolder: boolean;
  canCreateVersionedFolder: boolean;
  canCreateFolderContainer: boolean;
  canCreateModel: boolean;
  canCreateModelItem: boolean;
  canCreate: boolean;
  canMoveToFolder: boolean;
  canMoveToVersionedFolder: boolean;
  canReadAfterFinalised: boolean;
  canEditAfterFinalise: boolean;
  canMergeInto: boolean;
}