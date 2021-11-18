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
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  transform(bytes : any, precision? : number): string {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) { return '-'; }
    if (typeof precision === 'undefined') { precision = 1; }
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    const num = Math.floor(Math.log(bytes) / Math.log(1024));

    return ((bytes / Math.pow(1024, Math.floor(num))).toFixed(precision) + ' ' + units[num]);
  }
}
