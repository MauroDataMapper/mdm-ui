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
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { EMPTY, merge, Observable, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { BroadcastEvent, BroadcastService, GridService, MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { MatTableDataSource } from '@angular/material/table';
import { ReferenceDataElement, ReferenceDataElementIndexResponse, ReferenceDataElementEditor, ReferenceModelResult, ReferenceDataTypeIndexResponse, ReferenceDataType } from '@mdm/model/referenceModelModel';
import { EditableRecord } from '@mdm/model/editable-forms';
import { DOMAIN_TYPE } from '@mdm/folders-tree/flat-node';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mdm-reference-data-element',
  templateUrl: './reference-data-element.component.html',
  styleUrls: ['./reference-data-element.component.scss']
})
export class ReferenceDataElementComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() parent: ReferenceModelResult;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  @Output() totalCount = new EventEmitter<string>();

  records: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>[] = [];
  dataSource = new MatTableDataSource<EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>>();
  totalItemCount = 0;
  isLoadingResults = true;
  displayedColumns = ['name', 'description', 'type', 'other'];
  referenceDataTypes: ReferenceDataType[] = [];

  access: any;

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject();

  constructor(
    private resources: MdmResourcesService,
    private changeRef: ChangeDetectorRef,
    private gridService: GridService,
    private securityHandler: SecurityHandlerService,
    private editingService: EditingService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog,
    private broadcast: BroadcastService
  ) { }  

  ngOnInit(): void {
    this.broadcast
      .on(BroadcastEvent.ReferenceDataTypesChanged)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.loadReferenceDataTypes());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit(): void {
    this.access = this.securityHandler.elementAccess(this.parent);

    this.loadReferenceDataTypes();
    this.loadReferenceDataElements();    
  }

  listDataElements(pageSize?: number, pageIndex?: number): Observable<ReferenceDataElementIndexResponse> {
    const options = this.gridService.constructOptions(pageSize, pageIndex);
    return this.resources.referenceDataElement.list(this.parent?.id, options);
  }

  loadReferenceDataElements() {
    merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.changeRef.detectChanges();
          return this.listDataElements(this.paginator.pageSize, this.paginator.pageOffset);
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
      )
      .subscribe((data: ReferenceDataElement[]) => {
        this.records = data.map(item => new EditableRecord(
          item,
          {
            label: item.label,
            description: item.description,
            referenceDataType: item.referenceDataType,
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

  loadReferenceDataTypes() {
    this.resources.referenceDataType
      .list(this.parent.id)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem getting the Reference Data Types.', error);
          return EMPTY;
        })
      )
      .subscribe((response: ReferenceDataTypeIndexResponse) => {
        this.referenceDataTypes = response.body.items;
      })
  }

  referenceDataTypeSelected(select: ReferenceDataType, record: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>) {
    record.edit.referenceDataType = select;
  }

  add() {
    const newRecord = new EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>(
      {
        id: '',
        domainType: DOMAIN_TYPE.ReferenceDataElement,
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

  delete(record: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>, index: number) {
    if (record.isNew) {
      return;
    }

    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Confirm',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `Are you sure you want to delete the Reference Data Element '${record.source.label}'?`
        }
      })
      .pipe(
        switchMap(() => this.resources.referenceDataElement.remove(this.parent.id, record.source.id)),
        catchError(error => {
          this.messageHandler.showError('There was a problem removing the Reference Data Element.', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Reference Data Element removed successfully.');
        this.loadReferenceDataElements();
      });
  }

  onEdit(record: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>, index: number) {
    this.editingService.setFromCollection(this.records);
  };

  cancelEdit(record: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>, index: number) {
    if (record.isNew) {
      this.records.splice(index, 1);
      this.dataSource.data = this.records;
    }
    else {
      record.edit = {
        label: record.source.label,
        description: record.source.description,
        referenceDataType: record.source.referenceDataType,
        errors: []
      };
    }

    this.editingService.setFromCollection(this.records);
  };

  validate(record: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>) {
    let isValid = true;
    record.edit.errors = [];

    if ((record.edit.label?.length ?? 0) === 0) {
      record.edit.errors.label = 'Name cannot be empty.';
      isValid = false;
    }

    if (!record.edit.referenceDataType) {
      record.edit.errors.referenceDataType = 'Please select a type.';
      isValid = false;
    }

    return isValid;
  }

  save(record: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>, index: number) {
    const resource: ReferenceDataElement = {
      id: record.source.id,
      domainType: record.source.domainType,
      label: record.edit.label,
      description: record.edit.description,
      referenceDataType: record.edit.referenceDataType
    };

    if (record.isNew) {
      this.resources.referenceDataElement
        .save(this.parent.id, resource)
        .pipe(
          catchError(error => {
            this.messageHandler.showError('There was a problem creating the Reference Data Element.', error);
            return EMPTY;
          })
        )
        .subscribe(() => {
          this.messageHandler.showSuccess('Reference Data Element created successfully.');
          this.loadReferenceDataElements();
        });
    }
    else {
      this.resources.referenceDataElement
        .update(this.parent.id, record.source.id, resource)
        .pipe(
          catchError(error => {
            this.messageHandler.showError('There was a problem updating the Reference Data Element.', error);
            return EMPTY;
          })
        )
        .subscribe(() => {
          this.messageHandler.showSuccess('Reference Data Element updated successfully.');
          this.loadReferenceDataElements();
        });
    }
  }
}
