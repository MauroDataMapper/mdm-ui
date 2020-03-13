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
import {SecurityHandlerService} from "../../services/handlers/security-handler.service";

@Component({
  selector: 'code-set-terms-table',
  templateUrl: './code-set-terms-table.component.html',
  styleUrls: ['./code-set-terms-table.component.scss']
})
export class CodeSetTermsTableComponent implements OnInit {
  @Input("code-set") codeSet: any;
  @Input() type: any; // static, dynamic
  clientSide : any  ;//if true, it should NOT pass values to the serve in save/update/delete
  hideFilters: boolean = true;
  displayedColumns: string[];
  loading: boolean;
  totalItemCount: number;
  isLoadingResults = false;
  filterEvent = new EventEmitter<string>();
  filter: string;
  deleteInProgress: boolean;
  records: any[] = [];
  access : any;
  @ViewChildren("filters", { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  baseTypes: any;
  classifiableBaseTypes: any;
  filterValue : any;
  filterName : any;
  showAddTerm: any;

  constructor(private messageHandler: MessageHandlerService, private resources: ResourcesService, private stateHandler: StateHandlerService, private elementTypes: ElementTypesService, private changeRef: ChangeDetectorRef, private securityHandler : SecurityHandlerService) { }

  ngOnInit() {
    this.displayedColumns = [ 'terminology','term', 'definition', 'btns'];
    this.isLoadingResults = false;


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

                  return this.termFetch(this.paginator.pageSize,
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
      this.access = this.securityHandler.elementAccess(this.codeSet);
    });
    this.changeRef.detectChanges();
  }

  termFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?): Observable<any> {

    var options = {
      pageSize: pageSize,
      pageIndex: pageIndex,
      sortBy: sortBy,
      sortType: sortType,
      filters: filters
    };
    return this.resources.codeSet.get(this.codeSet.id, "terms", options);

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
  };

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
  };



  delete(record, $index) {
    if (this.clientSide) {
      this.records.splice($index, 1);

      return;
    }
    this.resources.codeSet.delete(this.codeSet.id, "terms/" + record.id, null, null)
        .subscribe(() => {
          if (this.type == 'static') {
            this.records.splice($index, 1);
            this.messageHandler.showSuccess('Term removed successfully.');
          } else {
            this.records.splice($index, 1);
            this.messageHandler.showSuccess('Term removed successfully.');
            this.filterEvent.emit();
          }
        }, (error) => {
          this.messageHandler.showError('There was a problem removing the term.', error);
        });
  }

  toggleAddTermsSection = () => {
    this.showAddTerm =!this.showAddTerm;

    return;

  };

  addTerms = (terms) =>{
this.codeSet.terms = this.records;
    //current terms
    var currentTerms  = this.codeSet.terms.map((term) =>{
      return {id: term.id};
    });
    var newTermIds = terms.map((term) =>{
      return {id: term.id};
    });

    var allTermIds =  [].concat(newTermIds).concat(currentTerms);


    this.resources.codeSet.put(this.codeSet.id, null, {resource:{terms:allTermIds}}).subscribe( (result)=> {
      this.messageHandler.showSuccess('Terms added successfully.');
     // this.mcTableHandler.fetchForDynamic();
      // $scope.mcDisplayRecords[index].success = false;
      var options = {
        pageSize: 40,
        pageIndex: 0,
        sortBy: null,
        sortType: null,
        filters: null
      };
       this.resources.codeSet.get(this.codeSet.id, "terms", options).subscribe(data =>{
       this.records = data.body["items"]});
      setTimeout(() => {
        this.toggleAddTermsSection();
    }, 500);
    }, error => {
      this.messageHandler.showError('There was a problem adding the Terms.', error);
    });
  };


}
