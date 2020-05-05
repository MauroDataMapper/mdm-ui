import { Component, OnInit } from '@angular/core';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { LoginModalComponent } from '@mdm/modals/login-modal/login-modal.component';
import { ForgotPasswordModalComponent } from '@mdm/modals/forgot-password-modal/forgot-password-modal.component';
import { SharedService } from '@mdm/services/shared.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { RegisterModalComponent } from '@mdm/modals/register-modal/register-modal.component';

@Component({
  selector: 'mdm-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit {

  profilePictureReloadIndex = 0;
  profile: any;
  backendURL: any;
  simpleViewSupport: any;
  current: any;
  HDFLink: any;
  sideNav: any;
  pendingUsersCount = 0;
  isAdmin = this.securityHandler.isAdmin();
  isLoggedIn = this.securityHandler.isLoggedIn();

  constructor(private sharedService: SharedService, private dialog: MatDialog, private securityHandler: SecurityHandlerService, private stateHandler: StateHandlerService, private broadcastSvc: BroadcastService) { }

  ngOnInit() {
      if (this.isLoggedIn) {
          this.profile = this.securityHandler.getCurrentUser();
          if (this.isAdmin) {
            this.getPendingUsers();
          }
      }
      this.backendURL = this.sharedService.backendURL;
      this.HDFLink = this.sharedService.HDFLink;
      this.current = this.sharedService.current;
      this.broadcastSvc.subscribe('pendingUserUpdated', () => {
        this.getPendingUsers();
      });
  }
  getPendingUsers = () => {
    this.sharedService.pendingUsersCount().subscribe(data => {
      this.pendingUsersCount = data.body.count;
    });
  }


  login = () => {
    this.dialog.open(LoginModalComponent, {
        hasBackdrop: true,
        autoFocus: false
      }).afterClosed().subscribe((user) => {
      if (user) {
        if (user.needsToResetPassword) {
            this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.userArea.changePassword' });
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
            this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel' });
            return;
        }
      }
    });
  };

  logout = () => {
    this.securityHandler.logout();
  };

  forgottenPassword = () => {
    this.dialog.open(ForgotPasswordModalComponent, {
      hasBackdrop: true
    });
  };
  register = () => {
    this.dialog.open(RegisterModalComponent, {
        hasBackdrop: true,
        autoFocus: false
      }).afterClosed().subscribe(user => {
        if (user) {
          if (user.needsToResetPassword) {
            this.broadcastSvc.broadcast('userLoggedIn', {goTo: 'appContainer.userArea.change-password'});
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
  }
}
