/*
Copyright 2020 University of Oxford

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
  ViewChildren,
  ElementRef,
  ViewChild,
  EventEmitter,
  AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import {MessageHandlerService} from '@mdm/services/utility/message-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import {StateHandlerService} from '@mdm/services/handlers/state-handler.service';
import {merge, Observable} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ElementTypesService} from '@mdm/services/element-types.service';
import {SecurityHandlerService} from '@mdm/services/handlers/security-handler.service';
import {MdmPaginatorComponent} from '../mdm-paginator/mdm-paginator';


@Component({
  selector: 'mdm-code-set-terms-table',
  templateUrl: './code-set-terms-table.component.html',
  styleUrls: ['./code-set-terms-table.component.scss']
})
export class CodeSetTermsTableComponent implements OnInit, AfterViewInit {
  @Input() codeSet: any;
  @Input() type: any; // static, dynamic
  clientSide: any; // if true, it should NOT pass values to the serve in save/update/delete
  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults = false;
  filterEvent = new EventEmitter<string>();
  filter: string;
  deleteInProgress: boolean;
  records: any[] = [];
  access: any;
  @ViewChildren('filters', {read: ElementRef}) filters: ElementRef[];
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  baseTypes: any;
  classifiableBaseTypes: any;
  filterValue: any;
  filterName: any;
  showAddTerm: any;

  constructor(private messageHandler: MessageHandlerService, private resources: MdmResourcesService, private stateHandler: StateHandlerService, private elementTypes: ElementTypesService, private changeRef: ChangeDetectorRef, private securityHandler: SecurityHandlerService) {
  }

  ngOnInit() {
    this.displayedColumns = ['terminology', 'term', 'definition', 'btns'];
    this.isLoadingResults = false;


  }

  ngAfterViewInit() {

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.filterEvent.subscribe(() => this.paginator.pageIndex = 0);

    this.baseTypes = [{id: '', title: ''}].concat(this.elementTypes.getBaseTypesAsArray());

    this.classifiableBaseTypes = this.baseTypes.filter(f => f.classifiable === true);


    this.classifiableBaseTypes = [{id: '', title: ''}].concat(this.classifiableBaseTypes);


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
              this.paginator.pageOffset,
              this.sort.active,
              this.sort.direction,
              this.filter);

          }
        ),
        map((data: any) => {
          this.totalItemCount = data.body.count;
          this.isLoadingResults = false;
          return data.body.items;
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

    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };
    return this.resources.codeSet.terms(this.codeSet.id, options);
    // return this.resources.codeSet.get(this.codeSet.id, 'terms', options);

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

    if (this.filterValue !== null && this.filterValue !== undefined && this.filterName !== null && this.filterName !== undefined) {
      filter += this.filterName + '=' + this.filterValue + '&';
    }
    this.filter = filter.substring(0, filter.length - 1);
    this.filterEvent.emit(filter);
  };

  applyMatSelectFilter(filterValue: any, filterName) {
    this.filterValue = filterValue;
    if (this.filterValue !== '') {
      this.filterName = filterName;
    } else {
      this.filterName = '';
    }
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

    this.resources.codeSet.removeTerm(this.codeSet.id, record.id)
    // this.resources.codeSet.delete(this.codeSet.id, 'terms/' + record.id, null, null)
      .subscribe(() => {
        if (this.type === 'static') {
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
    this.showAddTerm = !this.showAddTerm;

    return;

  };

  addTerms = (terms) => {
    this.codeSet.terms = this.records;
    // current terms
    const currentTerms = this.codeSet.terms.map((term) => {
      return {id: term.id};
    });
    const newTermIds = terms.map((term) => {
      return {id: term.id};
    });

    const allTermIds = [].concat(newTermIds).concat(currentTerms);

    this.resources.codeSet.update(this.codeSet.id, { terms: allTermIds })
    // this.resources.codeSet.put(this.codeSet.id, null, {resource: {terms: allTermIds}})
      .subscribe((result) => {
      this.messageHandler.showSuccess('Terms added successfully.');
      // this.mcTableHandler.fetchForDynamic();
      // $scope.mcDisplayRecords[index].success = false;
      const options = {
        pageSize: 40,
        pageIndex: 0,
        sortBy: null,
        sortType: null,
        filters: null
      };

      this.resources.codeSet.terms(this.codeSet.id, options)
      // this.resources.codeSet.get(this.codeSet.id, 'terms', options)
      .subscribe(data => {
        this.records = data.body.items;
      });
      setTimeout(() => {
        this.toggleAddTermsSection();
      }, 500);
    }, error => {
      this.messageHandler.showError('There was a problem adding the Terms.', error);
    });
  };


}
