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

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {
  MergeDiffType,
  MergeConflictResolution
} from '@maurodatamapper/mdm-resources';
import {
  MergeDiffItemModel,
  MergeItemSelectionChange,
  MergeItemColumnFilters
} from '../types/merge-item-type';
import { MergeFilterPipe } from '../pipes/merge-filter.pipe';
import { LocationPathComponent } from '../../shared/location-path/location-path.component';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatTable, MatHeaderCell, MatCell, MatHeaderRow, MatRow, MatHeaderCellDef, MatCellDef, MatHeaderRowDef, MatRowDef, MatColumnDef } from '@angular/material/table';
import { MatInput } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

@Component({
    selector: 'mdm-merge-item-selector',
    templateUrl: './merge-item-selector.component.html',
    styleUrls: ['./merge-item-selector.component.scss'],
    standalone: true,
    imports: [
      MatFormField,
      MatInput,
      MatTable,
      MatHeaderCell,
      MatCell,
      MatHeaderRow,
      MatRow,
      MatHeaderCellDef,
      MatCellDef,
      MatHeaderRowDef,
      MatRowDef,
      MatColumnDef,
      MatCheckbox,
      FormsModule,
      MatSelect,
      MatOption,
      NgClass,
      NgFor,
      NgIf,
      MatTooltip,
      LocationPathComponent
    ]
})
export class MergeItemSelectorComponent implements OnInit {
  @Output() selectedMergeItemChanged = new EventEmitter<MergeDiffItemModel>();
  @Output() mergeItemSelectionChanged = new EventEmitter<MergeItemSelectionChange>();
  @Input() mergeItems: MergeDiffItemModel[];
  @Input() selectedMergeItem: MergeDiffItemModel | null = null;

  displayedColumns: string[] = ['type', 'path', 'apply'];
  columnFilters: MergeItemColumnFilters = {
    type: '',
    path: '',
    apply: ''
  };
  showColumnFilters: Record<keyof MergeItemColumnFilters, boolean> = {
    type: false,
    path: false,
    apply: false
  };
  readonly typeFilterOptions = [
    { value: '', label: 'All types' },
    { value: 'creation', label: 'Create' },
    { value: 'modification', label: 'Modify' },
    { value: 'deletion', label: 'Delete' },
    { value: 'conflict', label: 'Conflicts' }
  ];
  readonly applyFilterOptions = [
    { value: '', label: 'All states' },
    { value: 'applied', label: 'Applied' },
    { value: 'skipped', label: 'Skipped' }
  ];
  private mergeFilterPipe = new MergeFilterPipe();

  constructor() {}

  public get mergeType() {
    return MergeDiffType;
  }

  ngOnInit(): void {}

  toggleColumnFilter(column: keyof MergeItemColumnFilters, event?: Event): void {
    event?.stopPropagation();
    this.showColumnFilters[column] = !this.showColumnFilters[column];
  }

  isColumnFilterVisible(column: keyof MergeItemColumnFilters): boolean {
    return this.showColumnFilters[column] || this.hasColumnFilter(column);
  }

  hasColumnFilter(column: keyof MergeItemColumnFilters): boolean {
    return !!this.columnFilters[column]?.trim();
  }

  selectItem(mergeItem: MergeDiffItemModel): void {
    this.selectedMergeItemChanged.emit(mergeItem);
  }

  toggleSelection(mergeItem: MergeDiffItemModel, event: MatCheckboxChange): void {
    this.mergeItemSelectionChanged.emit({
      mergeItem,
      selected: event.checked
    });
  }

  getFilteredItems(): MergeDiffItemModel[] {
    if (!this.mergeItems) {
      return [];
    }
    return this.mergeFilterPipe.transform(this.mergeItems, this.columnFilters);
  }

  isRowSelected(item: MergeDiffItemModel): boolean {
    return this.selectedMergeItem === item;
  }

  isApplied(item: MergeDiffItemModel): boolean {
    return item.branchSelected !== null && item.branchSelected !== MergeConflictResolution.Target;
  }

  getApplyTooltip(item: MergeDiffItemModel): string {
    return this.isApplied(item) ? 'Change will be applied' : 'Change will be skipped';
  }

  getMergeTypeTooltip(type: MergeDiffType): string {
    switch (type) {
      case MergeDiffType.Creation:
        return 'Created';
      case MergeDiffType.Deletion:
        return 'Deleted';
      case MergeDiffType.Modification:
        return 'Modified';
      default:
        return '';
    }
  }

  getMergeTypeLabel(type: MergeDiffType): string {
    switch (type) {
      case MergeDiffType.Creation:
        return 'Create';
      case MergeDiffType.Deletion:
        return 'Delete';
      case MergeDiffType.Modification:
        return 'Modify';
      default:
        return '';
    }
  }

  getHeaderIcon(column: 'type' | 'path' | 'apply'): string {
    switch (column) {
      case 'type':
        return 'fas fa-code-branch';
      case 'path':
        return 'fas fa-folder-open';
      case 'apply':
        return 'fas fa-check-square';
      default:
        return '';
    }
  }

  getFilterToggleLabel(column: keyof MergeItemColumnFilters): string {
    return `${this.isColumnFilterVisible(column) ? 'Hide' : 'Show'} ${column} filter`;
  }
}
