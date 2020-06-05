/*
Copyright 2020 University of Oxford

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
import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from '@mdm/services/message.service';
import { Subscription } from 'rxjs';
import { DataModelResult } from '@mdm/model/dataModelModel';

@Component({
    selector: 'mdm-element-status',
    templateUrl: './element-status.component.html',
    // styleUrls: ['./element-status.component.sass']
})
export class ElementStatusComponent implements OnInit {

    @Input() result: DataModelResult;

    constructor(private messageService: MessageService) {

        this.DataModelDetails();
    }

    ngOnInit() {
    }

    DataModelDetails(): any {

    }

}
