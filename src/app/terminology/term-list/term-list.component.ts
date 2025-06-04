/*
Copyright 2020-2025 University of Oxford and NHS England

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
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { MatSort, SortDirection, MatSortHeader } from '@angular/material/sort';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  Term,
  TermDetail,
  TermIndexResponse,
  TerminologyDetail
} from '@maurodatamapper/mdm-resources';
import { merge, Observable } from 'rxjs';
import {
  CreateTermDialogComponent,
  CreateTermForm
} from './create-term-dialog/create-term-dialog.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { GridService, MessageHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '../../shared/mdm-paginator/mdm-paginator';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MoreDescriptionComponent } from '../../shared/more-description/more-description.component';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'mdm-term-list',
    templateUrl: './term-list.component.html',
    styleUrls: ['./term-list.component.scss'],
    standalone: true,
    imports: [FlexModule, MatTooltip, MatButton, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatFormField, MatLabel, MatInput, FormsModule, MatCellDef, MatCell, NgIf, MoreDescriptionComponent, MatIconButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, ExtendedModule, MdmPaginatorComponent_1]
})
export class TermListComponent implements AfterViewInit {
  @Input() terminology: TerminologyDetail;
  @Input() pageSize = 10;
  @Input() canEdit = false;
  @Input() canDelete = false;
  @Output() totalCount = new EventEmitter<number>();
  @Output() selectedTerm = new EventEmitter<Term>();
  @Output() addedTerm = new EventEmitter<Term>();
  @Output() deletedTerm = new EventEmitter();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;

  displayedColumns: string[] = ['code', 'definition', 'description', 'actions'];
  terms: Term[] = [];
  isLoadingResults = false;
  totalItemCount = 0;

  hideFilters = true;
  filterEvent = new EventEmitter<any>();
  filter: {};
  codeFilter?: string;
  definitionFilter?: string;
  descriptionFilter?: string;

  constructor(
    private resources: MdmResourcesService,
    private gridService: GridService,
    private messageHandler: MessageHandlerService,
    private editing: EditingService
  ) {}

  ngAfterViewInit() {
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));
    this.sort?.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.fetchTerms(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction,
            this.filter
          );
        }),
        map((data) => {
          this.totalItemCount = data.body.count;
          this.totalCount.emit(data.body.count);
          this.isLoadingResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      )
      .subscribe((data) => {
        this.terms = data;
      });
  }

  filterClick() {
    this.hideFilters = !this.hideFilters;
  }

  applyFilter() {
    this.filter = {
      ...(this.codeFilter &&
        this.codeFilter !== '' && { code: this.codeFilter }),
      ...(this.definitionFilter &&
        this.definitionFilter !== '' && { definition: this.definitionFilter }),
      ...(this.descriptionFilter &&
        this.descriptionFilter !== '' && {
          description: this.descriptionFilter
        })
    };

    this.filterEvent.emit();
  }

  reload() {
    this.hideFilters = true;
    this.filter = {};
    this.filterEvent.emit();
  }

  fetchTerms(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection,
    filters?: {}
  ): Observable<TermIndexResponse> {
    const options = this.gridService.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    );
    return this.resources.terms.list(this.terminology.id, options);
  }

  openCreateTermDialog(): void {
    this.editing
      .openDialog<CreateTermDialogComponent, CreateTermForm, TermDetail>(
        CreateTermDialogComponent,
        {
          data: new CreateTermForm(this.terminology),
          minWidth: 800
        }
      )
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.reload();
          this.addedTerm.emit(data);
        }
      });
  }

  deleteTerm(term: Term) {
    if (this.canDelete) {
      this.resources.terms
        .remove(this.terminology.id, term.id)
        .subscribe(() => {
          this.messageHandler.showSuccess(
            `Term "${term.definition}" was successfully removed.`
          );
          this.reload();
        });
    }
  }
}
