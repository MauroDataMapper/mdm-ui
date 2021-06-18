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

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  // eslint-disable-next-line no-useless-escape
  readonly emailPattern = /^[_A-Za-z0-9-'!#%&=\/~\`\+\$\*\?\^\{\|\}]+(\.[_A-Za-z0-9-'!#%&=\/~\`\+\$\*\?\^\{\|\}]+)*@[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-\+]+)*(\.[A-Za-z]{2,})$/;

  constructor() { }

  index(obj, i) {
    return obj[i];
  }

  getProperty(obj, str) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return str.split('.').reduce(this.index, obj);
  }


  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  validateEmail(email): boolean {
    return this.emailPattern.test(email);
  }

  isDate(date: any): boolean {
    if (!isNaN(date)) {
      return date instanceof Date;
    }
    return false;
  }

  isEmpty(str: string): boolean {
    if (str === null || str === undefined) {
      return true;
    }

    if (typeof str === 'string' && str.trim().length === 0) {
      return true;
    }
    return false;
  }

  validateMultiplicities(min, max) {
    if ((min == null && max == null) ||
      (min === undefined && max === undefined)) {
      return null;
    }

    if (min === undefined || min === null) {
      min = '';
    }

    if (max === undefined || max === null) {
      max = '';
    }


    if (min.trim().length === 0 && max.trim().length === 0) {
      return null;
    }

    if (min === '*') {
      min = '-1';
    }

    if (max === '*') {
      max = '-1';
    }

    if (min.length > 0 && (parseInt(min, 10) < -1 || isNaN(min) || min.indexOf('.') !== -1)) {
      return 'Invalid Min Multiplicity';
    }

    if (max.length > 0 && (parseInt(max, 10) < -1 || isNaN(max) || max.indexOf('.') !== -1)) {
      return 'Invalid Max Multiplicity';
    }


    if (min.trim().length === 0 && max.trim().length > 0) {
      return 'Min Multiplicity should have a value';
    }


    if (max.trim().length === 0 && min.trim().length > 0) {
      return 'Max Multiplicity should have a value';
    }


    if (min.length > 0 && max.length > 0) {

      let minInt = parseInt(min, 10);
      let maxInt = parseInt(max, 10);

      if (minInt === -1) {
        minInt = Number.MAX_VALUE;
      }

      if (maxInt === -1) {
        maxInt = Number.MAX_VALUE;
      }

      if (minInt > maxInt) {
        return 'Min Multiplicity should be Equal or Less than Max Multiplicity';
      }

      if (minInt === 0 && maxInt === 0) {
        return 'Min and Max Multiplicities can not both be 0';
      }

      if (minInt === Number.MAX_VALUE && maxInt === Number.MAX_VALUE) {
        return 'Min and Max Multiplicities can not both be unbound';
      }

    }
    return null;
  }

  validateLabel(label :string): boolean {
    if (!label || (label && label.trim().length === 0)) {
      return false;
    } else {
      return true;
    }
  }

  guid() {
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
}
