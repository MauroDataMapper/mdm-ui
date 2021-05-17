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
import { MessageService } from '@mdm/services/message.service';
import { ClipboardService } from 'ngx-clipboard';
import { YoutrackService } from '@mdm/services/youtrack.service';
import { SharedService } from '@mdm/services/shared.service';
import { ErrorComponent } from '../error.component';
@Component({
  selector: 'mdm-not-authorized-error',
  templateUrl: '../error.component.html',
  styleUrls: []
})
export class NotAuthorizedComponent extends ErrorComponent implements OnInit {

  constructor(protected messageService: MessageService,
    protected clipboardService: ClipboardService,
    protected sharedService: SharedService,
    protected youtrackService: YoutrackService) {
    super(messageService, clipboardService, sharedService, youtrackService);
    this.errorHeader = 'Not Authorized';
    this.errorMessage = 'We\'re sorry, but the server does not allow you to view this page.';
    this.errorResolution = 'You may need to check that the item you have requested actually exists, and that you have permission to view it';
    this.errorReportMessage = 'Alternatively, if you believe you really should have access to this item, please report the issue to us by using the link below:';

    this.dataSource.push({ field: 'Message', value: this.lastError.message, code: false });
    this.dataSource.push({ field: 'Status', value: this.lastError.status, code: false });
    this.dataSource.push({ field: 'Path', value: this.lastError.url, code: false });
  }
}
