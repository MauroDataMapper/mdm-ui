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
import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { UserDetailsResult } from '@mdm/model/userDetailsModel';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';

@Component({
  selector: 'mdm-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  @Input() afterSave: any;
  @Output() refreshUserDetails: EventEmitter<any> = new EventEmitter();
  user: UserDetailsResult;
  public: false;
  subscription: Subscription;
  isWritable: boolean;
  errorMessage = '';

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private title: Title,
    private messageHandler: MessageHandlerService
  ) {
    this.userDetails();
  }

  ngOnInit() {
    this.title.setTitle('My profile');
  }

  userDetails(): any {
    // subscribe to parent component userDetails messages;
    this.subscription = this.messageService.getUserDetails().subscribe((message) => {
      this.user = message;
    });
  }

  checkEmailExists(data: string) {
    return this.resourcesService.catalogueUser.exists(data);
  }

  formBeforeSave =  () => {
    this.errorMessage = '';
    this.checkEmailExists(this.user.emailAddress).subscribe(() => {
      const userDetails = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        organisation: this.user.organisation,
        jobTitle: this.user.jobTitle || '',
      };
      if (this.validateInput(this.user.firstName) && this.validateInput(this.user.lastName) && this.validateInput(this.user.organisation)) {
        this.resourcesService.catalogueUser.update(this.user.id, userDetails).subscribe(result => {
          if (this.afterSave) {
            this.afterSave(result);
          }
          this.messageHandler.showSuccess('User details updated successfully.');
        }, error => {
          this.messageHandler.showError('There was a problem updating the User Details.', error);
        }
        );
      }
    });
  };

  validateInput(value): any {
    if (value != null && value.trim().length === 0) {
      return false;
    } else {
      return true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // unsubscribe to ensure no memory leaks
  }
}
