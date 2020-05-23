/*
Copyright 2020 University of Oxford

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
