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
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiPropertyEditableState, ApiPropertyEditType } from '@mdm/model/api-properties';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService, MessageHandlerService, StateHandlerService } from '@mdm/services';
import { catchError, switchMap } from 'rxjs/operators';

export interface ApiPropertyTableViewChange {
  category?: string;
  sortBy?: string;
  sortType?: string;
}

@Component({
  selector: 'mdm-api-property-table',
  templateUrl: './api-property-table.component.html',
  styleUrls: ['./api-property-table.component.scss']
})
export class ApiPropertyTableComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Input() properties: ApiPropertyEditableState[] = [];
  @Input() categories: string[] = [];

  @Output() readonly viewChange = new EventEmitter<ApiPropertyTableViewChange>();

  @Output() valueCleared = new EventEmitter();

  dataSource = new MatTableDataSource<ApiPropertyEditableState>();
  readonly displayedColumns = ['key', 'category', 'value', 'icons'];

  totalItemCount = 0;
  selectedCategory = '';

  EditType = ApiPropertyEditType;

  constructor(
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private broadcast: BroadcastService) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.properties);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe((sort: Sort) => this.viewChange.emit({
      category: this.selectedCategory,
      sortBy: sort.active,
      sortType: sort.direction
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.properties) {
      this.dataSource.data = this.properties;
      this.totalItemCount = this.properties.length;
    }
  }

  categoryChanged(change: MatSelectChange) {
    this.viewChange.emit({
      category: change.value,
      sortBy: this.sort.active,
      sortType: this.sort.direction
    });
  }

  add = () => {
    this.stateHandler.Go('appContainer.adminArea.apiPropertyAdd');
  };

  edit(record: ApiPropertyEditableState) {
    if (!record.original) {
      return;
    }

    this.stateHandler.Go('appContainer.adminArea.apiPropertyEdit', { id: record.original.id });
  }

  delete(record: ApiPropertyEditableState) {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure?',
          okBtnTitle: 'Yes',
          btnType: 'warn',
          message: `<p>Are you sure you want to delete the property "${record.original.key}"?</p>
          <p>Once deleted, this property and value cannot be retrieved.</p>`
        }
      })
      .pipe(
        switchMap(() => this.resources.apiProperties.remove(record.original.id)),
        catchError(errors => {
          this.messageHandler.showError('There was a problem deleting the property.', errors);
          return [];
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(`Successfully deleted the property ${record.original.key}.`);

        this.broadcast.apiPropertyUpdated({
          key: record.original.key,
          value: record.original.value,
          deleted: true });

        if (record.metadata.requiresReload) {
          this.stateHandler.reload();
        }
        else {
          this.viewChange.emit({
            category: this.selectedCategory,
            sortBy: this.sort.active,
            sortType: this.sort.direction
          });
        }
      });
  }
}
