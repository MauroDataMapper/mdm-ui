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
import {
  Component,
  AfterViewInit,
  Input,
  ViewChildren,
  ViewChild,
  ElementRef,
  EventEmitter,
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { EMPTY, merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { GridService, SharedService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { MatTableDataSource } from '@angular/material/table';
import { CatalogueItem, CatalogueItemDomainType, ModelDomainType, ReferenceFile, ReferenceFileCreatePayload, ReferenceFileIndexResponse, Securable } from '@maurodatamapper/mdm-resources';
import { EditableRecord } from '@mdm/model/editable-forms';
import { MatDialog } from '@angular/material/dialog';

export interface ReferenceFileEditor {
  fileName: string;
}

@Component({
  selector: 'mdm-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.sass'],
})
export class AttachmentListComponent implements AfterViewInit {
  @Input() parent: CatalogueItem & Securable;
  @Input() domainType: ModelDomainType;

  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  filterEvent = new EventEmitter<any>();
  hideFilters = true;
  displayedColumns: string[] = ['fileName', 'fileSize', 'lastUpdated', 'other'];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults = true;
  filter: {};
  canEdit: boolean;
  records: EditableRecord<ReferenceFile, ReferenceFileEditor>[] = [];
  dataSource = new MatTableDataSource<EditableRecord<ReferenceFile, ReferenceFileEditor>>();
  apiEndpoint: string;

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private sharedService: SharedService,
    private editingService: EditingService,
    private gridService: GridService,
    private dialog: MatDialog) { }

  ngAfterViewInit() {
    this.apiEndpoint = this.sharedService.backendURL;

    this.canEdit = this.parent.availableActions.includes('update');

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.dataSource.sort = this.sort;

    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          return this.attachmentFetch(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction,
            this.filter);
        }),
        map(data => {
          this.totalItemCount = data.body.count;
          this.isLoadingResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      )
      .subscribe((data: ReferenceFile[]) => {
        this.records = data.map(item => new EditableRecord<ReferenceFile, ReferenceFileEditor>(
          item,
          {
            fileName: item.fileName
          },
          {
            isNew: false,
            inEdit: false
          }));

        this.dataSource.data = this.records;
      });
  }

  applyFilter() {
    const filter = {};
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;
      if (value !== '') {
        filter[name] = value;
      }
    });
    this.filter = filter;
    this.filterEvent.emit(filter);
  }

  filterClick() {
    this.hideFilters = !this.hideFilters;
  }

  attachmentFetch(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: string,
    filters?: any): Observable<ReferenceFileIndexResponse> {
    const options = this.gridService.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters);

    return this.resources.catalogueItem.listReferenceFiles(
      this.domainType,
      this.parent.id,
      options
    );
  }

  cancelEdit(record: EditableRecord<ReferenceFile, ReferenceFileEditor>, index: number) {
    if (record.isNew) {
      this.records.splice(index, 1);
      this.records = [].concat(this.records);
      this.dataSource.data = this.records;
    }

    this.editingService.setFromCollection(this.records);
  }

  getFile(inputFileName: string) {
    const element: any = document.getElementById(inputFileName);
    return element && element.files ? element.files[0] : '';
  }

  delete(record: EditableRecord<ReferenceFile, ReferenceFileEditor>) {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Confirm',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `Are you sure you want to delete the attachment '${record.source.fileName}'?`
        }
      })
      .pipe(
        switchMap(() => this.resources.catalogueItem.removeReferenceFile(this.domainType, this.parent.id, record.source.id)),
        catchError(error => {
          this.messageHandler.showError('There was a problem deleting the attachment.', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Attachment deleted successfully.');
        this.filterEvent.emit();
      });
  }

  add() {
    const newRecord = new EditableRecord<ReferenceFile, ReferenceFileEditor>(
      {
        id: '',
        domainType: CatalogueItemDomainType.ReferenceFile,
        fileName: ''
      },
      {
        fileName: ''
      },
      {
        isNew: true,
        inEdit: true
      });

    this.records = [].concat([newRecord]).concat(this.records);
    this.dataSource.data = this.records;
    this.editingService.setFromCollection(this.records);
  };


  save(record: EditableRecord<ReferenceFile, ReferenceFileEditor>, index: number) {
    const fileName = `File${index}`;
    const file = this.getFile(fileName);
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      const fileBytes = new Int8Array(reader.result as ArrayBuffer);

      const data: ReferenceFileCreatePayload = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileContents: Array.from(fileBytes)
      };

      this.resources.catalogueItem
        .saveReferenceFiles(this.domainType, this.parent.id, data)
        .pipe(
          catchError(error => {
            this.messageHandler.showError('There was a problem saving the attachment.', error);
            return EMPTY;
          })
        )
        .subscribe(() => {
          this.messageHandler.showSuccess('Attachment uploaded successfully.');

          record.inEdit = false;
          this.editingService.setFromCollection(this.records);

          this.filterEvent.emit();
        });
    };
  }
}
