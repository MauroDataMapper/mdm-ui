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
import {
  Component,
  AfterViewInit,
  Input,
  ViewChildren,
  ViewChild,
  ElementRef,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { SharedService } from '@mdm/services';

@Component({
  selector: 'mdm-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.sass'],
})
export class AttachmentListComponent implements AfterViewInit {
  constructor(
    private changeRef: ChangeDetectorRef,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private sharedService: SharedService
  ) { }

  @Input() parent: any;
  @Input() domainType: any;
  @ViewChildren('filters', { read: ElementRef })
  filters: ElementRef[];
  @ViewChild(MatSort, { static: false })
  sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  reloadEvent = new EventEmitter<any>();
  hideFilters = true;
  displayedColumns: string[] = ['fileName', 'fileSize', 'lastUpdated', 'other'];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults = true;
  filter: {};
  currentUser: any;
  access: any;
  records: any[] = [];
  apiEndpoint: any;

  ngAfterViewInit() {
    this.currentUser = this.securityHandler.getCurrentUser();
    this.access = this.securityHandler.elementAccess(this.parent);
    this.apiEndpoint = this.sharedService.backendURL;

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.reloadEvent.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page, this.reloadEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          return this.attachmentFetch(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction,
            this.filter
          );
        }),
        map((data: any) => {
          this.totalItemCount = data.body.count;
          this.isLoadingResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      )
      .subscribe((data) => {
        this.records = data;
      });

    this.changeRef.detectChanges();
  }

  applyFilter = () => {
    const filter = {};
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;
      if (value !== '') {
        filter[name] = value;
      }
    });
    this.filter = filter;
    this.reloadEvent.emit(filter);
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  attachmentFetch = (pageSize?, pageIndex?, sortBy?, sortType?, filters?) => {
    return this.resources.catalogueItem.listReferenceFiles(
      this.domainType,
      this.parent.id
    );
  };

  cancelEdit = (record, index) => {
    if (record.isNew) {
      this.records.splice(index, 1);
    }
  };

  getFile = (inputFileName) => {
    const element: any = document.getElementById(inputFileName);
    return element && element.files ? element.files[0] : '';
  };

  download = (record) => {
    return this.resources.catalogueItem.getReferenceFile(this.domainType, this.parent.id, record.id);
  };

  delete = (record) => {
    this.resources.catalogueItem.removeReferenceFile(this.parent.domainType, this.parent.id, record.id).subscribe(() => {
      this.messageHandler.showSuccess('Attachment deleted successfully.');
      this.reloadEvent.emit();
    }, (error) => {
      this.messageHandler.showError('There was a problem deleting the attachment.', error);
    });
  };

  add = () => {
    const newRecord = {
      id: '',
      fileName: '',
      edit: {
        id: '',
        fileName: '',
        formData: new FormData(),
      },
      inEdit: true,
      isNew: true,
    };
    this.records = [].concat([newRecord]).concat(this.records);
  };

  readFile = (file) => { };

  save = (record, index) => {
    const fileName = 'File' + index;
    const file = this.getFile(fileName);
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    const byt = this.readFile(file);

    reader.onload = () => {
      const res: any = reader.result;
      const array: any = new Int8Array(res);
      const fileByteArray = [];

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < array.length; i++) {
        fileByteArray.push(array[i]);
      }

      const data = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileContents: fileByteArray
      };

      this.resources.catalogueItem
        .saveReferenceFiles(this.domainType, this.parent.id, data)
        .subscribe(
          () => {
            this.messageHandler.showSuccess(
              'Attachment uploaded successfully.'
            );
            this.reloadEvent.emit();
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem saving the attachment.',
              error
            );
          }
        );
    };
  };
}
