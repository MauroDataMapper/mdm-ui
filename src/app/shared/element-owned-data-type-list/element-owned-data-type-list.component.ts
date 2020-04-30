import {
  Component,
  Input,
  ViewChildren,
  ViewChild,
  QueryList,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { ResourcesService } from '@mdm/services/resources.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { merge, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MatInput } from '@angular/material/input';
import { MatSort } from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'mdm-element-owned-data-type-list',
  templateUrl: './element-owned-data-type-list.component.html',
  styleUrls: ['./element-owned-data-type-list.component.sass']
})
export class ElementOwnedDataTypeListComponent implements AfterViewInit, OnInit {
  @Input() parent: any;
  @Input() type: any;

  @Input() childOwnedDataTypes: any;

  @Input() loadingData: boolean;

  @Input() clientSide: boolean;
  @ViewChildren('filters') filters: QueryList<MatInput>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


  allDataTypes: any;
  allDataTypesMap: any;
  // showStaticRecords: () => void;
  loading = false;
  records: any[] = [];
  total: number;
  processing = false;
  failCount: number;
  hideFilters = true;
  displayedColumns: string[];
  totalItemCount: number;
  isLoadingResults: boolean;
  filterEvent = new EventEmitter<string>();
  filter: string;
  deleteInProgress: boolean;
  parentDataModel: any; // TODO find use for this
  domainType;
  dataSource: MatTableDataSource<any>;
  checkAllCheckbox = false;


  constructor(
    private changeRef: ChangeDetectorRef,
    private messageHandler: MessageHandlerService,
    private elementTypes: ElementTypesService,
    private resources: ResourcesService,
    private stateHandler: StateHandlerService
  ) {}

  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.dataSource = new MatTableDataSource(this.records);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    if (this.parent.editable && !this.parent.finalised) {
      this.displayedColumns = [ 'checkbox', 'name', 'description', 'type', 'buttons' ];
    } else {
      this.displayedColumns = ['name', 'description', 'type', 'buttons'];
    }
  }

  ngAfterViewInit() {
    this.allDataTypes = this.elementTypes.getAllDataTypesArray();
    this.allDataTypesMap = this.elementTypes.getAllDataTypesMap();

    if (this.type === 'dynamic') {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
      this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

      merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoadingResults = true;
            this.changeRef.detectChanges();

            return this.dataTypesFetch(
              this.paginator.pageSize,
              this.paginator.pageIndex * this.paginator.pageSize,
              this.sort.active,
              this.sort.direction,
              this.filter
            );
          }),
          map((data: any) => {
            this.totalItemCount = data.body.count;

            return data.body.items;
          }),
          catchError(() => {
            this.isLoadingResults = false;
            this.changeRef.detectChanges();
            return [];
          })
        )
        .subscribe(data => {
          this.records = data;
          this.refreshDataSource();
          this.isLoadingResults = false;
          this.changeRef.detectChanges();
        });
    }

    if (this.type === 'static') {
      this.isLoadingResults = true;
      this.records = [];
      this.records = [].concat(this.childOwnedDataTypes.items);
      this.totalItemCount = this.childOwnedDataTypes.items.length;
      this.refreshDataSource();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.isLoadingResults = false;
      this.changeRef.detectChanges();
    }
  }

  applyFilter = (filterValue?: any, filterName?) => {
    let filter: any = '';
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;

      if (value !== '') {
        filter += name + '=' + value;
      }
    });

    if (
      filterValue !== null &&
      filterValue !== undefined &&
      filterName !== null &&
      filterName !== undefined
    ) {
      filter += filterName + '=' + filterValue.id + '&';
    }
    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  applyMatSelectFilter(filterValue: any, filterName) {
    this.applyFilter(filterValue, filterName);
  }

  openEdit = dataType => {
    if (!dataType || (dataType && !dataType.id)) {
      return '';
    }
    this.stateHandler.NewWindow(
      'dataType',
      {
        id: dataType.id,
        dataModelId: this.parent.id
      },
      null
    );
  };

  add = () => {
    this.stateHandler.Go(
      'newDataType',
      {
        parentDataModelId: this.parent.id
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
      chain.push(
        this.resources.dataType
          .delete(record.dataModel, record.id)
          .catch(() => {
            this.failCount++;
          })
      );
    });

    forkJoin(chain).subscribe(
      () => {
        this.processing = false;
        if (this.failCount === 0) {
          this.refreshDataSource();
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

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  dataTypesFetch = (pageSize?, pageIndex?, sortBy?, sortType?, filters?) => {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };

    return this.resources.dataModel.get(this.parent.id, 'dataTypes', options);
  };

  onChecked = () => {
    this.records.forEach(x => (x.checked = this.checkAllCheckbox));
    this.refreshDataSource();
  }

  refreshDataSource() {
    this.dataSource.data = this.records;
  }
}
