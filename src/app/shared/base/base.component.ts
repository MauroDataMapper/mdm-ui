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
import { Component } from '@angular/core';
import { CodeSetDetail, DataElementDetail, DataModelDetail, FolderDetail, TermDetail, TerminologyDetail, VersionedFolderDetail } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent {

  catalogueItem:
    | DataModelDetail
    | TermDetail
    | CodeSetDetail
    | TerminologyDetail
    | FolderDetail
    | DataElementDetail
    | VersionedFolderDetail;

  constructor() { }

  protected isGuid = (stringToTest) => {
    if (stringToTest && stringToTest[0] === '{') {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    // eslint-disable-next-line
    const regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  };
}
