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
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';

@Component({
  selector: 'mdm-share-with',
  templateUrl: './share-with.component.html',
  styleUrls: ['./share-with.component.sass'],
})
export class ShareWithComponent implements OnInit {
  @Input() mcElement: string;
  @Input() mcDomainType: string;
  folderResult: any;
  subscription: Subscription;
  type;

  supportedDomainTypes = {
    DataModel: { name: 'dataModel', message: 'Data Model' },
    Classifier: { name: 'classifier', message: 'Classifier' },
    Folder: { name: 'folder', message: 'Folder' },
    Terminology: { name: 'terminology', message: 'Terminology' },
    CodeSet: { name: 'codeSet', message: 'CodeSet' }
  };

  readableByEveryone: false;
  readableByAuthenticated: false;

  message = 'Permission';
  domainType: string;

  constructor(
    private messageService: MessageService,
    private resourcesService: MdmResourcesService,
    private messageHandler: MessageHandlerService
  ) { }

  ngOnInit() {
    this.folderResult = this.messageService.getFolderPermissions();
    this.readableByEveryone = this.folderResult?.readableByEveryone;
    this.readableByAuthenticated = this.folderResult?.readableByAuthenticated;
    this.type = this.supportedDomainTypes[this.mcDomainType];
    this.domainType = this.type?.name;
    this.message = this.type?.message;
  }

  shareReadWithEveryoneChanged = () => {
    if (this.readableByEveryone) {
      this.resourcesService[this.domainType].updateReadByEveryone(this.folderResult?.id).subscribe((result) => {
        this.folderResult = result.body;
        this.messageHandler.showSuccess(`${this.message} updated successfully.`);
      }, (error) => {
        this.messageHandler.showError(`There was a problem updating the ${this.message}.`, error);
      });
    } else if (!this.readableByEveryone) {
      this.resourcesService[this.domainType].removeReadByEveryone(this.folderResult?.id).subscribe((result) => {
        this.folderResult = result.body;
        this.messageService.dataChanged(this.folderResult);
        this.messageHandler.showSuccess(`${this.message} updated successfully.`);
      }, (error) => {
        this.messageHandler.showError(`There was a problem updating the ${this.message}.`, error);
      });
    }
  };

  shareReadWithAuthenticatedChanged = () => {
    if (this.readableByAuthenticated) {
      this.resourcesService[this.domainType].updateReadByAuthenticated(this.folderResult.id).subscribe((serverResult) => {
        this.folderResult = serverResult.body;
        this.messageService.dataChanged(this.folderResult);
        this.messageHandler.showSuccess(`${this.message} updated successfully.`);
      }, (error) => {
        this.messageHandler.showError(`There was a problem updating the ${this.message}.`, error);
      });
    } else if (!this.readableByAuthenticated) {
      this.resourcesService[this.domainType].removeReadByAuthenticated(this.folderResult.id).subscribe((serverResult) => {
        this.folderResult = serverResult.body;
        this.messageService.dataChanged(this.folderResult);
        this.messageHandler.showSuccess(`${this.message} updated successfully.`);
      }, (error) => {
        this.messageHandler.showError(`There was a problem updating the ${this.message}.`, error);
      });
    }
  };
}
