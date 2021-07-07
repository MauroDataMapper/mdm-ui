/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  EventEmitter
} from '@angular/core';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { ContentSearchHandlerService } from '@mdm/services/content-search.handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { Observable, Subject, fromEvent, merge } from 'rxjs';
import {
  debounceTime,
  map,
  filter,
  distinctUntilChanged,
  switchMap,
  catchError,
  startWith
} from 'rxjs/operators';
import {
  CatalogueItemDomainType,
  Classifier,
  ClassifierIndexResponse
} from '@maurodatamapper/mdm-resources';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { EMPTY } from 'rxjs';
@Component({
  selector: 'mdm-advanced-search-bar',
  templateUrl: './advanced-search-bar.component.html',
  styleUrls: ['./advanced-search-bar.component.sass']
})
export class AdvancedSearchBarComponent implements OnInit {
  @Input() placeholder: string;
  @Input() doNotDisplayModelPathStatus: boolean;
  @Input() doNotShowDataModelInModelPath: boolean;
  @Input() showRestrictTo: boolean;
  @Input() parent: any;
  @Input() showDomainTypes: string[];
  @Input() doNotOpenLinkInNewWindow: boolean;

  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  @ViewChild('searchInputControl', { static: true })
  searchInputControl: ElementRef;

  displayedColumns: string[] = ['label'];
  searchTerm = new Subject<string>();

  advancedSearch: boolean;
  searchInput: string;
  lastDateUpdatedFrom: Date;
  lastDateUpdatedTo: Date;
  createdFrom: Date;
  createdTo: Date;
  placeHolderText: string;
  totalItemCount = 0;
  context: any;
  classifications: Classifier[];
  searchResults: any[];
  searchEvent = new EventEmitter<any>();

  hideDM: boolean;
  hideDC: boolean;
  hideDE: boolean;
  hideDT: boolean;
  hideEV: boolean;
  hideRDM: boolean;

  isLoading: boolean;

  formData = {
    showSearchResult: false,
    labelOnly: false,
    exactMatch: false,
    selectedDomainTypes: {
      DataModel: false,
      DataClass: false,
      DataElement: false,
      DataType: false,
      EnumerationValue: false,
      ReferenceDataModel: false
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
    private resources: MdmResourcesService
  ) {}

  ngOnInit() {
    this.advancedSearch = false;

    this.resources.classifier
      .list()
      .subscribe((result: ClassifierIndexResponse) => {
        this.classifications = result.body.items;
      });

    this.context = this.parent;

    if (this.showDomainTypes) {
      this.hideDM = this.showDomainTypes.indexOf(CatalogueItemDomainType.DataModel) === -1;
      this.hideDC = this.showDomainTypes.indexOf(CatalogueItemDomainType.DataClass) === -1;
      this.hideDE = this.showDomainTypes.indexOf(CatalogueItemDomainType.DataElement) === -1;
      this.hideDT = this.showDomainTypes.indexOf('DataType') === -1;
      this.hideEV = this.showDomainTypes.indexOf('EnumerationValue') === -1;
      this.hideRDM = this.showDomainTypes.indexOf(CatalogueItemDomainType.ReferenceDataModel) === -1;
    }

    this.placeHolderText = this.placeholder
      ? this.placeholder
      : 'Search for...';

    merge(this.searchEvent, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          return this.fetch(this.paginator.pageSize, this.paginator.pageOffset);
        }),
        map((res: any) => {
          this.totalItemCount = res.body.count;
          this.isLoading = false;
          return res.body.items;
        }),
        catchError(() => {
          this.isLoading = false;
          return EMPTY;
        })
      )
      .subscribe((data: any) => {
        this.searchResults = data;
      });

    fromEvent(this.searchInputControl.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
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
          this.searchEvent.emit();
        }
      });
  }

  loadHelp = () => {
    this.helpDialogueService.open('Search_Help');
  };

  toggleAdvancedSearch() {
    this.advancedSearch = !this.advancedSearch;
  }

  fetch(pageSize: number, offset: number): Observable<any> {
    this.isLoading = true;

    if (!this.formData.showSearchResult) {
      return new Observable();
    }
    const filterDataTypes = [];
    if (this.formData.selectedDomainTypes.DataModel) {
      filterDataTypes.push(CatalogueItemDomainType.DataModel);
    }
    if (this.formData.selectedDomainTypes.ReferenceDataModel) {
      filterDataTypes.push(CatalogueItemDomainType.ReferenceDataModel);
    }
    if (this.formData.selectedDomainTypes.DataClass) {
      filterDataTypes.push(CatalogueItemDomainType.DataClass);
    }
    if (this.formData.selectedDomainTypes.DataElement) {
      filterDataTypes.push(CatalogueItemDomainType.DataElement);
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
    this.formData.classifiers.forEach((classifier) => {
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
          this.paginator.pageIndex = 0;
        }
        this.searchEvent.emit();
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

  onContextSelected = (selected) => {
    this.context = null;
    if (selected && selected.length > 0) {
      this.context = selected[0];
    }

    this.search(true);
  };
}
