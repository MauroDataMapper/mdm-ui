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
import { MessageService } from '@mdm/services/message.service';
import { ClipboardService } from 'ngx-clipboard';
import { SharedService } from '@mdm/services/shared.service';
import { ErrorComponent } from '../error.component';
import { MessageHandlerService } from '@mdm/services';
@Component({
  selector: 'mdm-server-error',
  templateUrl: '../error.component.html',
  styleUrls: []
})
export class ServerErrorComponent extends ErrorComponent implements OnInit {

  constructor(
    protected messages: MessageService,
    protected messageHandler: MessageHandlerService,
    protected clipboard: ClipboardService,
    protected shared: SharedService) {
    super(messages, messageHandler, clipboard, shared);
    this.errorHeader = 'Server Error';
    this.errorMessage = 'We\'re sorry, but the server responded with an error message.';
    this.errorResolution = 'This may be a temporary issue, so you might like to try again later';
    this.errorReportMessage = 'Alternatively, if this is the first time you have encountered this error, please report the issue to us by using the link below:';

    if (this.lastError.error?.reason) this.dataSource.push({ field: 'Reason', value: this.lastError.error?.reason, code: false });
    if (this.lastError.error?.status) this.dataSource.push({ field: 'Status', value: this.lastError.error?.status, code: false });
    if (this.lastError.error?.errorCode) this.dataSource.push({ field: 'Error Code', value: this.lastError.error?.errorCode, code: false });
    if (this.lastError.error?.path) this.dataSource.push({ field: 'Path', value: this.lastError.error?.path, code: false });
    if (this.lastError.error?.devMode) this.dataSource.push({ field: 'Dev Mode', value: this.lastError.error?.devMode, code: false });
    if (this.lastError.error?.message) this.dataSource.push({ field: 'Message', value: this.lastError.error?.message, code: false });
    if (this.lastError.error?.exception) this.dataSource.push({ field: 'Exception', value: this.lastError.error?.exception, code: true });

  }
}

