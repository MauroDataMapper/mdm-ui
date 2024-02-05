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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedService } from '@mdm/services/shared.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mdm-app-container',
  templateUrl: './app-container.component.html',
  styleUrls: ['./app-container.component.sass']
})
export class AdminAppContainerComponent implements OnInit, OnDestroy {
  isAdministrator = false;
  pendingUsersCount = 0;
  features = this.sharedService.features;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private sharedService: SharedService,
    private securityHandler: SecurityHandlerService,
    private broadcast: BroadcastService) {}

  ngOnInit() {
    this.securityHandler
      .isAdministrator()
      .subscribe(isAdministrator => {
        this.isAdministrator = isAdministrator;

        if (!isAdministrator) {
          return;
        }

        this.getPendingUsers();
        this.broadcast
          .on('pendingUserUpdated')
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(() => this.getPendingUsers());
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getPendingUsers = () => {
    this.sharedService.pendingUsersCount().subscribe(data => {
      this.pendingUsersCount = data.body.count;
    });
  };

  logout = () => {
    this.sharedService.logout();
  };
}
