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
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
  AsyncJob,
  AsyncJobResponse,
  AsyncJobStatus,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'mdm-async-job-detail',
  templateUrl: './async-job-detail.component.html',
  styleUrls: ['./async-job-detail.component.scss']
})
export class AsyncJobDetailComponent implements OnInit {
  job: AsyncJob;

  constructor(
    private resources: MdmResourcesService,
    private title: Title,
    private routerGlobals: UIRouterGlobals,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Job detail');
    const id: Uuid = this.routerGlobals.params.id;

    this.resources.asyncJobs
      .get(id)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem fetching the job details.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((response: AsyncJobResponse) => {
        this.job = response.body;
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

  close() {
    this.stateHandler.Go('appContainer.userArea.asyncJobs');
  }

  cancelJob() {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Cancel job',
          message: 'Are you sure you want to cancel this job? It cannot be restarted once cancelled.',
          okBtnTitle: 'Yes',
          cancelBtnTitle: 'No'
        }
      })
      .pipe(
        switchMap(() => this.resources.asyncJobs.remove(this.job.id)),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem cancelling the job.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          'The selected job was cancelled successfully.'
        );
        this.close();
      });
  }
}
