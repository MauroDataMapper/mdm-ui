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
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, ElementRef, ViewChildren, Output } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { GridService } from '@mdm/services/grid.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
   selector: 'mdm-reference-data-values',
   templateUrl: './reference-data-values.component.html',
   styleUrls: ['./reference-data-values.component.scss']
})
export class ReferenceDataValuesComponent implements AfterViewInit {
   @Input() parent: any;
   @Output() totalCount = new EventEmitter<string>();
   @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
   @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
   dataSource = new MatTableDataSource<any>();
   records: any[] = [];
   displayedColumns: string[];
   totalItemCount = 0;
   isLoadingResults = true;
   hideFilters = true;
   searchTerm = '';
   filterEvent = new EventEmitter<any>();
   filter: {};

   constructor(
      private changeRef: ChangeDetectorRef,
      private resources: MdmResourcesService,
      private gridService: GridService
   ) {
      this.dataSource = new MatTableDataSource(this.records);
   }

   ngAfterViewInit() {
      this.displayReferenceDataValues();
   }

   displayReferenceDataValues = () => {
      this.changeRef.detectChanges();
      this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));
      merge(this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
         this.isLoadingResults = true;
         return this.contentFetch(this.paginator.pageSize, this.paginator.pageOffset, this.filter);
      }), map((data: any) => {
         this.totalItemCount = data.body.count;
         this.totalCount.emit(String(data.body.count));
         this.isLoadingResults = false;
         return data.body.rows;
      }), catchError(() => {
         this.isLoadingResults = false;
         return [];
      })).subscribe((values: any[]) => {
         // Flatten the endpoint response to make the table rows tabular and not an object hierarchy
         this.records = values.map(row => {
            const flattened = { };
            row.columns.forEach(column => {
               flattened[column.referenceDataElement.label] = column.value;
            });
            return flattened;
         });

         const arr = [];
         if (values[0]) {
            for (const val in values[0].columns) {
               if (values[0].columns[val]) {
                  arr.push(values[0].columns[val].referenceDataElement.label);
               }
            }
            this.displayedColumns = arr;
         }

         this.dataSource.data = this.records;
      });
      this.changeRef.detectChanges();
   };

   listReferenceDataValues = (pageSize?, pageIndex?, sortBy?, sortType?) => {
      const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, { asRows: true });
      return this.resources.referenceDataValue.list(this.parent.id, options);
   };

   toggleSearch = () => {
      this.hideFilters = !this.hideFilters;
      this.displayReferenceDataValues();
   };

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

   contentFetch(pageSize?, pageIndex?, filters?): Observable<any> {
      const options = {
         max: pageSize,
         offset: pageIndex,
         asRows: true
      };

      if (filters) {
         options['search'] = this.searchTerm;
      }

      if (this.hideFilters) {
         return this.resources.referenceDataValue.list(this.parent.id, options);
      } else if (!this.hideFilters) {
         return this.resources.referenceDataValue.search(this.parent.id, { search: this.searchTerm, max: pageSize, offset: pageIndex });
      }
   }
}
