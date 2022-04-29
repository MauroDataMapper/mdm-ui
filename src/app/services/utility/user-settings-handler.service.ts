/*
Copyright 2020-2022 University of Oxford
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
import { Observable, of } from 'rxjs';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { map } from 'rxjs/operators';
import { MdmResponse } from '@maurodatamapper/mdm-resources';
import { ContentEditorFormat } from '@mdm/constants/ui.types';

export interface UserSettings {
  countPerTable?: number;
  counts?: number[];
  expandMoreDescription?: boolean;
  favourites?: any[];
  includeModelSuperseded?: boolean;
  includeDocumentSuperseded?: boolean;
  includeDeleted?: boolean;
  showSupersededModels?: boolean;
  includeSupersededDocModels?: boolean;
  dataFlowDiagramsSetting?: any;
  editorFormat?: ContentEditorFormat;
}

@Injectable({
  providedIn: 'root'
})
export class UserSettingsHandlerService {
  defaultSettings: UserSettings = {
    countPerTable: 20,
    counts: [5, 10, 20, 50],
    expandMoreDescription: false,
    favourites: [],
    includeModelSuperseded: true,
    includeDocumentSuperseded: false,
    includeDeleted: false,
    dataFlowDiagramsSetting: {},
    editorFormat: 'markdown'
  };

  constructor(
    private resources: MdmResourcesService,
    private securityHandler: SecurityHandlerService
  ) { }

  getUserSettings() {
    let settings = JSON.parse(localStorage.getItem('userSettings')) as UserSettings;
    if (!settings) {
      this.updateUserSettings(this.defaultSettings);
      settings = this.defaultSettings;
    }
    return settings;
  }

  updateUserSettings(settings: UserSettings) {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }

  loadForCurrentUser(): Observable<UserSettings> {
    const user = this.securityHandler.getCurrentUser();
    if (!user) {
      return of({});
    }

    return this.resources.catalogueUser.userPreferences(user.id)
      .pipe(
        map((response: MdmResponse<any>) => {
          const body = response.body;

          let settings: UserSettings = null;
          if (!body) {
            settings = this.defaultSettings;
          } else {
            // check if we have added new items but they don't exists already, then add them
            for (const property in this.defaultSettings) {
              if (this.defaultSettings.hasOwnProperty(property) && !body[property]) {
                body[property] = this.defaultSettings[property];
              }
            }
              // save them into the localStorage
            settings = body;
          }

          // save it locally
          this.updateUserSettings(settings);
          return settings;
        })
      );
  }

  update(setting: keyof UserSettings, value: any) {
    const storage = this.getUserSettings();
    const next = {
      ...storage,
      ...{ [setting]: value }
    };

    this.updateUserSettings(next);
  }

  get<T = any>(setting: keyof UserSettings): T {
    const storage = this.getUserSettings();
    return storage[setting] as T;
  }

  removeAll() {
    localStorage.removeItem('userSettings');
  }

  saveOnServer(): Observable<any> {
    const user = this.securityHandler.getCurrentUser();
    if (!user) {
      return of({});
    }

    return this.resources.catalogueUser.updateUserPreferences(user.id, this.getUserSettings());
  }
}
