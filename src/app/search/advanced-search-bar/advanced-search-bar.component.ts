import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { ContentSearchHandlerService } from '@mdm/services/content-search.handler.service';
import { ResourcesService } from '@mdm/services/resources.service';
import { FolderResult } from '@mdm/model/folderModel';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Observable, Subject, fromEvent } from 'rxjs';
import { debounceTime, map, filter, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'mdm-advanced-search-bar',
  // inputs: ['parent', 'placeholder', 'showDomainTypes: show-domain-types'],
  templateUrl: './advanced-search-bar.component.html',
  styleUrls: ['./advanced-search-bar.component.sass']
})
export class AdvancedSearchBarComponent implements OnInit {
  displayedColumns: string[] = ['label'];

  @Input() placeholder: string;
  @Input() doNotDisplayModelPathStatus: boolean;
  @Input() doNotShowDataModelInModelPath: boolean;
  @Input() showRestrictTo: boolean;
  @Input() parent: FolderResult;
  @Input() showDomainTypes: string[];
  @Input() doNotOpenLinkInNewWindow: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('searchInputControl', { static: true })
  searchInputControl: ElementRef;

  searchTerm = new Subject<string>();

  pageIndex: any;
  advancedSearch: boolean;
  searchInput: string;
  lastDateUpdatedFrom: Date;
  lastDateUpdatedTo: Date;
  createdFrom: Date;
  createdTo: Date;
  placeHolderText: string;
  totalItemCount = 0;
  context: any;
  classifications: any[];
  searchResults: any[];

  hideDM: boolean;
  hideDC: boolean;
  hideDE: boolean;
  hideDT: boolean;
  hideEV: boolean;

  isLoading: boolean;

  pageEvent: PageEvent;

  // showDomainTypes: string[];

  formData: any = {
    showSearchResult: false,
    labelOnly: false,
    exactMatch: false,
    selectedDomainTypes: {
      DataModel: false,
      DataClass: false,
      DataElement: false,
      DataType: false,
      EnumerationValue: false
    },
    classifiers: [],

    lastDateUpdatedFrom: null,
    lastDateUpdatedTo: null,

    createdFrom: null,
    createdTo: null
  };

  constructor(
    private helpDialogueService: HelpDialogueHandlerService,
    private contextSearchHandler: ContentSearchHandlerService,
    private resouces: ResourcesService
  ) {}

  ngOnInit() {
    this.advancedSearch = false;

    this.resouces.classifier
      .get(null, null, { all: true })
      .subscribe(result => {
        this.classifications = result.body.items;
      });

    this.context = this.parent;

    if (this.showDomainTypes) {
      this.hideDM = this.showDomainTypes.indexOf('DataModel') === -1;
      this.hideDC = this.showDomainTypes.indexOf('DataClass') === -1;
      this.hideDE = this.showDomainTypes.indexOf('DataElement') === -1;
      this.hideDT = this.showDomainTypes.indexOf('DataType') === -1;
      this.hideEV = this.showDomainTypes.indexOf('EnumerationValue') === -1;
    }

    this.placeHolderText = this.placeholder
      ? this.placeholder
      : 'Search for...';

    fromEvent(this.searchInputControl.nativeElement, 'keyup')
      .pipe(map((event: any) => {
          return event.target.value;
        }),
        filter((res: any) => res.length >= 0),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        if (text.length === 0) {
          this.formData.showSearchResult = false;
          this.searchResults = [];
          this.isLoading = false;
        } else {
          this.formData.showSearchResult = true;
          this.fetch(10, 0).subscribe(
            res => {
              this.searchResults = res.body.items;
              this.totalItemCount = res.body.count;
              this.isLoading = false;
            },
            () => {
              this.isLoading = false;
            }
          );
        }
      });
  }

  loadHelp = () => {
    this.helpDialogueService.open('Search_Help', { right: '150' });
  };

  toggleAdvancedSearch() {
    this.advancedSearch = !this.advancedSearch;
  }

  getServerData($event) {
    this.fetch($event.pageSize, $event.pageIndex).subscribe(
      res => {
        this.searchResults = res.body.items;
        this.totalItemCount = res.body.count;
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  fetch(pageSize: number, offset: number): Observable<any> {
    this.isLoading = true;

    if (!this.formData.showSearchResult) {
      return new Observable();
    }
    const filterDataTypes = [];
    if (this.formData.selectedDomainTypes.DataModel) {
      filterDataTypes.push('DataModel');
    }
    if (this.formData.selectedDomainTypes.DataClass) {
      filterDataTypes.push('DataClass');
    }
    if (this.formData.selectedDomainTypes.DataElement) {
      filterDataTypes.push('DataElement');
    }
    if (this.formData.selectedDomainTypes.DataType) {
      filterDataTypes.push('DataType');
    }
    if (this.formData.selectedDomainTypes.EnumerationValue) {
      filterDataTypes.push('EnumerationValue');
    }

    let searchText = this.searchInput;
    if (this.formData.exactMatch) {
      if (searchText[0] !== '"') {
        searchText = '"' + searchText;
      }
      if (searchText[searchText.length - 1] !== '"') {
        searchText = searchText + '"';
      }
    }

    const classifiersNames = [];
    this.formData.classifiers.forEach(classifier => {
      classifiersNames.push(classifier.label);
    });

    return this.contextSearchHandler.search(
      this.context,
      searchText,
      pageSize,
      offset,
      filterDataTypes,
      this.formData.labelOnly,
      null,
      classifiersNames,
      null,
      this.lastDateUpdatedFrom,
      this.lastDateUpdatedTo,
      this.createdFrom,
      this.createdTo
    );
  }

  search(resetPageIndex?: boolean) {
    if (this.searchInput !== undefined) {
      if (this.searchInput.trim().length !== 0) {
        if (resetPageIndex) {
          this.pageIndex = 0;
        }
        this.fetch(10, this.pageIndex).subscribe(
          res => {
            this.isLoading = false;
            this.searchResults = res.body.items;
            this.totalItemCount = res.body.count;
          },
          () => {
            this.isLoading = false;
          }
        );
      }
    }
  }

  onClassifierChange(): void {
    this.search(true);
  }

  onLastUpdatedSelect($event): void {
    this.lastDateUpdatedFrom = $event.from;
    this.lastDateUpdatedTo = $event.to;
    this.search(true);
  }

  onCreatedSelect($event): void {
    this.createdFrom = $event.from;
    this.createdTo = $event.to;
    this.search(true);
  }

  onContextSelected = selected => {
    this.context = null;
    if (selected && selected.length > 0) {
      this.context = selected[0];
    }

    this.search(true);
  }
}
