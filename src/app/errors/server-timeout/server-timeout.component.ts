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
import {Component, OnInit} from '@angular/core';
import {MessageService} from '@mdm/services/message.service';
import {ClipboardService} from 'ngx-clipboard';
import {YoutrackService} from '@mdm/services/youtrack.service';
import {SharedService} from '@mdm/services/shared.service';
import {ErrorComponent} from '../error.component';
@Component({
    selector: 'mdm-server-timeout-error',
    templateUrl: '../error.component.html',
    styleUrls: []
})
export class ServerTimeoutComponent extends ErrorComponent implements OnInit {

    constructor(protected messageService: MessageService,
                protected clipboardService: ClipboardService,
                protected sharedService: SharedService,
                protected youtrackService: YoutrackService) {
        super(messageService, clipboardService, sharedService, youtrackService);
        this.errorHeader = 'Server Timeout Error';
        this.errorMessage = 'We\'re sorry, but the server responded with an error message.';
        this.errorResolution = 'The request may have succeeded. Please allow some time and then select the catalogue item you were on from the model tree to refresh the view.';
        this.errorReportMessage = 'Alternatively, if the error persists, please report the issue to us by using the link below:';

        this.dataSource.push({field: 'Reason', value: 'Server Timeout', code: false});
        this.dataSource.push({field: 'Status', value: 'Server Gateway Timeout', code: false});
        this.dataSource.push({field: 'Error Code', value: '504', code: false});
    }
}

