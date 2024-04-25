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
import { MessageService } from '@mdm/services/message.service';
import { ClipboardService } from 'ngx-clipboard';
import { SharedService } from '@mdm/services/shared.service';
import { ErrorComponent } from '../error.component';
import { MessageHandlerService, SecurityHandlerService, StateHandlerService } from '@mdm/services';
import {
  AuthenticatedResponse
} from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-not-found-error',
  templateUrl: '../error.component.html',
  styleUrls: []
})
export class NotFoundComponent extends ErrorComponent implements OnInit {
  constructor(
    protected messages: MessageService,
    protected messageHandler: MessageHandlerService,
    protected clipboard: ClipboardService,
    protected shared: SharedService,
    protected security: SecurityHandlerService,
    protected stateHandler: StateHandlerService) {
    super(messages, messageHandler, clipboard, shared);

    this.security.isAuthenticated().subscribe((result: AuthenticatedResponse) => {
      if (!result.body.authenticatedSession) {
        this.shared.handleRequiredToLogin();
      }
    });

    this.errorHeader = 'Not Found';
    this.errorMessage = 'We\'re sorry, but the server returned a \'Not Found\' error';
    this.errorResolution = 'You may need to check that the item you have requested actually exists, and that you have permission to view it';
    this.errorReportMessage = 'Alternatively, this may be an error in the user interface: please report the issue to us by using the link below.';

    this.dataSource.push({ field: 'Message', value: this.lastError.message, code: false });
    this.dataSource.push({ field: 'Status', value: this.lastError.status, code: false });
    this.dataSource.push({ field: 'Path', value: this.lastError.url, code: false });
  }
}
