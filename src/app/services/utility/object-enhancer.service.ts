import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ObjectEnhancerService {

  constructor() {
  }

  diff(newObj, oldObj) {
    return Object.keys(newObj)
      .filter(key => newObj[key] !== oldObj[key])
      .reduce((res, key) => {
        res[key] = newObj[key];
        return res;
      }, {});
  }

  diffCollection(newObj, oldObj) {
    return Object.keys(this.diff(newObj, oldObj)).reduce((res, key) => {
      const obj = {};
      obj[key] = newObj[key];
      res.push(obj);
      return res;
    }, []);
  }
}
