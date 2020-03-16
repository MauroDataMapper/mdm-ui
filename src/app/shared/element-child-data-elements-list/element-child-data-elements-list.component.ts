import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
import { GridService } from '../../services/grid.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'mdm-element-child-data-elements-list',
  templateUrl: './element-child-data-elements-list.component.html',
  styleUrls: ['./element-child-data-elements-list.component.scss']
})
export class ElementChildDataElementsListComponent implements OnInit, AfterViewInit {
  constructor(
    private gridSvc: GridService,
    private changeRef: ChangeDetectorRef,
    private resources: ResourcesService
  ) {}

  @Input() parentDataModel: any;
  @Input() parentDataClass: any;
  @Input() parentDataType: any;
  @Input() type: any; // static, dynamic

  @Input() childDataElements: any; // used when type='static'
  @Input() loadingData: any; // used when type='static'

  @Input() clientSide: boolean; // if true, it should NOT pass values to the serve in save/update/delete
  @Output() afterSave = new EventEmitter<any>();

  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  filterEvent = new EventEmitter<string>();
  filter: string;

  isLoadingResults: boolean;
  records: any[];
  totalItemCount: number;
  hideFilters = true;

  displayedColumns = ['label', 'name', 'description'];

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.type === 'dynamic') {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
      this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));
      this.gridSvc.reloadEvent.subscribe(fitler => (this.filter = fitler));

      merge(
        this.sort.sortChange,
        this.paginator.page,
        this.filterEvent,
        this.gridSvc.reloadEvent
      )
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoadingResults = true;

            return this.dataElementsFetch(
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
            this.changeRef.detectChanges();
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
        });
      this.changeRef.detectChanges();
    }

    if (this.type === 'static') {
      this.isLoadingResults = true;
      this.records = [];
    }
  }

  dataElementsFetch = (pageSize, pageIndex, sortBy, sortType, filters) => {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };

    if (this.parentDataModel && this.parentDataClass) {
      return this.resources.dataClass.get(
        this.parentDataModel.id,
        null,
        this.parentDataClass.id,
        'dataElements',
        options
      );
    }
    if (this.parentDataModel && this.parentDataType) {
      return this.resources.dataType.get(
        this.parentDataModel.id,
        this.parentDataType.id,
        'dataElements',
        options
      );
    }
  };

  showStaticRecords = () => {
    if (this.childDataElements && this.type === 'static') {
      this.records = [].concat(this.childDataElements.items);
    }
  };

  applyFilter = () => {
    this.gridSvc.applyFilter(this.filters);
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  }
}
