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
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {
  ApiProperty,
  ApiPropertyIndexResponse
} from '@maurodatamapper/mdm-resources';
import { UserIdleService } from './external/user-idle/user-idle.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { MdmResourcesService } from './modules/resources';
import {
  BroadcastService,
  StateHandlerService,
  UserSettingsHandlerService
} from './services';
import { EditingService } from './services/editing.service';
import { FeaturesService } from './services/features.service';
import { SharedService } from './services/shared.service';
import { ThemingService } from './services/theming.service';
import { FooterLink } from './shared/footer/footer.component';

const defaultCopyright =
  'Clinical Informatics, NIHR Oxford Biomedical Research Centre';

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

  footerLinks: FooterLink[] = [];
  appVersion?: string;
  copyright?: string;

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject<void>();

  constructor(
    private userIdle: UserIdleService,
    private shared: SharedService,
    private editingService: EditingService,
    private theming: ThemingService,
    private overlayContainer: OverlayContainer,
    private broadcast: BroadcastService,
    private toastr: ToastrService,
    private stateHandler: StateHandlerService,
    private userSettingsHandler: UserSettingsHandlerService,
    private resources: MdmResourcesService,
    private features: FeaturesService
  ) {}

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
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((args) => {
          const settings$ = this.userSettingsHandler.loadForCurrentUser();
          return forkJoin([of(args), settings$]);
        })
      )
      .subscribe(([args, _]) => {
        // To remove any ngToast messages specifically sessionExpiry,...
        this.toastr.toasts.forEach((x) => this.toastr.clear(x.toastId));
        if (args && args.nextRoute) {
          this.stateHandler.Go(
            args.nextRoute,
            {},
            { reload: true, inherit: false, notify: true }
          );
        }
      });

    this.setupFooter();

    this.setupIdleTimer();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setupFooter() {
    const request$: Observable<ApiPropertyIndexResponse> = this.resources.apiProperties.listPublic();

    request$
      .pipe(
        catchError(() => []),
        map((response: ApiPropertyIndexResponse) => response.body.items),
        map((apiProperties: ApiProperty[]) => {
          return {
            copyright: apiProperties.find(
              (p) => p.key === 'content.footer.copyright'
            ),
            documentationUrl: this.shared.documentation?.url,
            issueReportingUrl:
              this.features.useIssueReporting &&
              this.shared.issueReporting?.defaultUrl
          };
        })
      )
      .subscribe((config) => {
        if (config.documentationUrl) {
          this.footerLinks.push({
            label: 'Documentation',
            href: config.documentationUrl,
            target: '_blank'
          });
        }

        if (config.issueReportingUrl) {
          this.footerLinks.push({
            label: 'Report issue',
            href: config.issueReportingUrl,
            target: '_blank'
          });
        }

        this.appVersion = this.shared.appVersion;
        this.copyright = config.copyright?.value ?? defaultCopyright;
      });
  }

  private setupIdleTimer() {
    this.userIdle.startWatching();
    this.userIdle
      .onTimerStart()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {});

    this.userIdle
      .onTimeout()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        const now = new Date();

        if (
          now.valueOf() - this.lastUserIdleCheck.valueOf() >
          this.shared.checkSessionExpiryTimeout
        ) {
          this.shared.handleExpiredSession();
          this.userIdle.resetTimer();
        }

        this.lastUserIdleCheck = now;
      });
  }

  private setTheme() {
    this.themeCssSelector = this.theming.themeCssSelector;

    // Material theme is wrapped inside a CSS class but the overlay container is not part of Angular
    // Material. Have to manually set the correct theme class to this container too
    this.overlayContainer
      .getContainerElement()
      .classList.add(this.themeCssSelector);
    this.overlayContainer
      .getContainerElement()
      .classList.add('overlay-container');
  }
}
