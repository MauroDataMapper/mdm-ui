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
import { MergeDiffItemModel } from '../types/merge-item-type';

@Pipe({ name: 'mergeFilter' })
export class MergeFilterPipe implements PipeTransform {
  public transform(items: MergeDiffItemModel[], searchText: string): MergeDiffItemModel[] {
    if (searchText === '') {
      return items;
    }
    return items.filter(item => item.path.toLowerCase().indexOf(searchText.toLowerCase()) !== -1);
  }
}