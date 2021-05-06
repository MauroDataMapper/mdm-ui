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
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { GridService, SecurityHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { MatTableDataSource } from '@angular/material/table';
import { ReferenceDataElement, ReferenceDataElementIndexResponse, ReferenceDataElementEditor, ReferenceModelResult } from '@mdm/model/referenceModelModel';
import { EditableRecord } from '@mdm/model/editable-forms';
import { DOMAIN_TYPE } from '@mdm/folders-tree/flat-node';

@Component({
  selector: 'mdm-reference-data-element',
  templateUrl: './reference-data-element.component.html',
  styleUrls: ['./reference-data-element.component.scss']
})
export class ReferenceDataElementComponent implements AfterViewInit {
  @Input() parent: ReferenceModelResult;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  @Output() totalCount = new EventEmitter<string>();

  records: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>[] = [];
  dataSource = new MatTableDataSource<EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>>();
  totalItemCount = 0;
  isLoadingResults = true;
  displayedColumns = ['name', 'description', 'type', 'other'];

  access: any;

  constructor(
    private resources: MdmResourcesService,
    private changeRef: ChangeDetectorRef,
    private gridService: GridService,
    private securityHandler: SecurityHandlerService,
    private editingService: EditingService
  ) { }

  ngAfterViewInit(): void {
    this.access = this.securityHandler.elementAccess(this.parent);

    merge(this.paginator.page)
      .pipe(
        startWith({}), 
        switchMap(() => {
          this.isLoadingResults = true;
          this.changeRef.detectChanges();
          return this.listDataElements(this.paginator.pageSize, this.paginator.pageOffset);
        }), 
        map((data) => {
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
            description: item.description
          },
          {
            isNew: false,
            inEdit: false
          }));
        this.dataSource.data = this.records;
        this.isLoadingResults = false;
        this.changeRef.detectChanges();
      });
  }

  listDataElements(pageSize?: number, pageIndex?: number): Observable<ReferenceDataElementIndexResponse> {
    const options = this.gridService.constructOptions(pageSize, pageIndex);
    return this.resources.referenceDataElement.list(this.parent?.id, options);
  }

  add() {    
    const newRecord = new EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>(
      {
        id: '',
        domainType: DOMAIN_TYPE.ReferencePrimitiveType,
        label: '',
        description: ''        
      },
      {
        label: '',
        description: ''
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
  }

  onEdit(record: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>, index: number) {
    this.editingService.setFromCollection(this.records);
  };

  cancelEdit(record: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>, index: number) {
    if (record.isNew) {
      this.records.splice(index, 1);
      this.dataSource.data = this.records;
    }

    this.editingService.setFromCollection(this.records);
  };

  validate(record: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>) {
    return true;
  }

  save(record: EditableRecord<ReferenceDataElement, ReferenceDataElementEditor>, index: number) {
  }
}
