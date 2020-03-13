import { Component, Input, ViewChildren, ViewChild, AfterViewInit, ElementRef, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { ResourcesService } from '../../services/resources.service';
import { merge, Observable, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-content-table',
  templateUrl: './content-table.component.html',
  styleUrls: ['./content-table.component.sass']
})
export class ContentTableComponent implements AfterViewInit {
  @Input('parent-data-model') parentDataModel: any;
  @Input('grand-parent-data-class') grandParentDataClass: any;
  @Input('parent-data-class') parentDataClass: any;
  @Input() loadingData: any;
  checkAllCheckbox = false;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  processing: boolean;
  failCount: number;
  total: number;

  showStaticRecords: Function;

  records: any[] = [];

  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalItemCount: number;
  isLoadingResults: boolean;
  filterEvent = new EventEmitter<string>();
  filter: string;
  deleteInProgress: boolean;

  constructor(
    private messageHandler: MessageHandlerService,
    private resources: ResourcesService,
    private stateHandler: StateHandlerService,
    private changeRef: ChangeDetectorRef
  ) {}
  ngAfterViewInit() {
    if (this.parentDataModel.editable && !this.parentDataModel.finalised) {
      this.displayedColumns = ['name', 'description', 'label', 'checkbox'];
    } else {
      this.displayedColumns = ['name', 'description', 'label'];
    }
    this.changeRef.detectChanges();
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          return this.contentFetch(
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

  openEdit = dataClass => {
    if (!dataClass || (dataClass && !dataClass.id)) {
      return '';
    }
    this.stateHandler.NewWindow(
      'dataClass',
      {
        dataModelId: this.parentDataModel.id,
        dataClassId: this.parentDataClass ? this.parentDataClass.id : null,
        id: dataClass.id
      },
      null
    );
  };

  addDataClass = () => {
    this.stateHandler.Go(
      'newDataClass',
      {
        parentDataModelId: this.parentDataModel.id,
        parentDataClassId: this.parentDataClass
          ? this.parentDataClass.id
          : null,
        grandParentDataClassId: this.grandParentDataClass.id
      },
      null
    );
  };

  addDataElement = () => {
    this.stateHandler.Go(
      'newDataElement',
      {
        parentDataModelId: this.parentDataModel.id,
        parentDataClassId: this.parentDataClass
          ? this.parentDataClass.id
          : null,
        grandParentDataClassId: this.grandParentDataClass.id
      },
      null
    );
  };

  deleteRows = () => {
    this.processing = true;
    this.failCount = 0;
    this.total = 0;

    const chain: any[] = [];
    this.records.forEach(record => {
      if (record.checked !== true) {
        return;
      }
      this.total++;
      if (record.domainType === 'DataClass') {
        chain.push(
          this.resources.dataClass
            .delete(record.dataModel, record.parentDataClass, record.id)
            .catch(() => {
              this.failCount++;
            })
        );
      } else if (record.domainType === 'DataElement') {
        chain.push(
          this.resources.dataElement
            .delete(record.dataModel, record.dataClass, record.id)
            .catch(() => {
              this.failCount++;
            })
        );
      }
    });

    forkJoin(chain).subscribe(
      () => {
        this.processing = false;
        if (this.failCount === 0) {
          this.messageHandler.showSuccess(
            this.total + ' Elements deleted successfully'
          );
        } else {
          const successCount = this.total - this.failCount;
          let message = '';
          if (successCount !== 0) {
            message += successCount + ' Elements deleted successfully.<br>';
          }
          if (this.failCount > 0) {
            message +=
              'There was a problem deleting ' + this.failCount + ' elements.';
          }

          if (this.failCount > 0) {
            this.messageHandler.showError(message, null);
          } else {
            this.messageHandler.showSuccess(message);
          }
        }

        this.filterEvent.emit();
        this.deleteInProgress = false;
      },
      error => {
        this.processing = false;
        this.messageHandler.showError(
          'There was a problem deleting the elements.',
          error
        );
      }
    );
  };

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

  contentFetch(
    pageSize?,
    pageIndex?,
    sortBy?,
    sortType?,
    filters?
  ): Observable<any> {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };

    return this.resources.dataClass.get(
      this.parentDataModel.id,
      null,
      this.parentDataClass.id,
      'content',
      options
    );
  }

  onChecked = () => {
    this.records.forEach(x => (x.checked = this.checkAllCheckbox));
  }
}
