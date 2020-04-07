import {
  Component,
  Input,
  ViewChildren,
  ElementRef,
  ViewChild,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { ResourcesService } from '../../services/resources.service';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ElementTypesService } from '../../services/element-types.service';
import { MdmPaginatorComponent } from 'src/app/shared/mdm-paginator/mdm-paginator';

@Component({
  selector: 'mdm-classified-elements-list',
  templateUrl: './classified-elements-list.component.html',
  styleUrls: ['./classified-elements-list.component.sass']
})
export class ClassifiedElementsListComponent implements OnInit, AfterViewInit {
  @Input() parent: any;
  @Input() classifiedElementType: any;

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
  // allDataTypes: any;

  // showStaticRecords: Function;

  records: any[] = [];

  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalItemCount: number;
  isLoadingResults = false;
  filterEvent = new EventEmitter<string>();
  filter: string;
  deleteInProgress: boolean;
  domainType;

  baseTypes: any;
  classifiableBaseTypes: any;
  filterValue: any;
  filterName: any;

  constructor(
    private messageHandler: MessageHandlerService,
    private resources: ResourcesService,
    private stateHandler: StateHandlerService,
    private elementTypes: ElementTypesService,
    private changeRef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.displayedColumns = ['type', 'label', 'description'];
    this.isLoadingResults = false;
    // this.allDataTypes = this.elementTypes.getAllDataTypesArray();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    this.baseTypes = [{ id: '', title: '' }].concat(
      this.elementTypes.getBaseTypesAsArray()
    );

    this.classifiableBaseTypes = this.baseTypes.filter(
      f => f.classifiable === true
    );

    this.classifiableBaseTypes = [{ id: '', title: '' }].concat(
      this.classifiableBaseTypes
    );

    // // this.elementsFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
    //    var options = {
    //      pageSize: pageSize,
    //      pageIndex:pageIndex,
    //      sortBy: sortBy,
    //      sortType:sortType,
    //      filters: filters
    //   // };

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          return this.classificationFetch(
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
      .subscribe(data => {
        this.records = data;
      });
    this.changeRef.detectChanges();
  }

  classificationFetch(
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
    return this.resources.classifier.get(
      this.parent.id,
      this.classifiedElementType,
      options
    );
  }

  applyFilter = () => {
    let filter: any = '';
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;

      if (value !== '') {
        filter += name + '=' + value + '&';
      }
    });

    if (
      this.filterValue !== null &&
      this.filterValue !== undefined &&
      this.filterName !== null &&
      this.filterName !== undefined
    ) {
      filter += this.filterName + '=' + this.filterValue + '&';
    }
    this.filter = filter.substring(0, filter.length - 1);
    this.filterEvent.emit(filter);
  };

  applyMatSelectFilter(filterValue: any, filterName) {
    this.filterValue = filterValue;
    if (this.filterValue !== '') { this.filterName = filterName; } else { this.filterName = ''; }
    this.applyFilter();
  }

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  }
}
