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
  Input,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { GridService } from '@mdm/services/grid.service';

@Component({
  selector: 'mdm-reference-data-values',
  templateUrl: './reference-data-values.component.html',
  styleUrls: ['./reference-data-values.component.scss']
})
export class ReferenceDataValuesComponent implements AfterViewInit {
  @Input() parent: any;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  records: any[] = [];
  total: number;
  displayedColumns: string[];
  totalItemCount = 0;
  isLoadingResults = true;
  hideFilters = true;
  term = '';

  constructor(
    private changeRef: ChangeDetectorRef,
    private resources: MdmResourcesService,
    private gridService: GridService
  ) { }

  ngAfterViewInit() {
    merge(this.paginator?.page).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      this.changeRef.detectChanges();

      return this.listReferenceDataValues(this.paginator?.pageSize, this.paginator?.pageOffset);
    }),
      map((data: any) => {
        this.totalItemCount = data.body.count;
        this.isLoadingResults = false;
        return data.body.rows;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        this.changeRef.detectChanges();
        return [];
      })
    ).subscribe(values => {
      this.records = values;
      const arr = [];
      for (const val in values[0].columns) {
         if(values[0].columns[val]) {
            arr.push(values[0].columns[val].referenceDataElement.label);
         }
      }
      this.displayedColumns = arr;
    });
  }

  displayReferenceDataValues = () => {

  };

  listReferenceDataValues = (pageSize?, pageIndex?, sortBy?, sortType?) => {
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, { asRows: true });
    return this.resources.referenceDataValue.list(this.parent.id, options);
  };

  toggleSearch = () => {
      this.hideFilters = !this.hideFilters;
  };

  onSearchValues = (pageSize = this.paginator?.pageSize, pageIndex = this.paginator?.pageOffset, sortBy?, sortType?) => {
   console.log(this.term);

   console.log(this.paginator.pageSize);
   pageSize = this.paginator?.pageSize;
   pageIndex = this.paginator?.pageOffset;
   const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, { asRows: true });

   merge(this.paginator?.page).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      this.changeRef.detectChanges();

      return this.resources.referenceDataValue.search(this.parent.id, { search: this.term, max: pageSize } );
    }),
      map((data: any) => {
        this.totalItemCount = data.body.count;
        this.isLoadingResults = false;
        return data.body.rows;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        this.changeRef.detectChanges();
        return [];
      })
    ).subscribe(values => {
      this.records = values;
      const arr = [];
      if(values[0]) {
         for (const val in values[0].columns) {
            if(values[0].columns[val]) {
               arr.push(values[0].columns[val].referenceDataElement.label);
            }
         }
         this.displayedColumns = arr;
      }
    });

  };

}
