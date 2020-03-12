import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';

import { AppComponent } from './app.component';
import { CatalougeModule } from './modules/catalouge/catalouge.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';
import { APP_BASE_HREF, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';
import { ROLES } from './constants/roles';
import { CookieService } from 'ngx-cookie-service';
import { UIRouterModule, TransitionService } from '@uirouter/angular';
import { SharedModule } from './modules/shared/shared.module';
import { UiViewComponent } from './shared/ui-view/ui-view.component';
import { SharedService } from './services/shared.service';
import { BroadcastService } from './services/broadcast.service';
import { ToastrService } from 'ngx-toastr';
import { StateHandlerService } from './services/handlers/state-handler.service';
import { StateRoleAccessService } from './services/utility/state-role-access.service';
import { UserSettingsHandlerService } from './services/utility/user-settings-handler.service';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CatalougeModule,
    AdminModule,
    UsersModule,
    SharedModule,
    AppRoutingModule,
    UIRouterModule.forRoot({ useHash: true })
  ],
  providers: [
    CookieService,
    { provide: MAT_TABS_CONFIG, useValue: { animationDuration: '0ms' } },
    { provide: ROLES, useClass: ROLES },
    {
      provide: LOCALE_ID,
      useValue: 'en-GB'
    },
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [UiViewComponent]
})
export class AppModule {
  latestError: any;

  constructor(
    private sharedService: SharedService,
    private broadcast: BroadcastService,
    private toast: ToastrService,
    private stateHandler: StateHandlerService,
    private trans: TransitionService,
    private rolesService: StateRoleAccessService,
    private userSettingsHandler: UserSettingsHandlerService
  ) {
    this.trans.onStart({}, state => {
      this.sharedService.current = state.$to().name;
      return this.rolesService.hasAccess(state.$to().name);
    });

    this.sharedService.handleExpiredSession(true);

    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.broadcast.subscribe('applicationOffline', () => {
      this.toast.error('Application is offline!');
    });

    this.broadcast.subscribe('connectionError', () => {
      this.toast.error('Server connection failed');
    });

    this.broadcast.subscribe('notAuthenticated', () => {
      this.stateHandler.NotAuthorized({ location: false });
    });

    this.broadcast.subscribe('userLoggedIn', args => {
      this.userSettingsHandler.init().then(() => {
        // To remove any ngToast messages specifically sessionExpiry,...
        console.log('User Logged In');
        this.toast.toasts.forEach(x => this.toast.clear(x.toastId));
        if (args && args.goTo) {
          this.stateHandler.Go(
            args.goTo,
            {},
            { reload: true, inherit: false, notify: true }
          );
        }
      });
    });

    this.broadcast.subscribe('userLoggedOut', args => {
      if (args && args.goTo) {
        this.stateHandler.Go(
          args.goTo,
          {},
          { reload: true, inherit: false, notify: true }
        );
      }
    });

    this.broadcast.subscribe('resourceNotFound', () => {
      this.stateHandler.NotFound({ location: false });
    });

    this.broadcast.subscribe('serverError', response => {
      this.latestError = {
        url: window.location.href,
        host: window.location.host,
        response
      };
      this.stateHandler.ServerError({ location: false });
    });

    this.broadcast.subscribe('notImplemented', () => {
      this.stateHandler.NotImplemented({ location: false });
    });
  }
 }
