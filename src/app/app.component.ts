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
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BroadcastService, StateHandlerService, UserSettingsHandlerService } from './services';
import { EditingService } from './services/editing.service';
import { SharedService } from './services/shared.service';
import { ThemingService } from './services/theming.service';

@Component({
  selector: 'mdm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'mdm-ui';
  isLoading = false;
  themeCssSelector: string;
  lastUserIdleCheck: Date = new Date();

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject();

  constructor(
    private userIdle: UserIdleService,
    private sharedService: SharedService,
    private editingService: EditingService,
    private theming: ThemingService,
    private overlayContainer: OverlayContainer,
    private broadcast: BroadcastService,
    private toastr: ToastrService,
    private stateHandler: StateHandlerService,
    private userSettingsHandler: UserSettingsHandlerService) { }


  @HostListener('window:mousemove', ['$event'])
  onMouseMove() {
    this.userIdle.resetTimer();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event) {
    if (!this.editingService.confirmLeave()) {
      event.preventDefault();
      event.returnValue = 'Your data will be lost';
    }
  }

  ngOnInit() {
    this.setTheme();

    this.broadcast
      .onApplicationOffline()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.toastr.error('Application is offline!'));

    this.broadcast
      .onUserLoggedIn()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(args => {
        this.userSettingsHandler.init().then(() => {
          // To remove any ngToast messages specifically sessionExpiry,...
          this.toastr.toasts.forEach(x => this.toastr.clear(x.toastId));
          if (args && args.nextRoute) {
            this.stateHandler.Go(args.nextRoute, {}, { reload: true, inherit: false, notify: true });
          }
        });
      });

    this.setupIdleTimer();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setupIdleTimer() {
    this.userIdle.startWatching();
    this.userIdle
      .onTimerStart()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => { });

    this.userIdle
      .onTimeout()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        const now = new Date();

        if (now.valueOf() - this.lastUserIdleCheck.valueOf() > this.sharedService.checkSessionExpiryTimeout) {
          this.sharedService.handleExpiredSession();
          this.userIdle.resetTimer();
        }

        this.lastUserIdleCheck = now;
      });
  }

  private setTheme() {
    this.themeCssSelector = this.theming.themeCssSelector;

    // Material theme is wrapped inside a CSS class but the overlay container is not part of Angular
    // Material. Have to manually set the correct theme class to this container too
    this.overlayContainer.getContainerElement().classList.add(this.themeCssSelector);
    this.overlayContainer.getContainerElement().classList.add('overlay-container');
  }
}
