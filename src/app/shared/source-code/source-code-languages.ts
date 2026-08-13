/*
Copyright 2020-2026 University of Oxford and NHS England

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
export class SourceCodeLanguage {
  displayName: string;
  value: string;
  aceValue?: string;
  fileExt?: string;
}

export const supportedSourceCodeLanguages: SourceCodeLanguage[] = [
  { displayName: 'SQL', value: 'sql', aceValue: 'sql', fileExt: 'sql' },
  { displayName: 'C#', value: 'c#', aceValue: 'csharp', fileExt: 'cs' },
  {
    displayName: 'JavaScript',
    value: 'javascript',
    aceValue: 'javascript',
    fileExt: 'js'
  },
  { displayName: 'Java', value: 'java', aceValue: 'java', fileExt: 'java' },
  {
    displayName: 'JSON',
    value: 'json',
    aceValue: 'json',
    fileExt: 'json'
  },
  {
    displayName: 'JSON (MEQL)',
    value: 'json-meql',
    aceValue: 'json',
    fileExt: 'json'
  },
  {
    displayName: 'Typescript',
    value: 'typescript',
    aceValue: 'typescript',
    fileExt: 'ts'
  },
  {
    displayName: 'Drools',
    value: 'drools',
    aceValue: 'drools',
    fileExt: 'drools'
  },
  { displayName: 'Text', value: 'text', aceValue: 'text', fileExt: 'txt' },
  { displayName: 'DMN', value: 'dmn', fileExt: 'dmn' }
];
