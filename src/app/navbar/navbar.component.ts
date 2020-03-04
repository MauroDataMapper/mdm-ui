import { Component, OnInit, Inject, Input } from '@angular/core';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { LoginModalComponent } from '../modals/login-modal/login-modal.component';
import { ForgotPasswordModalComponent } from '../modals/forgot-password-modal/forgot-password-modal.component';
import { SharedService } from '../services/shared.service';
import { BroadcastService } from '../services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit {

    @Input() navCollapsed: boolean;

    profilePictureReloadIndex = 0;
    profile: any;

    backendURL: any;
    simpleViewSupport: any;
    current:any; //TODO
    HDFLink: any;
    open:any; //TODO
    sideNav: any;

    constructor(private sharedService: SharedService, private dialog: MatDialog, private securityHandler: SecurityHandlerService, private stateHandler: StateHandlerService, private broadcastSvc: BroadcastService) { }

    ngOnInit() {

        if (this.securityHandler.isLoggedIn()) {
            this.profile = this.securityHandler.getCurrentUser();
        }

        if (!this.navCollapsed) {
            this.navCollapsed = true;
        }
        this.backendURL = this.sharedService.backendURL;
        this.HDFLink = this.sharedService.HDFLink;
    }

    openProfile = () => {
        this.stateHandler.Go('userarea.profile');
    }

    isLoggedIn = () => {
        return this.securityHandler.isLoggedIn();
    }

    login = () => {

        this.dialog.open(LoginModalComponent,
            {
                minWidth: 400,
                hasBackdrop: true
            }).afterClosed().subscribe((user) => {

            if (user) {

                if (user.needsToResetPassword) {
                    this.broadcastSvc.broadcast('userLoggedIn',
                        { goTo: 'appContainer.userArea.changePassword' });
                    return;
                }
                this.profile = user;

                let latestURL = this.securityHandler.getLatestURL();
                if (latestURL) {
                    this.broadcastSvc.broadcast('userLoggedIn');
                    this.securityHandler.removeLatestURL();
                    this.stateHandler.CurrentWindow(latestURL);
                    return;
                } else {
                    this.broadcastSvc.broadcast('userLoggedIn',
                        { goTo: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel' });
                    return;
                }

            }
        });
    }

    logout =  () => {
        this.securityHandler.logout();
    }

    forgottenPassword = () => {
        this.dialog.open(ForgotPasswordModalComponent, {
            minWidth: 400,
            hasBackdrop: true
        }).afterClosed().subscribe((user) => {
            if (user) {

            }
        });
    }

    // TODO
    toggled = (open:any) => {

    }

    register = () => {

    }
}
