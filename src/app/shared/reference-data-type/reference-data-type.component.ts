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
import { Component, AfterViewInit, Input, ViewChild, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { EMPTY, merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { BroadcastService, GridService, MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { ReferenceDataType, ReferenceDataTypeEditor, ReferenceDataTypeIndexResponse } from '@mdm/model/referenceModelModel';
import { EditingService } from '@mdm/services/editing.service';
import { EditableRecord } from '@mdm/model/editable-forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CatalogueItemDomainType, ReferenceDataModelDetail } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-reference-data-type',
  templateUrl: './reference-data-type.component.html',
  styleUrls: ['./reference-data-type.component.scss']
})
export class ReferenceDataTypeComponent implements AfterViewInit {
  @Input() parent: ReferenceDataModelDetail;
  @Output() totalCount = new EventEmitter<string>();

  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  records: EditableRecord<ReferenceDataType, ReferenceDataTypeEditor>[] = [];
  dataSource = new MatTableDataSource<EditableRecord<ReferenceDataType, ReferenceDataTypeEditor>>();
  totalItemCount = 0;
  isLoadingResults = true;
  displayedColumns = ['name', 'description', 'type', 'other'];

  access: any;

  constructor(
    private resources: MdmResourcesService,
    private changeRef: ChangeDetectorRef,
    private gridService: GridService,
    private securityHandler: SecurityHandlerService,
    private editingService: EditingService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private broadcast: BroadcastService
  ) { }

  ngAfterViewInit(): void {
    this.access = this.securityHandler.elementAccess(this.parent);

    this.loadReferenceDataTypes();
  }

  listReferenceDataTypes(pageSize?, pageIndex?): Observable<ReferenceDataTypeIndexResponse> {
    const options = this.gridService.constructOptions(pageSize, pageIndex);
    return this.resources.referenceDataType.list(this.parent?.id, options);
  };

  loadReferenceDataTypes() {
    merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.changeRef.detectChanges();
          return this.listReferenceDataTypes(this.paginator.pageSize, this.paginator.pageOffset);
        }),
        map(data => {
          this.totalItemCount = data.body.count;
          this.totalCount.emit(String(data.body.count));
          this.isLoadingResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.changeRef.detectChanges();
          return [];
        })
      ).subscribe((data: ReferenceDataType[]) => {
        this.records = data.map(item => new EditableRecord(
          item,
          {
            label: item.label,
            description: item.description,
            errors: []
          },
          {
            isNew: false,
            inEdit: false
          }));
        this.dataSource.data = this.records;
        this.isLoadingResults = false;
        this.editingService.setFromCollection(this.records);
        this.changeRef.detectChanges();
      });
  }

  add() {
    const newRecord = new EditableRecord<ReferenceDataType, ReferenceDataTypeEditor>(
      {
        id: '',
        domainType: CatalogueItemDomainType.ReferencePrimitiveType,
        label: '',
        description: ''
      },
      {
        label: '',
        description: '',
        errors: []
      },
      {
        inEdit: true,
        isNew: true
      }
    );

    this.records = [].concat([newRecord]).concat(this.records);
    this.dataSource.data = this.records;
    this.editingService.setFromCollection(this.records);
  }

  delete(record: EditableRecord<ReferenceDataType, ReferenceDataTypeEditor>, index: number) {
    if (record.isNew) {
      return;
    }

    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Confirm',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `Are you sure you want to delete the Reference Data Type '${record.source.label}'?`
        }
      })
      .pipe(
        switchMap(() => this.resources.referenceDataType.remove(this.parent.id, record.source.id)),
        catchError(error => {
          this.messageHandler.showError('There was a problem removing the Reference Data Type.', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Reference Data Type removed successfully.');
        this.loadReferenceDataTypes();
        this.broadcast.referenceDataTypesChanged();
      });
  }

  onEdit(record: EditableRecord<ReferenceDataType, ReferenceDataTypeEditor>, index: number) {
    this.editingService.setFromCollection(this.records);
  };

  cancelEdit(record: EditableRecord<ReferenceDataType, ReferenceDataTypeEditor>, index: number) {
    if (record.isNew) {
      this.records.splice(index, 1);
      this.dataSource.data = this.records;
    }
    else {
      record.edit = {
        label: record.source.label,
        description: record.source.description,
        errors: []
      };
    }

    this.editingService.setFromCollection(this.records);
  };

  validate(record: EditableRecord<ReferenceDataType, ReferenceDataTypeEditor>) {
    let isValid = true;
    record.edit.errors = [];

    if ((record.edit.label?.length ?? 0) === 0) {
      record.edit.errors.label = 'Name cannot be empty.';
      isValid = false;
    }

    return isValid;
  }

  save(record: EditableRecord<ReferenceDataType, ReferenceDataTypeEditor>, index: number) {
    const resource: ReferenceDataType = {
      id: record.source.id,
      domainType: record.source.domainType,
      label: record.edit.label,
      description: record.edit.description
    };

    if (record.isNew) {
      this.resources.referenceDataType
        .save(this.parent.id, resource)
        .pipe(
          catchError(error => {
            this.messageHandler.showError('There was a problem creating the Reference Data Type.', error);
            return EMPTY;
          })
        )
        .subscribe(() => {
          this.messageHandler.showSuccess('Reference Data Type created successfully.');
          this.loadReferenceDataTypes();
          this.broadcast.referenceDataTypesChanged();
        });
    }
    else {
      this.resources.referenceDataType
        .update(this.parent.id, record.source.id, resource)
        .pipe(
          catchError(error => {
            this.messageHandler.showError('There was a problem updating the Reference Data Type.', error);
            return EMPTY;
          })
        )
        .subscribe(() => {
          this.messageHandler.showSuccess('Reference Data Type updated successfully.');
          this.loadReferenceDataTypes();
          this.broadcast.referenceDataTypesChanged();
        });
    }
  }
}
