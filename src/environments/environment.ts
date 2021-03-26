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
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  version: '5.3.0-SNAPSHOT',
  apiEndpoint: 'http://localhost:8080/api',
  HDFLink: '',
  appTitle: 'Mauro Data Mapper',
  appDescription: 'The Mauro Data Mapper is a toolkit for creating, sharing, and updating data models.',
  catalogueDisplayName: 'Mauro Data Mapper',
  youTrack: {
    url: 'https://metadatacatalogue.myjetbrains.com/youtrack',
    project: 'MC'
  },
  wiki: 'https://modelcatalogue.cs.ox.ac.uk/wiki',
  simpleViewSupport: false,
  name: 'development',
  appIsEditable: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
