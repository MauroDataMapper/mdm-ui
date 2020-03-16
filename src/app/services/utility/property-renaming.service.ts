import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PropertyRenamingService {

  constructor() {
  }

  renameKeys(obj) {

    const keyValues = Object.keys(obj).map(key => {
      const newKey = this.replaceUnwantedChars(key.replace(/\./g, '_'));
      return {[newKey]: obj[key]};
    });
    return Object.assign({}, ...keyValues);
  }

  replaceUnwantedChars = (str) => str.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
}
