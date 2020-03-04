import {
  Component,
  OnInit,
  Input,
  ViewChildren,
  ElementRef,
  ViewChild,
  EventEmitter,
  AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import {MessageHandlerService} from "../../services/utility/message-handler.service";
import {ResourcesService} from "../../services/resources.service";
import {StateHandlerService} from "../../services/handlers/state-handler.service";
import {merge, Observable} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ElementTypesService} from "../../services/element-types.service";

@Component({
  selector: 'classified-elements-list',
  templateUrl: './classified-elements-list.component.html',
  styleUrls: ['./classified-elements-list.component.sass']
})
export class ClassifiedElementsListComponent implements AfterViewInit {
  @Input() parent : any;
  @Input("classified-element-type") classifiedElementType : any;

  @Input("parent-data-model") parentDataModel: any;
  @Input("grand-parent-data-class") grandParentDataClass: any;
  @Input("parent-data-class") parentDataClass: any;
  @Input() loadingData : any;
  checkAllCheckbox: boolean = false;
  @ViewChildren("filters", { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  processing: boolean;
  failCount: number;
  total: number;
  allDataTypes: any;

  showStaticRecords: Function;

  records: any[] = [];

  hideFilters: boolean = true;
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
  filterValue : any;
  filterName : any;

  constructor(private messageHandler: MessageHandlerService, private resources: ResourcesService, private stateHandler: StateHandlerService, private elementTypes: ElementTypesService, private changeRef: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.displayedColumns = [ 'type','label', 'description'];
    this.isLoadingResults = false;
   // this.allDataTypes = this.elementTypes.getAllDataTypesArray();

  }

  ngAfterViewInit() {

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.filterEvent.subscribe(() => this.paginator.pageIndex = 0);

    this.baseTypes = [{id:"", title:""}].concat(this.elementTypes.getBaseTypesAsArray());

    this.classifiableBaseTypes  = this.baseTypes.filter(f => f.classifiable === true);


    this.classifiableBaseTypes = [{id:"", title:""}].concat(this.classifiableBaseTypes);

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

                  return this.classificationFetch(this.paginator.pageSize,
                      this.paginator.pageIndex,
                      this.sort.active,
                      this.sort.direction,
                      this.filter);

                }
            ),
            map((data: any) => {
              this.totalItemCount = data.body.count;
              this.isLoadingResults = false;
              return data.body["items"];
            }),
            catchError(() => {
              this.isLoadingResults = false;
              return [];
            })
        ).subscribe(data => {

      this.records = data;
    });
    this.changeRef.detectChanges();
  }

  classificationFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?): Observable<any> {

    var options = {
      pageSize: pageSize,
      pageIndex: pageIndex,
      sortBy: sortBy,
      sortType: sortType,
      filters: filters
    };
    return this.resources.classifier.get(this.parent.id, this.classifiedElementType, options);

  }

  applyFilter = () => {
    var filter: any = "";
    this.filters.forEach((x: any) => {
      var name = x.nativeElement.name;
      var value = x.nativeElement.value;

      if (value !== "") {
        filter += name + "=" + value + "&";
      }
    });

    if (this.filterValue !== null && this.filterValue !== undefined && this.filterName !== null && this.filterName !== undefined) {
      filter += this.filterName + "=" + this.filterValue + "&";
    }
    this.filter = filter.substring(0, filter.length -1);
    this.filterEvent.emit(filter);
  }

  applyMatSelectFilter(filterValue: any, filterName) {
  this.filterValue = filterValue;
  if(this.filterValue != "")
     this.filterName = filterName;
  else
    this.filterName = "";
    this.applyFilter();
  }



  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  }


}
