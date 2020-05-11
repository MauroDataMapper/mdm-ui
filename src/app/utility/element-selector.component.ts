import { Component, Inject, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ResourcesService } from '../services/resources.service';
import { MatTableDataSource } from '@angular/material/table';
import { MarkdownParserService } from './markdown-parser.service';
import { MessageService } from '../services/message.service';
import { ContentSearchHandlerService } from '../services/content-search.handler.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { of, fromEvent } from 'rxjs';
import { debounceTime, switchMap, map, filter, distinctUntilChanged } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'mdm-element-selector',
    templateUrl: './element-selector.component.html',
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
            state('expanded', style({ height: '*', visibility: 'visible' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    // styleUrls: ['./element-selector.component.sass']
})
export class ElementSelectorComponent implements OnInit {

    @ViewChild('searchInputControl', { static: false }) set content(content: ElementRef) {

        if (!this.searchControlInput && content) {
            fromEvent(content.nativeElement, 'keyup').pipe(
                map((event: any) => {
                    return event.target.value;
                }),
                filter(res => res.length >= 0),
                debounceTime(500),
                distinctUntilChanged()).subscribe((text: string) => {

                this.dataSource = new MatTableDataSource<any>(null);
                this.loading = false;
                this.totalItemCount = 0;
                this.currentRecord = 0;
                this.fetch(40, 0);

            });
            this.searchControlInput = content;
        }
        this.cd.detectChanges();
    }

  constructor(
    public dialogRef: MatDialogRef<ElementSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private resourceService: ResourcesService,
    private markdownParser: MarkdownParserService,
    private messageService: MessageService,
    private contextSearchHandler: ContentSearchHandlerService,
    private cd: ChangeDetectorRef
  ) {}
  pageSize = 40;
  validTypesToSelect = [];
  public searchInput: string;
  loading = true;
  formData = {
    showSearchResult: false,
    selectedType: '',
    step: 0,
    currentContext: null,
    searchResult: null,
    searchResultTotal: null,
    searchResultPageSize: 40,
    searchResultOffset: 0,
    searchResultDisplayedSoFar: 0,
    exactMatch: false,
    treeSearchText: '',
    startFetching: 0,
    inSearchMode: false
  };
  showPrevBtn = false;
  public terminologies: any[];
  public termsList: any[];
  options;
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['label'];
  selectedTerm;
  noData = true;
  currentRecord: number;
  totalItemCount: number;
  isProcessing = false;
  expandedElement: any;
  rootNode: any;
  reloading = false;

    private searchControlInput: ElementRef;
    isExpansionDetailRow = (i: number, row: object) => row.hasOwnProperty('detailRow');

    closeHelp(): void {
        this.dialogRef.close();
    }

    onElementTypeSelect(selectedType) {
        this.formData.selectedType = selectedType;
        this.formData.step = 1;
        this.searchInput = '';
        this.dataSource = new MatTableDataSource<any>(null);
        this.totalItemCount = 0;
        this.currentRecord = 0;
        this.reLoad();
    }
    configureValidTypes(validTypesToSelect: any[]) {
      this.validTypesToSelect = validTypesToSelect;
      if (validTypesToSelect.length === 1) {
        this.showPrevBtn = false;
        this.onElementTypeSelect(validTypesToSelect[0]);
      } else {

        this.showPrevBtn = true;
        //console.log(this.showOptions)
      }
    }

    reLoad() {
        if (['DataModel', 'DataClass'].indexOf(this.formData.selectedType) !== -1) {

             this.loadAllDataModels();
        }

        if (this.formData.selectedType === 'Folder') {
            this.showPrevBtn = true;
            this.loadAllFolders();
        }

        if (this.formData.selectedType === 'Term') {
            this.showPrevBtn = true;
            this.loadTerminologies();
        }
        this.showPrevBtn = true;

    }
    previousStep = function() {
        this.formData.step = 0;
        this.formData.currentContext = null;
        this.formData.treeSearchText = '';
        this.searchInput = '';
        this.dataSource = new MatTableDataSource<any>(null);
    };

    loadAllDataModels() {
        this.reloading = true;
        this.resourceService.tree.get().subscribe((data) => {
            this.rootNode = {
                children: data.body,
                isRoot: true
            };
            this.reloading = false;
        }, function() {
            this.reloading = false;
        });
    }
  loadAllFolders = function() {
    this.loading = true;
    this.resourceService.folder.get(null, null, { all: true }).subscribe( (data) => {
      this.loading = false;
      this.rootNode = {
        children: data.body.items,
        isRoot: true
      };
    }, function(error) {
      this.loading = false;
    });
  };

    loadTerminologies = function() {
        this.reloading = true;
        this.resourceService.terminology.get(null, null, { all: true }).subscribe(res => {
            if (this.data.notAllowedToSelectIds && this.data.notAllowedToSelectIds.length > 0) {
                let i = res.body.items.length - 1;
                while (i >= 0) {
                    // var found =  _.find(data.notAllowedToSelectIds, function(terminologyId) {
                    //     return terminologyId === data.items[i].id;
                    // });
                    let found = false;
                    this.data.notAllowedToSelectIds.forEach((terminologyId) => {
                        if (terminologyId === res.body.items[i].id) {
                            found = true;

                        }
                    });

                    if (found) {
                        res.body.items.splice(i, 1);
                    }
                    i--;
                }
            }
            this.terminologies = res.body.items;

            // this.reloading = false;
        }, function() {
            this.reloading = false;
        });
    };

    onTerminologySelect = (terminology: any, record: any) => {
        this.dataSource = new MatTableDataSource<any>(null);
        if (terminology != null) {
            this.formData.currentContext = this.terminologies.find((data: any) => data.label === terminology.label);
            this.fetch(40, 0);
        } else {
            this.totalItemCount = 0;
            this.currentRecord = 0;
            this.noData = true;
            this.searchInput = '';
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
            const requiredNum = this.dataSource.data.filter(x => !x.hasOwnProperty('detailRow')).length + this.pageSize;
            if ((this.totalItemCount + this.pageSize) > requiredNum && this.isProcessing === false) {
                this.isProcessing = true;
                this.fetch(this.pageSize, this.dataSource.data.filter(x => !x.hasOwnProperty('detailRow')).length, true);
            }
        }
    }

    onNodeInTreeSelect(node) {
        if (this.formData.selectedType !== node.domainType) {
            return;
        }

        const found = false;
        // if(this.notAllowedToSelectIds && $scope.notAllowedToSelectIds.length > 0){
        //     angular.forEach($scope.notAllowedToSelectIds, function (notAllowedId) {
        //         if(node.id === notAllowedId){
        //             found = true;
        //         }
        //     });
        // } TODO Ask
        if (found) {
            return;
        }

        this.messageService.elementSelectorSendData(node);
        this.dialogRef.close(node);
    }

    onTermSelect(element) {
        this.messageService.elementSelectorSendData(element);
        this.dialogRef.close(element);
    }

    public searchTextChanged2() {

        of(this.searchInput).pipe(debounceTime(400), switchMap(() => {
            this.formData.showSearchResult = true;
            return this.fetch(10, 0);

        }));
    }

    public searchTextChanged() {
        this.dataSource = new MatTableDataSource<any>(null);
        this.loading = false;
        this.totalItemCount = 0;
        this.currentRecord = 0;
        this.fetch(40, 0);
    }

    public fetch(pageSize: number, offset: number, infinateScrollCall: boolean = false): any {
        if ((!this.searchInput || (this.searchInput && this.searchInput.trim().length === 0)) && this.formData.currentContext) {
          //  offset = offset / pageSize;
            // load all elements if possible(just all DataTypes for DataModel and all DataElements for a DataClass)
            this.loadAllContextElements(this.formData.currentContext, this.formData.selectedType, pageSize, offset);
        } else {
                        // var deferred = $q.defer();
            this.formData.searchResultOffset = offset;

            this.loading = true;
          //  offset = offset / pageSize;
            // $scope.safeApply();
            // var position = offset * this.formData.searchResultPageSize;
            this.contextSearchHandler.search(
                this.formData.currentContext,
                this.searchInput,
                pageSize,
                offset,
                [this.formData.selectedType],
                undefined,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ).subscribe(res => {
                const rows = [];
                this.loading = false;
                res.body.items.forEach(element => {
                    if (element.hasOwnProperty('breadcrumbs')) {
                        rows.push(element, { detailRow: true, element });
                    } else {
                        rows.push(element);
                    }
                });

                // if(element.hasOwnProperty("breadcrumbs"))
                if (infinateScrollCall === true) {
                    // this.dataSource.data = this.dataSource.data.concat(rows);
                    // this.dataSource._updateChangeSubscription();
                    this.isProcessing = true;

                    if (this.dataSource.data) {
                        this.dataSource.data = this.dataSource.data.concat(rows);
                        this.dataSource._updateChangeSubscription();
                    } else {
                        this.dataSource = new MatTableDataSource<any>(rows);
                    }

                    this.totalItemCount = res.body.count;

                    this.currentRecord = this.dataSource.data.filter(x => !x.hasOwnProperty('detailRow')).length;


                    this.dataSource._updateChangeSubscription();
                    this.noData = false;
                    this.isProcessing = false;


                } else {
                    this.isProcessing = true;
                    this.dataSource = new MatTableDataSource<any>(rows);
                    this.currentRecord = this.dataSource.data.filter(x => !x.hasOwnProperty('detailRow')).length;
                    this.totalItemCount = res.body.count;
                    this.noData = false;
                    this.isProcessing = false;
                }
            });


        }
    }

    loadAllDataElements(dataClass, pageSize, pageIndex) {
        const options = {
            pageSize,
            pageIndex ,
            sortBy: 'label',
            sortType: 'asc'
        };
        return this.resourceService.dataClass.get(dataClass.dataModel, null, dataClass.id, 'dataElements', options);
    }
    loadAllContextElements(currentContext, selectedType, pageSize, offset) {

        if (currentContext.domainType === 'DataClass' && selectedType === 'DataElement') {
            this.loading = true;
            this.formData.searchResultOffset = offset;

            this.loadAllDataElements(currentContext, pageSize, offset).subscribe( (result) => {
                const rows = [];

                result.body.items.forEach(element => {
                    if (element.hasOwnProperty('breadcrumbs')) {
                        rows.push(element, { detailRow: true, element });
                    } else {
                        rows.push(element);
                    }
                });
                this.formData.searchResult = result.items;
                this.calculateDisplayedSoFar(result);


                this.loading = false;
            });

        } else if (currentContext.domainType === 'DataModel' && selectedType === 'DataType') {

            this.formData.searchResultOffset = offset;
            this.loading = true;
            this.loadAllDataTypes(currentContext, pageSize, offset).subscribe((result) => {
                const rows = [];

                result.body.items.forEach(element => {
                    if (element.hasOwnProperty('breadcrumbs')) {
                        rows.push(element, { detailRow: true, element });
                    } else {
                        rows.push(element);
                    }
                });

                // $scope.loading = false;
                this.formData.searchResult = result.items;
                this.calculateDisplayedSoFar(result.body);
                this.termsList = rows;

                if (this.dataSource.data) {
                    this.dataSource.data = this.dataSource.data.concat(this.termsList);
                } else {
                    this.dataSource.data = this.termsList;
                }

                this.totalItemCount = result.body.count;
                this.currentRecord = this.dataSource.data.filter(x => !x.hasOwnProperty('detailRow')).length;


                this.dataSource._updateChangeSubscription();
                this.noData = false;
                this.isProcessing = false;
                this.loading = false;


            });

            this.loading = false;

        } else if (currentContext.domainType === 'Terminology' && selectedType === 'Term') {

            this.formData.searchResultOffset = offset;
            this.loading = true;
            this.loadAllTerms(currentContext, pageSize, offset).subscribe(result => {

                this.isProcessing = true;
                const rows = [];

                result.body.items.forEach(element => {
                    if (element.hasOwnProperty('breadcrumbs')) {
                        rows.push(element, { detailRow: true, element });
                    } else {
                        rows.push(element);
                    }
                });

                this.termsList = rows;
                this.totalItemCount = result.body.count;
                if (this.dataSource.data) {
                    this.dataSource.data = this.dataSource.data.concat(this.termsList);
                } else {
                    this.dataSource.data = this.termsList;
                }


               // this.currentRecord = this.dataSource.data.length;

                // this.totalItemCount = this.dataSource.data.filter(x => !x.hasOwnProperty("detailRow")).length;
                this.currentRecord = this.dataSource.data.filter(x => !x.hasOwnProperty('detailRow')).length;

                this.dataSource._updateChangeSubscription();
                this.noData = false;
                this.isProcessing = false;
                this.loading = false;
      });
    }
  }
  loadAllTerms(terminology, pageSize, pageIndex) {
    const options = {
      pageSize,
      pageIndex
    };
    return this.resourceService.terminology.get(
      terminology.id,
      'terms',
      options
    );
  }
  calculateDisplayedSoFar(result) {
    this.formData.searchResultTotal = result.count;

    if (result.count >= this.formData.searchResultPageSize) {
      const total =
        (this.formData.searchResultOffset + 1) *
        this.formData.searchResultPageSize;
      if (total >= result.count) {
        this.formData.searchResultDisplayedSoFar = result.count;
      } else {
        this.formData.searchResultDisplayedSoFar = total;
      }
    } else {
      this.formData.searchResultDisplayedSoFar = result.count;
    }
  }
  loadAllDataTypes(dataModel, pageSize, pageIndex) {
    const options = {
      pageSize,
      pageIndex,
      sortBy: 'label',
      sortType: 'asc'
    };
    return this.resourceService.dataModel.get(
      dataModel.id,
      'dataTypes',
      options
    );
  }
  searchInTree(treeSearchDomainType) {
    if (this.formData.treeSearchText.trim().length === 0) {
      this.formData.inSearchMode = false;
      this.reLoad();
      return;
    }
    this.formData.inSearchMode = true;
    this.reloading = true;
    // this.allModels = [];

    const options = {
      queryStringParams: {
        domainType: treeSearchDomainType
      }
    };

    this.resourceService.tree
      .get(null, 'search/' + this.formData.treeSearchText, options)
      .subscribe(result => {
        this.reloading = false;
        this.rootNode = {
          children: result.body,
          isRoot: true
        };
      });
  }
  onContextSelected = element => {
    if (element && element.length > 0) {
      this.formData.currentContext = element[0];
    } else {
      this.formData.currentContext = null;
      this.dataSource = new MatTableDataSource<any>(null);
      this.totalItemCount = 0;
      this.currentRecord = 0;
    }

    this.fetch(40, 0);
  };

  ngOnInit() {
    this.configureValidTypes(this.data.validTypesToSelect);
  }
}
