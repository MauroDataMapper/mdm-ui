import { Component, OnInit, Inject } from '@angular/core';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { LoginModalComponent } from '../modals/login-modal/login-modal.component';
import { ForgotPasswordModalComponent } from '../modals/forgot-password-modal/forgot-password-modal.component';
import { BroadcastService } from '../services/broadcast.service';
import { RegisterModalComponent } from '../modals/register-modal/register-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mdm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  profilePictureReloadIndex = 0;
  profile: any;

  constructor(
    public dialog: MatDialog,
    private securityHandler: SecurityHandlerService,
    private stateHandler: StateHandlerService,
    private broadcastSvc: BroadcastService
  ) {}

  ngOnInit() {
    if (this.securityHandler.isLoggedIn()) {
      this.profile = this.securityHandler.getCurrentUser();
    }
  }

  openProfile = () => {
    this.stateHandler.Go('userarea.profile', null, null);
  };

  isLoggedIn = () => {
    return this.securityHandler.isLoggedIn();
  };

  login = () => {
    this.dialog
      .open(LoginModalComponent, { minWidth: 600, hasBackdrop: true}).afterClosed().subscribe(user => {
        if (user) {
          if (user.needsToResetPassword) {
            this.broadcastSvc.broadcast('userLoggedIn', {goTo: 'appContainer.userArea.changePassword'});
            return;
          }
          this.profile = user;

          const latestURL = this.securityHandler.getLatestURL();
          if (latestURL) {
            this.broadcastSvc.broadcast('userLoggedIn');
            this.securityHandler.removeLatestURL();
            this.stateHandler.CurrentWindow(latestURL);
            return;
          } else {
            this.broadcastSvc.broadcast('userLoggedIn', {goTo: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'});
            return;
          }
        }
      });
  };

  logout = function() {
    this.securityHandler.logout().subscribe(() => {
      this.broadcastSvc.broadcast('userLoggedOut', { goTo: 'home' });
    });
  };

  forgottenPassword = () => {
    this.dialog
      .open(ForgotPasswordModalComponent, {
        minWidth: 600,
        hasBackdrop: true
      })
      .afterClosed()
      .subscribe(user => {
        if (user) {
        }
      });
  };

  register = () => {
    this.dialog
      .open(RegisterModalComponent, {
        minWidth: 600,
        hasBackdrop: true
      })
      .afterClosed()
      .subscribe(user => {
        if (user) {
          if (user.needsToResetPassword) {
            this.broadcastSvc.broadcast('userLoggedIn', {
              goTo: 'appContainer.userArea.change-password'
            });
            return;
          }
          this.profile = user;

          const latestURL = this.securityHandler.getLatestURL();
          if (latestURL) {
            this.broadcastSvc.broadcast('userLoggedIn');
            this.securityHandler.removeLatestURL();
            this.stateHandler.CurrentWindow(latestURL);
            return;
          } else {
            this.broadcastSvc.broadcast('userLoggedIn', {
              goTo: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
            });
            return;
          }
        }
      });
  }
}
