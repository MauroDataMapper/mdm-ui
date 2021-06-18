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
import { Component, AfterViewInit, Input, ViewChild, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { GridService } from '@mdm/services';

@Component({
   selector: 'mdm-reference-data-type',
   templateUrl: './reference-data-type.component.html',
   styleUrls: ['./reference-data-type.component.scss']
})
export class ReferenceDataTypeComponent implements AfterViewInit {
   @Input() parent: any;
   @Output() totalCount = new EventEmitter<string>();

   @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
   records: any[] = [];
   totalItemCount = 0;
   isLoadingResults = true;
   displayedColumns = ['name', 'description', 'type'];

   constructor(
      private resources: MdmResourcesService,
      private changeRef: ChangeDetectorRef,
      private gridService: GridService
   ) { }

   ngAfterViewInit(): void {
      merge(this.paginator.page).pipe(startWith({}), switchMap(() => {
         this.isLoadingResults = true;
         this.changeRef.detectChanges();
         return this.listReferenceDataTypes(this.paginator.pageSize, this.paginator.pageOffset);
      }), map((data: any) => {
         this.totalItemCount = data.body.count;
         this.totalCount.emit(String(data.body.count));
         this.isLoadingResults = false;
         return data.body.items;
      }), catchError(() => {
         this.isLoadingResults = false;
         this.changeRef.detectChanges();
         return [];
      })).subscribe(data => {
         this.records = data;
         this.isLoadingResults = false;
         this.changeRef.detectChanges();
      });
   }

   listReferenceDataTypes = (pageSize?, pageIndex?) => {
      const options = this.gridService.constructOptions(pageSize, pageIndex);
      return this.resources.referenceDataType.list(this.parent?.id, options);
   };
}
