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
import { Component, OnInit } from '@angular/core';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'mdm-code-set-main',
    templateUrl: './code-set-main.component.html',
    styleUrls: ['./code-set-main.component.scss'],
})
export class CodeSetMainComponent implements OnInit {
    savingInProgress = false;
    model = {
        label: '',
        author: '',
        organisation: '',
        description: '',
        classifiers: [],
        parentFolderId: null,
        parentFolder: null,
        terms: [],
    };
    constructor(
        private stateService: StateService,
        private stateHandler: StateHandlerService,
        private resources: MdmResourcesService,
        private messageHandler: MessageHandlerService,
        private broadcastSvc: BroadcastService,
        private title: Title
    ) { }

    ngOnInit() {
      // tslint:disable-next-line: deprecation
        this.model.parentFolderId = this.stateService.params.parentFolderId;
        if (!this.model.parentFolderId) {
            this.stateHandler.NotFound({ location: false });
        }
        this.title.setTitle('New Code Set');
    }

    async save() {
        if (this.model.label && this.model.author && this.model.organisation && this.model.terms.length > 0) {
            const resource = {
                label: this.model.label,
                author: this.model.author,
                organisation: this.model.organisation,
                description: this.model.description,
                classifiers: this.model.classifiers,
                folder: this.model.parentFolderId,
                terms: this.model.terms
            };

            try {
               const result = await this.resources.folder.addCondeSets(this.model.parentFolderId, resource).toPromise();
               this.messageHandler.showSuccess('Code Set created successfully.');
               this.stateHandler.Go('codeset', { id: result.body.id }, { reload: true });
            } catch (error) {
               this.messageHandler.showError('There was a problem creating the Code Set.', error);
            }
        }
    };
}
