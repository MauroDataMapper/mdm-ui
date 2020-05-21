import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  SimpleChanges
} from '@angular/core';
import {ResourcesService} from '@mdm/services/resources.service';
import {ContentSearchHandlerService} from '@mdm/services/content-search.handler.service';
import {fromEvent} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'mdm-multiple-terms-selector',
  templateUrl: './multiple-terms-selector.component.html',
  styleUrls: ['./multiple-terms-selector.component.scss']
})
export class MultipleTermsSelectorComponent implements OnInit {
  pageSize = 40;
  displayedColumns: string[] = ['label'];
  @Input() hideAddButton = true;
  selectorSection = {
    terminologies: [],
    selectedTerminology: null,
    selectedTerms: {},
    selectedTermsArray: [],
    selectedTermsCount: 0,
    termSearchText: '',
    startFetching: 0,
    searchResultPageSize: 20,
    searchResultOffset: 0,
    searchResult: [],

    searchResultDisplayedSoFar: 0,
    searchResultTotal: 0,
    loading: false
  };
  loading = false;
  @Output() selectedTermsChange = new EventEmitter<any[]>();
  @Input() onAddButtonClick: any;
  dataSource = new MatTableDataSource();
  @ViewChild('searchInputTerms', { static: true })
  searchInputTerms: ElementRef;
  currentRecord: number;
  totalItemCount = 0;
  isProcessing = false;
  private searchControlInput: ElementRef;
  selectedItems: any;
  // @Input() selectedTerms: any;
  @Input()
  get selectedTerms() {
    return this.selectedItems;
  }

  set selectedTerms(val) {
    this.selectedItems = val;
    this.selectedTermsChange.emit(this.selectedItems);
  }

  @ViewChild('searchInputControl', { static: false }) set content(content: ElementRef) {

    if (!this.searchControlInput && content) {
      fromEvent(content.nativeElement, 'keyup')
        .pipe(
          map((event: any) => {
            return event.target.value;
          }),
          filter(res => res.length >= 0),
          debounceTime(500),
          distinctUntilChanged()
        )
        .subscribe((text: string) => {
          this.dataSource = new MatTableDataSource<any>(null);
          this.loading = false;
          this.totalItemCount = 0;
          this.currentRecord = 0;
          this.isProcessing = false;
          this.fetch(40, 0);
        });
      this.searchControlInput = content;
    }
    this.cd.detectChanges();
  }

  constructor(
    private resources: ResourcesService,
    private contextSearchHandler: ContentSearchHandlerService,
    private cd: ChangeDetectorRef
  ) {
    this.loadTerminologies();
  }

  loadTerminologies = () => {
    this.resources.terminology
      .get(null, null, { all: true })
      .subscribe(data => {
        this.selectorSection.terminologies = data.body.items;
      });
  };
  onTerminologySelect = (terminology: any, record: any) => {
    this.dataSource = new MatTableDataSource<any>(null);
    this.selectorSection.selectedTerminology = terminology;
    if (terminology != null) {
      this.fetch(40, 0);
    } else {
      this.totalItemCount = 0;
      this.currentRecord = 0;
      // this.noData = true;
      // this.searchInput = "";
    }

    // this.selectorSection.startFetching++;
  };
  runTermSearch = () => {
    // this.selectorSection.startFetching++;
    this.fetch(40, 0);
  };
  loadAllTerms = (terminology, pageSize, offset) => {
    // var deferred = $q.defer();
    this.selectorSection.searchResultOffset = offset;
    this.loading = true;
    const options = {
      pageSize,
      pageIndex: offset
    };

    this.selectorSection.loading = true;

    this.resources.terminology
      .get(terminology.id, 'terms', options)
      .subscribe(result => {
        // make check=true if element is already selected
        result.body.items.forEach(item => {
          item.terminology = terminology;
        });
        // angular.forEach(result.items, function (item) {
        //   item.terminology = terminology;
        //   if(this.selectorSection.selectedTerms[item.id]){
        //     item.checked = true;
        //   }
        // });

        this.selectorSection.searchResult = result.body.items;

        this.calculateDisplayedSoFar(result);

        this.selectorSection.loading = false;

        this.totalItemCount = result.body.count;
        if (this.dataSource.data) {
          this.dataSource.data = this.dataSource.data.concat(
            this.selectorSection.searchResult
          );
          this.currentRecord = this.dataSource.data.length;
          this.loading = false;
          this.isProcessing = false;
        } else {
          this.dataSource.data = this.selectorSection.searchResult;
          this.currentRecord = this.dataSource.data.length;
          this.isProcessing = false;
          this.loading = false;
        }

    //   deferred.resolve({
    //     items: result.items,
    //     count: result.count,
    //     offset: offset + 1,
    //     pageSize: $scope.selectorSection.searchResultPageSize
    //   });
    // }, function (error) {
    //   $scope.selectorSection.loading = false;
    // });
    // return deferred.promise;
  });
  };
  fetch = (pageSize, offset) => {
    if (this.selectorSection.termSearchText.length === 0 && this.selectorSection.selectedTerminology) {
      // load all elements if possible(just all DataTypes for DataModel and all DataElements for a DataClass)
      return this.loadAllTerms(this.selectorSection.selectedTerminology, pageSize, offset);
    } else {
     // var deferred = $q.defer();
      this.selectorSection.searchResultOffset = offset;
      this.loading = true;
      // $scope.safeApply();

    //  const position = offset * this.selectorSection.searchResultPageSize;
      const position = offset;
      this.contextSearchHandler.search(this.selectorSection.selectedTerminology, this.selectorSection.termSearchText, this.selectorSection.searchResultPageSize, position, ['Term'], null, null, null, null, null, null, null, null).subscribe(result => {
        this.selectorSection.searchResult = result.body.items;
        // make check=true if element is already selected
        result.body.items.forEach( (item) => {
          item.terminology = this.selectorSection.selectedTerminology;
          if (this.selectorSection.selectedTerms[item.id]) {
            item.checked = true;
          }
        });

        this.calculateDisplayedSoFar(result);
        this.loading = false;
        this.isProcessing = false;
        this.selectorSection.loading = false;

        this.totalItemCount = result.body.count;
        if (this.dataSource.data) {
          this.dataSource.data = this.dataSource.data.concat(
            this.selectorSection.searchResult
          );
          this.currentRecord = this.dataSource.data.length;
          this.loading = false;
          this.isProcessing = false;
        } else {
          this.dataSource.data = this.selectorSection.searchResult;
          this.currentRecord = this.dataSource.data.length;
          this.isProcessing = false;
          this.loading = false;
        }

      }, error => {
        this.loading = false;
        this.isProcessing = false;
      });
    // return deferred.promise;
    }
  };

  onTableScroll(e) {
    const tableViewHeight = e.target.offsetHeight; // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight; // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled

    // If the user has scrolled within 200px of the bottom, add more data
    const buffer = 200;
    const limit = tableScrollHeight - tableViewHeight - buffer;
    if (scrollLocation > limit && limit > 0) {
      const requiredNum = this.dataSource.data.length + this.pageSize;
      if (this.totalItemCount + this.pageSize > requiredNum && !this.isProcessing ) {
        this.isProcessing = true;
        this.fetch(this.pageSize, this.dataSource.data.length);
      }
    }
  }
  calculateDisplayedSoFar = result => {
    this.selectorSection.searchResultTotal = result.body.count;
    if (result.body.count >= this.selectorSection.searchResultPageSize) {
      const total =
        (this.selectorSection.searchResultOffset + 1) *
        this.selectorSection.searchResultPageSize;
      if (total >= result.body.count) {
        this.selectorSection.searchResultDisplayedSoFar = result.body.count;
      } else {
        this.selectorSection.searchResultDisplayedSoFar = total;
      }
    } else {
      this.selectorSection.searchResultDisplayedSoFar = result.body.count;
    }
  };
  termToggle = $item => {
    if ($item.checked) {
      this.selectorSection.selectedTerms[$item.id] = $item;
      this.selectorSection.selectedTermsArray.push($item);
      const local = this.selectorSection.selectedTermsArray;
      this.selectorSection.selectedTermsArray = [];
      this.selectorSection.selectedTermsArray = Object.assign([], local);
      this.selectorSection.selectedTermsCount++;
    } else {
      let i = this.selectorSection.selectedTermsArray.length - 1;
      while (i >= 0) {
        if (this.selectorSection.selectedTermsArray[i].id === $item.id) {
          this.selectorSection.selectedTermsArray.splice(i, 1);
          const local = this.selectorSection.selectedTermsArray;
          this.selectorSection.selectedTermsArray = [];
          this.selectorSection.selectedTermsArray = Object.assign([], local);

        }
        i--;
      }

      delete this.selectorSection.selectedTerms[$item.id];
      this.selectorSection.selectedTermsCount--;
    }

  //  if(this.onSelectedTermsChange){
    this.selectedTermsChange.emit(this.selectorSection.selectedTermsArray);
    // }
    // if(this.selectorSection.selectedTermsCount >0)
    //   this.hideAddButton = false;
   // this.cd.detectChanges();

  };
  removeTerm = ($item) => {
    let i = this.selectorSection.selectedTermsArray.length - 1;
    while (i >= 0) {
      if (this.selectorSection.selectedTermsArray[i].id === $item.id) {
        this.selectorSection.selectedTermsArray.splice(i, 1);
        const local = this.selectorSection.selectedTermsArray;
        this.selectorSection.selectedTermsArray = [];
        this.selectorSection.selectedTermsArray = Object.assign([], local);
      }
      i--;
    }
    this.selectorSection.searchResult.forEach(item => {
      if (item.id === $item.id) {
        if (item.checked) {
          item.checked = false;
        }
        return;
      }
    });

    delete this.selectorSection.selectedTerms[$item.id];
    this.selectorSection.selectedTermsCount--;

    if (this.selectedTermsChange) {
      this.selectedTermsChange.emit(this.selectorSection.selectedTermsArray);
    }
  };
  addSelectedTerms = terms => {
    if (this.onAddButtonClick) {
      this.onAddButtonClick(terms);
    }
  };

  ngOnInit() {

  }



}
