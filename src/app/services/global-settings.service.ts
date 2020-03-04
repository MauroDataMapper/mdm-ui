import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {
  globalSettings = {
    "appIsEditable": { value: true, access: "public" }, //TODO remove this default, copied from index.js
  }
  constructor() { }
  getGlobalSettings(val)
  {
    return this.globalSettings[val].value;
  }
}
