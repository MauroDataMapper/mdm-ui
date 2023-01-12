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
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import {
  AsyncJob,
  AsyncJobIndexResponse,
  AsyncJobStatus
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  GridService,
  MessageHandlerService,
  StateHandlerService
} from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { merge, Observable, EMPTY } from 'rxjs';
import {
  startWith,
  switchMap,
  map,
  catchError,
  tap,
  delay
} from 'rxjs/operators';

@Component({
  selector: 'mdm-async-job-list',
  templateUrl: './async-job-list.component.html',
  styleUrls: ['./async-job-list.component.scss']
})
export class AsyncJobListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;

  filtering = new EventEmitter<void>();
  filterValues = {};

  dataSource = new MatTableDataSource<AsyncJob>([]);
  totalItemCount = 0;
  loading = false;
  displayedColumns = [
    'jobName',
    'startedByUser',
    'dateTimeStarted',
    'status',
    'actions'
  ];
  showFilters = false;
  statusOptions = [
    null,
    'CREATED',
    'RUNNING',
    'COMPLETED',
    'FAILED',
    'CANCELLING',
    'CANCELLED'
  ];

  constructor(
    private resources: MdmResourcesService,
    private title: Title,
    private grid: GridService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog,
    private stateHandler: StateHandlerService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Jobs');
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filtering.subscribe(() => (this.paginator.pageIndex = 0));
    this.dataSource.sort = this.sort;

    this.refreshList();
  }

  toggleFilter() {
    this.showFilters = !this.showFilters;
  }

  inputFilterChanged(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    this.filterValues = {
      ...this.filterValues,
      [input.name]: input.value
    };
    this.filtering.emit();
  }

  selectionFilterChanged(event: MatSelectChange) {
    this.filterValues = {
      ...this.filterValues,
      [event.source.id]: event.value
    };

    if (!event.value) {
      delete this.filterValues[event.source.id];
    }

    this.filtering.emit();
  }

  cancelJob(job: AsyncJob) {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Cancel job',
          message: `Are you sure you want to cancel "${job.jobName}"? It cannot be restarted once cancelled.`,
          okBtnTitle: 'Yes',
          cancelBtnTitle: 'No'
        }
      })
      .pipe(
        switchMap(() => this.resources.asyncJobs.remove(job.id)),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem cancelling the job.',
            error
          );
          return EMPTY;
        }),
        tap(() => {
          this.messageHandler.showSuccess(
            'The selected job was cancelled successfully.'
          );
        }),
        delay(500)
      )
      .subscribe(() => {
        // After cancelling a job, trigger a refresh of the list to show the new status
        this.filtering.emit();
      });
  }

  viewJob(job: AsyncJob) {
    this.stateHandler.Go('appContainer.userArea.asyncJobDetail', {
      id: job.id
    });
  }

  getStatusIconStyle(status: AsyncJobStatus) {
    switch (status) {
      case 'CREATED':
        return 'fas fa-plus status-pending';
      case 'RUNNING':
        return 'fas fa-spinner status-pending';
      case 'COMPLETED':
        return 'fas fa-check-circle status-positive';
      case 'FAILED':
        return 'fas fa-times-circle status-negative';
      case 'CANCELLING':
        return 'fas fa-eject status-pending';
      case 'CANCELLED':
        return 'fas fa-ban status-negative';
      default:
        return '';
    }
  }

  private refreshList() {
    merge(this.sort.sortChange, this.paginator.page, this.filtering)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.loading = true;
          return this.fetch(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction,
            this.filterValues
          );
        }),
        catchError((error) => {
          this.loading = false;
          this.messageHandler.showError(
            'There was a problem getting the list of jobs.',
            error
          );
          return EMPTY;
        }),
        map((response) => {
          this.loading = false;
          this.totalItemCount = response.body.count;
          return response.body.items;
        })
      )
      .subscribe((data) => (this.dataSource.data = data));
  }

  private fetch(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection,
    filter?: {}
  ): Observable<AsyncJobIndexResponse> {
    const options = this.grid.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filter
    );

    return this.resources.asyncJobs.list(options);
  }
}
