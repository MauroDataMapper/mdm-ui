/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { SharedService } from '../services/shared.service';
import { MessageHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  features = this.shared.features;
  issueReporting = this.shared.issueReporting;
  showDetails = false;
  lastError: any;

  dataSource: object[] = [];
  isLoggedIn = false;
  summary: string;
  errorHeader: string;
  errorMessage: string;
  errorResolution: string;
  errorReportMessage: string;

  constructor(
    protected messages: MessageService,
    protected messageHandler: MessageHandlerService,
    protected clipboard: ClipboardService,
    protected shared: SharedService,
  ) {
    this.lastError = messages.lastError;
    this.isLoggedIn = shared.isLoggedIn();
    this.summary = `Error ${this.lastError.error?.status} : ${this.lastError.error?.message}`;
  }

  ngOnInit() { }

  copyDetails() {
    if (this.clipboard.copyFromContent(this.getLastErrorAsMarkdown())) {
      this.messageHandler.showSuccess('Copied information to clipboard');
    }
  }

  changeShowDetails() {
    this.showDetails = !this.showDetails;
  }

  private getLastErrorAsMarkdown() {
    const json = JSON.stringify(this.lastError, null, 2);
    const jsonMd = '```json\n' + json + '\n```';

    return ''.concat(
      `## ${this.errorHeader}\n\n`,
      `${this.errorMessage}\n\n`,
      '## Details\n\n',
      jsonMd,
      '\n');
  }
}
