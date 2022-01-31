/*
Copyright 2020-2022 University of Oxford
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
import { SharedService } from '@mdm/services/shared.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';

@Component({
  selector: 'mdm-users-app-container',
  templateUrl: './users-app-container.component.html',
  styleUrls: ['./users-app-container.component.sass']
})
export class UsersAppContainerComponent implements OnInit {
  deleteInProgress: boolean;
  pendingUsersCount = 0;
  isAdmin = this.securityHandler.isAdmin();
  features = this.sharedService.features;

  constructor(private sharedService: SharedService, private securityHandler: SecurityHandlerService) {}

  ngOnInit() {
    if (this.isAdmin) {
      this.sharedService.pendingUsersCount().subscribe(data => {
        this.pendingUsersCount = data.body.count;
      });
    }
  }

  logout = () => {
    this.sharedService.logout();
  };
}
