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
import { MdmResourcesService } from '@mdm/modules/resources';
import { Observable } from 'rxjs';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsHandlerService {
  defaultSettings = {
    countPerTable: 20,
    counts: [5, 10, 20, 50],
    expandMoreDescription: false,
    favourites: [],
    includeModelSuperseded: true,
    includeDocumentSuperseded: false,
    includeDeleted: false,
    dataFlowDiagramsSetting: {}
  };
  constructor(
    private resources: MdmResourcesService,
    private securityHandler: SecurityHandlerService
  ) { }

  getUserSettings() {
    let settings = JSON.parse(localStorage.getItem('userSettings'));
    if (!settings) {
      this.updateUserSettings(this.defaultSettings);
      settings = this.defaultSettings;
    }
    return settings;
  }

  updateUserSettings(setting) {
    localStorage.setItem('userSettings', JSON.stringify(setting));
  }

  initUserSettings() {

    const promise = new Promise((resolve, reject) => {
      this.resources.catalogueUser.userPreferences(localStorage.getItem('userId')).subscribe(res => {
        const result = res.body;
        let settings = null;
        if (!result) {
          settings = this.defaultSettings;
        } else {
          // check if we have added new items but they don't exists already, then add them
          for (const property in this.defaultSettings) {
            if (this.defaultSettings.hasOwnProperty(property) && !result[property]) {
              result[property] = this.defaultSettings[property];
            }
          }
            // save them into the localStorage
          settings = result;
        }
        // save it locally
        this.updateUserSettings(settings);
        resolve(settings);
      }, error => {
          reject(error);
        }
      );
    });
    return promise;
  }

  init() {
    if (this.securityHandler.isLoggedIn()) {
      return this.initUserSettings();
    }
  }

  update(setting, value) {
    const storage = this.getUserSettings();
    storage[setting] = value;
    this.updateUserSettings(storage);
  }

  get(setting) {
    const storage = this.getUserSettings();
    return storage[setting];
  }

  removeAll() {
    localStorage.removeItem('userSettings');
  }

  saveOnServer(): Observable<any> {
    return this.resources.catalogueUser.updateUserPreferences(localStorage.getItem('userId'), this.getUserSettings());
  }

  handleCountPerTable(items) {
    let counts = this.get('counts');
    if (items && items.length < 5) {
      counts = [];
    }
    return counts;
  }
}
