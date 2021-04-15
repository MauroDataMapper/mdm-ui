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
import { SharedService } from '@mdm/services/shared.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';

@Component({
  selector: 'mdm-app-container',
  templateUrl: './app-container.component.html',
  styleUrls: ['./app-container.component.sass']
})
export class AdminAppContainerComponent implements OnInit {
  pendingUsersCount = 0;
  features = this.sharedService.features;

  constructor(private sharedService: SharedService, private securityHandler: SecurityHandlerService, private broadcastSvc: BroadcastService) {}

  ngOnInit() {
    if (this.isAdmin()) {
      this.getPendingUsers();
      this.broadcastSvc.subscribe('pendingUserUpdated', () => {
        this.getPendingUsers();
      });
    }
  }
  isAdmin = () => {
    return this.securityHandler.isAdmin();
  };

  getPendingUsers = () => {
    this.sharedService.pendingUsersCount().subscribe(data => {
      this.pendingUsersCount = data.body.count;
    });
  };

  logout = () => {
    this.sharedService.logout();
  };
}
