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
  ViewChildren,
  ElementRef,
  ViewChild,
  EventEmitter,
  AfterViewInit, ChangeDetectorRef, Output
} from '@angular/core';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { GridService } from '@mdm/services/grid.service';
import { CatalogueItemDomainType, CodeSetDetail, ModelUpdatePayload, Term } from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';

@Component({
  selector: 'mdm-code-set-terms-table',
  templateUrl: './code-set-terms-table.component.html',
  styleUrls: ['./code-set-terms-table.component.scss']
})
export class CodeSetTermsTableComponent implements OnInit, AfterViewInit {
  @Input() codeSet: CodeSetDetail;
  @Input() type: any; // static, dynamic
  @Output() totalCount = new EventEmitter<string>();
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  clientSide: any; // if true, it should NOT pass values to the serve in save/update/delete
  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults = false;
  filterEvent = new EventEmitter<any>();
  filter: {};
  deleteInProgress: boolean;
  records: any[] = [];
  access: Access;
  baseTypes: any;
  classifiableBaseTypes: any;
  filterValue: any;
  filterName: any;
  showAddTerm: any;

  constructor(private messageHandler: MessageHandlerService, private gridService: GridService, private resources: MdmResourcesService, private elementTypes: ElementTypesService, private changeRef: ChangeDetectorRef, private securityHandler: SecurityHandlerService) {
  }

  ngOnInit() {
    if (this.access && this.access.showEdit) {
      this.displayedColumns = ['terminology', 'term', 'definition', 'btns'];
    } else {
      this.displayedColumns = ['terminology', 'term', 'definition'];
    }
    this.isLoadingResults = false;
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.filterEvent.subscribe(() => this.paginator.pageIndex = 0);
    this.baseTypes = [{ id: '', title: '' }].concat(this.elementTypes.getBaseTypesAsArray());
    this.classifiableBaseTypes = this.baseTypes.filter(f => f.classifiable === true);
    this.classifiableBaseTypes = [{ id: '', title: '' }].concat(this.classifiableBaseTypes);

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      return this.termFetch(this.paginator.pageSize,
        this.paginator.pageOffset,
        this.sort.active,
        this.sort.direction,
        this.filter);
    }),
      map((data: any) => {
        this.totalItemCount = data.body.count;
        this.totalCount.emit(String(data.body.count));
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
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);

    return this.resources.codeSet.terms(this.codeSet.id, options);
  }

  applyFilter = () => {
    const filter = {};
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;
      if (value !== '') {
       filter[name] = value;
      }
    });
    this.filter = filter;
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

    this.resources.codeSet.removeTerm(this.codeSet.id, record.id).subscribe(() => {
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

  addTerms(terms: Term[]) {
    this.codeSet.terms = this.records;
    // current terms
    const currentTerms = this.codeSet.terms.map((term) => {
      return { id: term.id };
    });
    const newTermIds = terms.map((term) => {
      return { id: term.id };
    });

    const allTermIds = [].concat(newTermIds).concat(currentTerms);

    const resource: ModelUpdatePayload = {
      id: this.codeSet.id,
      domainType: CatalogueItemDomainType.CodeSet,
      terms: allTermIds
    };

    this.resources.codeSet.update(this.codeSet.id, resource).subscribe(() => {
      this.messageHandler.showSuccess('Terms added successfully.');
      const options = this.gridService.constructOptions(40, 0);

      this.resources.codeSet.terms(this.codeSet.id, options).subscribe(data => {
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
