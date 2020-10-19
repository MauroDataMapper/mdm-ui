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
import { Component, AfterViewInit, Input, ViewChildren, QueryList, ViewChild, EventEmitter, OnInit } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { MatInput } from '@angular/material/input';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { BulkDeleteModalComponent } from '@mdm/modals/bulk-delete-modal/bulk-delete-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mdm-reference-data-type',
  templateUrl: './reference-data-type.component.html',
  styleUrls: ['./reference-data-type.component.scss']
})
export class ReferenceDataTypeComponent implements AfterViewInit, OnInit {
  @Input() parent: any;
  @Input() type: any;
  @Input() isEditable: any;
  @Input() domainType: any;

  @ViewChildren('filters') filters: QueryList<MatInput>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  allDataTypes: any;
  allDataTypesMap: any;
  loading = false;
  records: any[] = [];
  total: number;
  processing = false;
  failCount: number;
  hideFilters = true;
  totalItemCount = 0;
  isLoadingResults = true;
  filterEvent = new EventEmitter<any>();
  filter: any;
  checkAllCheckbox = false;
  bulkActionsVisibile = 0;
  displayedColumns = ['name', 'description', 'type', 'actions'];

  constructor(
    private resources: MdmResourcesService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.isEditable = false; // TODO - set editable to false until back-end is ready
    if (this.isEditable && !this.parent.finalised) {
      this.displayedColumns = ['checkbox', 'name', 'description', 'type', 'actions'];
    } else {
      this.displayedColumns = ['name', 'description', 'type'];
    }
  }

  ngAfterViewInit(): void {
    this.listReferenceDataTypes(this.parent?.id).subscribe(resp => {
      this.records = resp.body.items;
      this.totalItemCount = resp.body.count;
      this.isLoadingResults = false;
    });
  }

  listReferenceDataTypes = (id) => {
    return this.resources.referenceDataType.list(id);
  };


  onChecked = () => {
    this.records.forEach(x => (x.checked = this.checkAllCheckbox));
    this.listChecked();
  };

  toggleDelete = (record) => {
    this.records.forEach(x => (x.checked = false));
    this.bulkActionsVisibile = 0;
    record.checked = true;
    this.bulkDelete();
  };

  listChecked = () => {
    let count = 0;
    for (const value of Object.values(this.records)) {
      if (value.checked) {
        count++;
      }
    }
    this.bulkActionsVisibile = count;
  };

  bulkDelete = () => {
    const dataElementIdLst = [];
    this.records.forEach(record => {
      if (record.checked) {
        dataElementIdLst.push({
          id: record.id,
          domainType: record.domainType
        });
      }
    });
    const promise = new Promise((resolve, reject) => {
      const dialog = this.dialog.open(BulkDeleteModalComponent, {
        data: { dataElementIdLst, parentDataModel: this.parent, parentDataClass: this.parent },
        panelClass: 'bulk-delete-modal'
      });

      dialog.afterClosed().subscribe((result) => {
        if (result != null && result.status === 'ok') {
          resolve();
        } else {
          reject();
        }
      });
    });
    promise.then(() => {
      this.records.forEach(x => (x.checked = false));
      // this.records = this.records;
      this.checkAllCheckbox = false;
      this.bulkActionsVisibile = 0;
      this.filterEvent.emit();
    }).catch(() => console.warn('error'));
  };

}
