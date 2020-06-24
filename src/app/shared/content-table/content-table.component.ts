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
import { Component, Input, ViewChildren, ViewChild, AfterViewInit, ElementRef, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { ResourcesService } from '@mdm/services/resources.service';
import { merge, Observable, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { BulkEditModalComponent } from '@mdm/modals/bulk-edit-modal/bulk-edit-modal.component';
import { BulkDeleteModalComponent } from '@mdm/modals/bulk-delete-modal/bulk-delete-modal.component';

@Component({
    selector: 'mdm-content-table',
    templateUrl: './content-table.component.html',
    styleUrls: ['./content-table.component.sass']
})
export class ContentTableComponent implements AfterViewInit {
    @Input() parentDataModel: any;
    @Input() grandParentDataClass: any;
    @Input() parentDataClass: any;
    @Input() loadingData: any;
    checkAllCheckbox = false;
    @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

    processing: boolean;
    failCount: number;
    total: number;

    records: any[] = [];

    hideFilters = true;
    displayedColumns: string[];
    loading: boolean;
    totalItemCount = 0;
    isLoadingResults: boolean;
    filterEvent = new EventEmitter<string>();
    filter: string;
    deleteInProgress: boolean;

    bulkActionsVisibile = 0;

    constructor(
        private messageHandler: MessageHandlerService,
        private resources: ResourcesService,
        private stateHandler: StateHandlerService,
        private changeRef: ChangeDetectorRef,
        private dialog: MatDialog
    ) { }
    ngAfterViewInit() {
        if (this.parentDataModel.editable && !this.parentDataModel.finalised) {
            this.displayedColumns = ['checkbox', 'name', 'description', 'label', 'actions'];
        } else {
            this.displayedColumns = ['name', 'description', 'label'];
        }
        this.changeRef.detectChanges();
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
        this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
            this.isLoadingResults = true;
            return this.contentFetch(this.paginator.pageSize, this.paginator.pageOffset, this.sort.active, this.sort.direction, this.filter);
        }), map((data: any) => {
                this.totalItemCount = data.body.count;
                this.isLoadingResults = false;
                return data.body.items;
            }), catchError(() => {
                this.isLoadingResults = false;
                return [];
            })
        ).subscribe(data => {
          this.records = data;
        });
        this.changeRef.detectChanges();
    }

    openEdit = dataClass => {
        if (!dataClass || (dataClass && !dataClass.id)) {
            return '';
        }
        this.stateHandler.NewWindow('dataClass', {
            dataModelId: this.parentDataModel.id,
            dataClassId: this.parentDataClass ? this.parentDataClass.id : null,
            id: dataClass.id
        }, null);
    };

    addDataClass = () => {
        this.stateHandler.Go('newDataClass', {
            parentDataModelId: this.parentDataModel.id,
            parentDataClassId: this.parentDataClass
                ? this.parentDataClass.id
                : null,
            grandParentDataClassId: this.grandParentDataClass.id
        }, null);
    };

    addDataElement = () => {
        this.stateHandler.Go('newDataElement', {
            parentDataModelId: this.parentDataModel.id,
            parentDataClassId: this.parentDataClass
                ? this.parentDataClass.id
                : null,
            grandParentDataClassId: this.grandParentDataClass.id
        }, null);
    };

    refreshGrid = () => {
      this.filterEvent.emit();
    }

    applyFilter = () => {
        let filter: any = '';
        this.filters.forEach((x: any) => {
            const name = x.nativeElement.name;
            const value = x.nativeElement.value;

            if (value !== '') {
                filter += name + '=' + value;
            }
        });
        this.filter = filter;
        this.filterEvent.emit(filter);
    };

    filterClick = () => {
        this.hideFilters = !this.hideFilters;
    };

    contentFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?): Observable<any> {
        const options = {
            pageSize,
            pageIndex,
            sortBy,
            sortType,
            filters
        };
        return this.resources.dataClass.get(this.parentDataModel.id, null, this.parentDataClass.id, 'content', options);
    }

    onChecked = () => {
        this.records.forEach(x => (x.checked = this.checkAllCheckbox));
        this.listChecked();
    }

    toggleCheckbox = (record) => {
      this.records.forEach(x => (x.checked = false));
      this.bulkActionsVisibile = 0;
      record.checked = true;
      this.bulkEdit();
    }

    listChecked = () => {
        let count = 0;
        for (const value of Object.values(this.records)) {
            if (value.checked) {
                count++;
            }
        }
        this.bulkActionsVisibile = count;
    }

    bulkEdit = () => {
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
        const dialog = this.dialog.open(BulkEditModalComponent, {
          data: { dataElementIdLst, parentDataModel: this.parentDataModel, parentDataClass: this.parentDataClass },
          panelClass: 'bulk-edit-modal'
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
        this.records = this.records;
        this.checkAllCheckbox = false;
        this.bulkActionsVisibile = 0;
        this.filterEvent.emit();
      }).catch(() => {});
    }

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
          data: { dataElementIdLst, parentDataModel: this.parentDataModel, parentDataClass: this.parentDataClass },
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
        this.records = this.records;
        this.checkAllCheckbox = false;
        this.bulkActionsVisibile = 0;
        this.filterEvent.emit();
      }).catch(() => {});
    };

    askForSoftDeletion = (record) => {
      const promise = new Promise((resolve, reject) => {
          const message = ` <p>You are deleting the following ${record.domainType}:</p>
                            <p class='mdm--active-row px-2 py-2'><strong>${record.label}</strong></p>
                            <p><strong>Note: </strong>This ${record.domainType} will be completely removed from the database</p>`;
          const dialog = this.dialog.open(ConfirmationModalComponent, {
              data: {
                  title: `Are you sure you want to delete this ${record.domainType}?`,
                  okBtnTitle: 'Yes, Delete',
                  btnType: 'warn',
                  message,
              },
              panelClass: 'confirmation-soft-delete'
          });

          dialog.afterClosed().subscribe((result) => {
              if (result != null && result.status === 'ok') {
                if (record.domainType === 'DataClass') {
                  this.resources.dataClass.delete(record.dataModel, record.parentDataClass, record.id).subscribe(() => {
                    resolve();
                  });
                } else if (record.domainType === 'DataElement') {
                  return this.resources.dataElement.delete(record.dataModel, record.dataClass, record.id).subscribe(() => {
                    resolve();
                  });
                } else {
                  reject();
                }
              } else {
                reject();
              }
          });
      });

      promise.then(() => {
          this.messageHandler.showSuccess(`${record.domainType} deleted successfully`);
          this.filterEvent.emit();
      }).catch(() => {
        record.checked = false;
      });
  };
}
