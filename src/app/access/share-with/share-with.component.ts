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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { catchError } from 'rxjs/operators';
import { SecurityAccessResource, securityAccessResourceDisplayNames } from '@mdm/modals/security-modal/security-modal.model';

@Component({
  selector: 'mdm-share-with',
  templateUrl: './share-with.component.html',
  styleUrls: ['./share-with.component.sass'],
})
export class ShareWithComponent implements OnInit {

  @Input() catalogueItemId: Uuid;
  @Input() readableByEveryone = false;
  @Input() readableByAuthenticatedUsers = false;
  @Input() resource: SecurityAccessResource;

  @Output() readableByEveryoneChange = new EventEmitter<boolean>();
  @Output() readableByAuthenticatedUsersChange = new EventEmitter<boolean>();

  message: string;

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService) { }

  ngOnInit() {
    this.message = securityAccessResourceDisplayNames[this.resource];
  }

  shareReadWithEveryoneChanged() {
    const request: Observable<unknown> = this.readableByEveryone
      ? this.resources[this.resource].updateReadByEveryone(this.catalogueItemId, {})
      : this.resources[this.resource].removeReadByEveryone(this.catalogueItemId);

    request
      .pipe(
        catchError(error => {
          this.messageHandler.showError(`There was a problem updating the ${this.message}.`, error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(`${this.message} updated successfully.`);
        this.readableByEveryoneChange.emit(this.readableByEveryone);
      });
  }

  shareReadWithAuthenticatedChanged = () => {
    const request: Observable<any> = this.readableByAuthenticatedUsers
      ? this.resources[this.resource].updateReadByAuthenticated(this.catalogueItemId, {})
      : this.resources[this.resource].removeReadByAuthenticated(this.catalogueItemId);

    request
      .pipe(
        catchError(error => {
          this.messageHandler.showError(`There was a problem updating the ${this.message}.`, error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(`${this.message} updated successfully.`);
        this.readableByAuthenticatedUsersChange.emit(this.readableByAuthenticatedUsers);
      });
  };
}
