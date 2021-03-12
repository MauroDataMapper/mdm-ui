/*
Copyright 2020 University of Oxford

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
  apiEndpoint: $ENV.apiEndpoint ?? 'api',
  HDFLink: '',
  themeName: $ENV.themeName ?? 'default',
  appTitle: 'Mauro Data Mapper',
  appDescription: 'The Mauro Data Mapper is a toolkit for creating, sharing, and updating data models.',
  catalogueDisplayName: 'Mauro Data Mapper',
  youTrack: {
    url: 'https://metadatacatalogue.myjetbrains.com/youtrack',
    project: 'MC'
  },
  wiki: 'https://modelcatalogue.cs.ox.ac.uk/wiki',
  simpleViewSupport: false,
  name: 'production',
  appIsEditable: false
};
