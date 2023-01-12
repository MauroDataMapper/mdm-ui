/*
Copyright 2020-2023 University of Oxford
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
  AfterViewInit,
  Input,
  ViewChild,
  EventEmitter,
  Output
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { merge, Observable } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  startWith,
  switchMap
} from 'rxjs/operators';
import { GridService, StateHandlerService } from '@mdm/services';
import {
  ReferenceDataModelDetail,
  ReferenceDataType,
  ReferenceDataTypeIndexResponse
} from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-reference-data-type',
  templateUrl: './reference-data-type.component.html',
  styleUrls: ['./reference-data-type.component.scss']
})
export class ReferenceDataTypeComponent implements AfterViewInit {
  @Input() parent: ReferenceDataModelDetail;
  @Input() showEdit = false;

  @Output() totalCount = new EventEmitter<string>();

  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  records: ReferenceDataType[] = [];
  totalItemCount = 0;
  loading = true;
  displayedColumns = ['name', 'description', 'type'];

  constructor(
    private resources: MdmResourcesService,
    private gridService: GridService,
    private stateHandler: StateHandlerService
  ) {}

  ngAfterViewInit(): void {
    merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.loading = true;
          return this.listReferenceDataTypes(
            this.paginator.pageSize,
            this.paginator.pageOffset
          );
        }),
        map((response) => {
          this.totalItemCount = response.body.count;
          this.totalCount.emit(String(response.body.count));
          this.loading = false;
          return response.body.items;
        }),
        catchError(() => {
          this.loading = false;
          return [];
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((data: ReferenceDataType[]) => {
        this.records = data;
      });
  }

  listReferenceDataTypes(
    pageSize?: number,
    pageIndex?: number
  ): Observable<ReferenceDataTypeIndexResponse> {
    const options = this.gridService.constructOptions(pageSize, pageIndex);
    return this.resources.referenceDataType.list(this.parent?.id, options);
  }

  addDataType() {
    this.stateHandler.Go('newrefdatatype', {
      parentModelId: this.parent.id
    });
  }
}
