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
  selector: 'mdm-not-implemented-error',
  templateUrl: '../error.component.html',
  styleUrls: []
})
export class NotImplementedComponent extends ErrorComponent implements OnInit {

  constructor(protected messageService: MessageService,
              protected clipboardService: ClipboardService,
              protected sharedService: SharedService,
              protected youtrackService: YoutrackService) {
    super(messageService, clipboardService, sharedService, youtrackService);
    this.errorHeader = 'Not Implemented';
    this.errorMessage = 'We\'re sorry, but the server responded to say that the feature you have requested has not yet been implemented';
    this.errorResolution = 'If you are running a development or test instance of the server, this may be something we\'re currently working on.';
    this.errorReportMessage = 'Alternatively, this may be an error in the user interface: please report the issue to us by using the link below.';

    console.log(this.lastError);
    this.dataSource.push({ field: 'Message', value: this.lastError.message, code: false });
    this.dataSource.push({ field: 'Status', value: this.lastError.status, code: false });
    this.dataSource.push({ field: 'Path', value: this.lastError.url, code: false });
  }
}
