import { Component, OnInit, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
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
    private broadcastSvc: BroadcastService,
    private title: Title
  ) { }

  ngOnInit() {
    if (this.securityHandler.isLoggedIn()) {
      this.profile = this.securityHandler.getCurrentUser();
    }
    this.title.setTitle('Mauro Data Mapper - Home');
  }

  isLoggedIn = () => {
    return this.securityHandler.isLoggedIn();
  };

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
          this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.userArea.change-password' });
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
  }
}
