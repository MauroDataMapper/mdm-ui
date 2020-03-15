import { Injectable } from '@angular/core';
import { ResourcesService } from '../resources.service';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsHandlerService {
  defaultSettings = {
    countPerTable: 20,
    counts: [5, 10, 20, 50],
    expandMoreDescription: false,
    favourites: [],
    includeSupersededModels: false,
    showSupersededModels: false,
    showDeletedModels: false,
    dataFlowDiagramsSetting: {}
  };
  constructor(
    private resources: ResourcesService,
    private cookies: CookieService
  ) {}

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
    this.resources.catalogueUser
      .get(this.cookies.get('userId'), 'userPreferences', null)
      .subscribe(
        res => {
          const result = res.body;
          let settings = null;
          if (!result) {
            settings = this.defaultSettings;
          } else {
            // check if we have added new items but they don't exists already, then add them
            for (const property in this.defaultSettings) {
              if (
                this.defaultSettings.hasOwnProperty(property) &&
                !result[property]
              ) {
                result[property] = this.defaultSettings[property];
              }
            }
            // save them into the localStorage
            settings = result;
          }
          // save it locally
          this.updateUserSettings(settings);
          resolve(settings);
        },
        error => {
          reject(error);
        }
      );
    });
    return promise;
  }

  init() {
     return this.initUserSettings();
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
    const defaultSettings = this.getUserSettings();
    const settingsStr = JSON.stringify(defaultSettings);
    return this.resources.catalogueUser.put(
      this.cookies.get('userId'),
      'userPreferences',
      { resource: settingsStr, contentType: 'text/plain' }
    );

  }

  handleCountPerTable(items) {
    let counts = this.get('counts');
    if (items && items.length < 5) {
      counts = [];
    }
    return counts;
  }
}
