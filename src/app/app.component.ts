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
import { Component, HostListener, OnInit } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import { EditingService } from './services/editing.service';
import { SharedService } from './services/shared.service';

@Component({
  selector: 'mdm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'mdm-ui';

  constructor(
    private userIdle: UserIdleService,
    private sharedService: SharedService,
    private editingService: EditingService
  ) {}

  @HostListener('window:mousemove', ['$event'])
  onMouseMove() {
    this.userIdle.resetTimer();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (!this.editingService.confirmLeave()) {
      event.preventDefault();
      event.returnValue = 'Your data will be lost';
    }
  }

  ngOnInit() {
    // Start watching for user inactivity.
    this.userIdle.startWatching();
    this.userIdle.onTimerStart().subscribe();
    // Start watch when time is up.
    let lastDigestRun: any = new Date();
    this.userIdle.onTimeout().subscribe(() => {
      const now: any = new Date();
      if (now - lastDigestRun > 300000) {// 5 min
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.sharedService.handleExpiredSession(), this.userIdle.resetTimer();
      }
      lastDigestRun = now;
    });
  }
}
