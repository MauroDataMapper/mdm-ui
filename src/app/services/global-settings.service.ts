import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {
  globalSettings = {
    "appIsEditable": { value: true, access: "public" }
  }
  constructor() { }
  getGlobalSettings(val)
  {
    return this.globalSettings[val].value;
  }
}
