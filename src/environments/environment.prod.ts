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
const packageFile = require('../../package.json');

export const environment = {
  production: true,
  version: packageFile?.version ?? '',
  apiEndpoint: 'api',
  HDFLink: '',
  themeName: $ENV.themeName ?? 'default',
  appTitle: 'Mauro Data Mapper',
  appDescription: 'The Mauro Data Mapper is a toolkit for creating, sharing, and updating data models.',
  catalogueDisplayName: 'Mauro Data Mapper',
  youTrack: {
    url: 'https://metadatacatalogue.myjetbrains.com/youtrack',
    project: 'MC'
  },
  documentation: {
    url: 'https://maurodatamapper.github.io/',
    pages: {
      Create_a_new_model: 'user-guides/create-a-data-model/create-a-data-model/',
      Edit_model_details: 'user-guides/create-a-data-model/create-a-data-model/#3-complete-new-data-model-form',
      Exporting_models: 'user-guides/exporting-data-models/exporting-data-models/',
      Importing_DataModels_Using_Excel: 'user-guides/import-data-model-from-excel/import-data-model-from-excel/',
      Preferences: 'user-guides/user-profile/user-profile/#3-update-preferences',
      Search_Help: 'user-guides/how-to-search/how-to-search/',
      User_profile: 'user-guides/user-profile/user-profile/',
      Merge_conflicts: null
    },
    importers: {
      DataModelExcelImporterService: 'Importing_DataModels_Using_Excel'
    }
  },
  simpleViewSupport: false,
  name: 'production',
  appIsEditable: false,
  checkSessionExpiryTimeout: 300000,
  features: {
    useSubscribedCatalogues: true,
    useVersionedFolders: true,
    useMergeUiV2: true,
    useOpenIdConnect: false,
    useDigitalObjectIdentifiers: false
  }
};
