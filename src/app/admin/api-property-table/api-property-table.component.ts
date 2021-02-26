/*
Copyright 2021 University of Oxford

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
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ApiPropertyEditableState, ApiPropertyEditType } from '@mdm/model/api-properties';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'mdm-api-property-table',
  templateUrl: './api-property-table.component.html',
  styleUrls: ['./api-property-table.component.scss']
})
export class ApiPropertyTableComponent implements OnInit, OnChanges {

  @Input() properties: ApiPropertyEditableState[] = [];

  @Output() valueCleared = new EventEmitter();

  dataSource = new MatTableDataSource<ApiPropertyEditableState>();
  displayedColumns = ['label', 'value', 'icons'];

  EditType = ApiPropertyEditType;

  constructor(
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService) { }  

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.properties);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.properties) {
      this.dataSource.data = this.properties;
    }
  }

  edit(record: ApiPropertyEditableState) {
    if (record.original) {
      this.stateHandler.Go('appContainer.adminArea.apiPropertyEdit', { id: record.original.id });
      return;
    }

    this.stateHandler.Go('appContainer.adminArea.apiPropertyAdd', { key: record.metadata.key });
  }

  clear(record: ApiPropertyEditableState) {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure?',
          okBtnTitle: 'Yes',
          btnType: 'warn',
          message: `<p>Are you sure you want to clear the value from the property "${record.metadata.label}"?</p>
          <p>Once cleared, this property will revert back to its default value.</p>`
        }
      })
      .pipe(
        switchMap(() => this.resources.apiProperties.remove(record.original.id)),
        catchError(errors => {
          this.messageHandler.showError('There was a problem clearing the property value.', errors);
          return [];
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Successfully cleared the property value.');
        this.valueCleared.emit();
      })
  }
}