import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppSettingService {
   appSettings = {};

  // Provider definition

  add = function(key, value) {
    this.appSettings[key] = value;
  };

  getSettings = function() {
    return this.appSettings;
  };
  constructor() {}

    get(key) {
      return this.appSettings[key];
    }


}
