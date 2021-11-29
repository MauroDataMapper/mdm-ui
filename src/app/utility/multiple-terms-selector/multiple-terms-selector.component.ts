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
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ContentSearchHandlerService } from '@mdm/services/content-search.handler.service';
import { EMPTY, fromEvent } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { GridService } from '@mdm/services/grid.service';
import { Term, TermIndexResponse, Terminology, TerminologyIndexResponse } from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-multiple-terms-selector',
  templateUrl: './multiple-terms-selector.component.html',
  styleUrls: ['./multiple-terms-selector.component.scss']
})
export class MultipleTermsSelectorComponent {
  @Input() hideAddButton = true;

  @Output() selectedTermsChange = new EventEmitter<any[]>();
  @Output() addingTerms = new EventEmitter<Term[]>();

  @ViewChild('searchInputTerms', { static: true })
  dataSource = new MatTableDataSource<Term>();

  pageSize = 40;
  displayedColumns: string[] = ['label'];
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
  addAllTerms = false;

  searchInputTerms: ElementRef;
  currentRecord: number;
  totalItemCount = 0;
  isProcessing = false;
  selectedItems: any[];
  private searchControlInput: ElementRef;
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
      fromEvent(content.nativeElement, 'keyup').pipe(map((event: any) => {
        return event.target.value;
      }),
        filter(res => res.length >= 0),
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(() => {
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
    private resources: MdmResourcesService,
    private contextSearchHandler: ContentSearchHandlerService,
    private cd: ChangeDetectorRef,
    private gridService: GridService,
    private messageHandler: MessageHandlerService) {
    this.loadTerminologies();
  }

  loadTerminologies() {
    this.resources.terminology.list().subscribe((data: TerminologyIndexResponse) => {
      this.selectorSection.terminologies = data.body.items;
    });
  }

  onTerminologySelect(terminology: Terminology) {
    this.dataSource = new MatTableDataSource<Term>(null);
    this.selectorSection.selectedTerminology = terminology;
    if (terminology != null) {
      this.fetch(40, 0);
    } else {
      this.totalItemCount = 0;
      this.currentRecord = 0;
    }
  }

  runTermSearch() {
    this.fetch(40, 0);
  }

  loadAllTerms(terminology: Terminology, pageSize: number, offset: number) {
    this.selectorSection.searchResultOffset = offset;
    this.loading = true;
    const options = this.gridService.constructOptions(pageSize, offset);
    this.selectorSection.loading = true;

    this.resources.terms.list(terminology.id, options).subscribe((result: TermIndexResponse) => {
      // make check=true if element is already selected
      result.body.items.forEach(item => {
        item.terminology = terminology;
      });

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
    });
  }

  fetch(pageSize: number, offset: number) {
    if (this.selectorSection.termSearchText.length === 0 && this.selectorSection.selectedTerminology) {
      // load all elements if possible(just all DataTypes for DataModel and all DataElements for a DataClass)
      return this.loadAllTerms(this.selectorSection.selectedTerminology, pageSize, offset);
    } else {
      this.selectorSection.searchResultOffset = offset;
      this.loading = true;

      const position = offset;
      this.contextSearchHandler
        .search(
          this.selectorSection.selectedTerminology,
          this.selectorSection.termSearchText,
          this.selectorSection.searchResultPageSize,
          position,
          ['Term'],
          true,
          null,
          null,
          null,
          null,
          null,
          null,
          null)
        .subscribe(result => {
          this.selectorSection.searchResult = result.body.items;
          // make check=true if element is already selected
          result.body.items.forEach((item) => {
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

        }, () => {
          this.loading = false;
          this.isProcessing = false;
        });
    }
  };

  onTableScroll(e) {
    const tableViewHeight = e.target.offsetHeight; // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight; // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled

    // If the user has scrolled within 200px of the bottom, add more data
    const buffer = 340; // 200 old value
    const limit = tableScrollHeight - tableViewHeight - buffer;
    if (scrollLocation > limit && limit > 0) {
      const requiredNum = this.dataSource.data.length + this.pageSize;
      if (this.totalItemCount + this.pageSize > requiredNum && !this.isProcessing) {
        this.isProcessing = true;
        this.fetch(this.pageSize, this.dataSource.data.length);
      }
    }
  }

  calculateDisplayedSoFar(result) {
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
  }

  termToggle($item) {
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

    this.selectedTermsChange.emit(this.selectorSection.selectedTermsArray);
  }

  removeTerm($item) {
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
  }

  addSelectedTerms() {
    if (!this.addAllTerms) {
      this.addingTerms.emit(this.selectorSection.selectedTermsArray);
      return;
    }

    const options = this.gridService.constructOptions(this.totalItemCount);

    this.resources.terms
      .list(this.selectorSection.selectedTerminology.id, options)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem getting all the terms.', error);
          return EMPTY;
        })
      )
      .subscribe((response: TermIndexResponse) => {
        this.addingTerms.emit(response.body.items);
      });
  }
}
