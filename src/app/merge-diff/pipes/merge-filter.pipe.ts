/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { MergeConflictResolution, MergeDiffType } from '@maurodatamapper/mdm-resources';
import { MergeDiffItemModel, MergeItemColumnFilters } from '../types/merge-item-type';

@Pipe({
    name: 'mergeFilter',
    standalone: true
})
export class MergeFilterPipe implements PipeTransform {
  public transform(items: MergeDiffItemModel[], filters: MergeItemColumnFilters): MergeDiffItemModel[] {
    if (!items?.length) {
      return items;
    }

    const normalisedFilters: MergeItemColumnFilters = {
      type: filters?.type?.trim().toLowerCase() ?? '',
      path: filters?.path?.trim().toLowerCase() ?? '',
      apply: filters?.apply?.trim().toLowerCase() ?? ''
    };

    if (!normalisedFilters.type && !normalisedFilters.path && !normalisedFilters.apply) {
      return items;
    }

    return items.filter(item =>
      this.matchesTypeFilter(item, normalisedFilters.type)
      && this.matchesPathFilter(item, normalisedFilters.path)
      && this.matchesApplyFilter(item, normalisedFilters.apply)
    );
  }

  private matchesTypeFilter(item: MergeDiffItemModel, filterValue: string): boolean {
    if (!filterValue) {
      return true;
    }

    if (filterValue === 'conflict') {
      return !!item.isMergeConflict;
    }

    return this.getTypeKey(item.type) === filterValue;
  }

  private matchesPathFilter(item: MergeDiffItemModel, filterValue: string): boolean {
    if (!filterValue) {
      return true;
    }

    return item.path?.toLowerCase().includes(filterValue);
  }

  private matchesApplyFilter(item: MergeDiffItemModel, filterValue: string): boolean {
    if (!filterValue) {
      return true;
    }

    const isApplied = item.branchSelected !== null && item.branchSelected !== MergeConflictResolution.Target;
    return filterValue === 'applied' ? isApplied : !isApplied;
  }

  private getTypeKey(type: MergeDiffType): string {
    switch (type) {
      case MergeDiffType.Creation:
        return 'creation';
      case MergeDiffType.Deletion:
        return 'deletion';
      case MergeDiffType.Modification:
        return 'modification';
      default:
        return '';
    }
  }
}
