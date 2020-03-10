import { Component, AfterViewInit, Input, ViewChildren, ViewChild, ElementRef, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { SecurityHandlerService } from '../../services/handlers/security-handler.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: "attachment-list",
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.sass']
})
export class AttachmentListComponent implements AfterViewInit {
  constructor(
    private changeRef: ChangeDetectorRef,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService
  ) {}

  @Input() parent: any;
  @ViewChildren('filters', { read: ElementRef })
  filters: ElementRef[];
  @ViewChild(MatSort, { static: false })
  sort: MatSort;
  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;

  reloadEvent = new EventEmitter<string>();
  hideFilters = true;
  displayedColumns: string[] = ['fileName', 'fileSize', 'lastUpdated', 'other'];
  loading: boolean;
  totalItemCount: number;
  isLoadingResults: boolean;
  filter: string;

  currentUser: any;
  access: any;

  records: any[] = [];

  ngAfterViewInit() {
    this.currentUser = this.securityHandler.getCurrentUser();
    this.access = this.securityHandler.elementAccess(this.parent);

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.reloadEvent.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page, this.reloadEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          return this.attachmentFetch(
            this.paginator.pageSize,
            this.paginator.pageIndex,
            this.sort.active,
            this.sort.direction,
            this.filter
          );
        }),
        map((data: any) => {
          this.totalItemCount = data.body.count;
          this.isLoadingResults = false;
          return data.body['items'];
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      )
      .subscribe(data => {
        this.records = data;
      });

    this.changeRef.detectChanges();
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
    this.reloadEvent.emit(filter);
  }

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  }

  attachmentFetch = (pageSize, pageIndex, sortBy, sortType, filters) => {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };
    return this.resources.facets.get(this.parent.id, 'referenceFiles', options);
  }

  cancelEdit = (record, index) => {
    if (record.isNew) {
      this.records.splice(index, 1);
    }
  }

  getFile = inputFileName => {
    const element: any = document.getElementById(inputFileName);
    return element && element.files ? element.files[0] : '';
  }

  download = record => {
    return this.resources.facets.downloadLinkReferenceFile(
      this.parent.id,
      record.id
    );
  }

  delete = record => {
    this.resources.facets
      .delete(this.parent.id, 'referenceFiles/' + record.id, null)
      .subscribe(
        () => {
          this.messageHandler.showSuccess('Attachment deleted successfully.');
          this.reloadEvent.emit();
        },
        error => {
          this.messageHandler.showError(
            'There was a problem deleting the attachment.',
            error
          );
        }
      );
  }

  add = () => {
    const newRecord = {
      id: '',
      fileName: '',
      edit: {
        id: '',
        fileName: '',
        formData: new FormData()
      },
      inEdit: true,
      isNew: true
    };
    this.records = [].concat([newRecord]).concat(this.records);
  }

  save = (record, index) => {
    const fileName = 'File' + index;
    record.edit.formData.append('file', this.getFile(fileName));
    this.resources.facets
      .attachReferenceFile(this.parent.id, record.edit.formData)
      .subscribe(
        () => {
          this.messageHandler.showSuccess('Attachment uploaded successfully.');
          this.reloadEvent.emit();
        },
        error => {
          this.messageHandler.showError(
            'There was a problem saving the attachment.',
            error
          );
        }
      );
  }
}
