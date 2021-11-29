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
import { Component, OnInit } from '@angular/core';
import { MessageService } from '../services/message.service';
import { ClipboardService } from 'ngx-clipboard';

import { YoutrackService } from '../services/youtrack.service';
import { SharedService } from '../services/shared.service';

const columns: string[] = ['field', 'value'];

@Component({
  selector: 'mdm-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  showYouTrackLink = true;
  showDetails = false;
  lastError: any;

  dataSource: object[] = [];
  displayedColumns: string[] = columns;
  codeHighlighted = false;
  issueReported = false;
  issueReporting = false;
  isLoggedIn = false;
  summary: string;
  errorInSubmit = false;
  username: string;
  errorHeader: string;
  errorMessage: string;
  errorResolution: string;
  errorReportMessage: string;

  constructor(
    protected messageService: MessageService,
    protected clipboardService: ClipboardService,
    protected sharedService: SharedService,
    protected youtrackService: YoutrackService
  ) {
    this.lastError = messageService.lastError;
    this.isLoggedIn = sharedService.isLoggedIn();
    this.summary = `Error ${this.lastError.error?.status} : ${this.lastError.error?.message}`;
  }

  ngOnInit() {}

  copyToClipboard() {
    this.clipboardService.copyFromContent(
      JSON.stringify(this.lastError, null, 2)
    );
  }

  changeShowDetails() {
    this.showDetails = !this.showDetails;
  }

  reportIssueToYouTrack() {
    // make sure youTrack is configured
    if (!this.showYouTrackLink) {
      return;
    }
    this.issueReporting = true;

    const summary : string = this.lastError.error.message;
    const description = JSON.stringify(this.lastError, null, 2);

    this.youtrackService.reportIssue(summary, description).subscribe(() => {
        this.successfulReport();
      }, () => {
        this.errorReport();
      }
    );
  }

  successfulReport() {
    this.issueReporting = false;
    this.issueReported = true;
  }

  errorReport() {
    this.issueReporting = false;
    this.errorInSubmit = true;
  }
}
