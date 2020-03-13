import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {SecurityHandlerService} from './handlers/security-handler.service';
import {Subject} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import { ResourcesService } from 'src/app/services/resources.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {


    backendURL = environment.apiEndpoint;
    appVersion = environment.version;
    appTitle = environment.appTitle;
    youTrack = environment.youTrack;
    wiki = environment.wiki;
    simpleViewSupport = environment.simpleViewSupport;
    HDFLink = environment.HDFLink;
    isAdmin;
    applicationOffline = new Subject<any>();
    current;

  public searchCriteria: string;

  lastDigestRun = new Date();

  constructor(
    private securityHandler: SecurityHandlerService,
    private toaster: ToastrService,
    private resources: ResourcesService
  ) {
    this.isAdmin = this.securityHandler.isAdmin();
    this.applicationOffline.subscribe(() => {
      this.toaster.warning('Application is offline!');
    });
  }

  logout = () => {
    this.securityHandler.logout();
  };

  isLoggedIn = () => {
    return this.securityHandler.isLoggedIn();
  };

  isAdminUser = () => {
    return this.securityHandler.isAdmin();
  };

  handleExpiredSession = (firstTime?) => {
    // if 'event:auth-loginRequired' event is fired, then do not check as
    // the event handler will check the status
    if (this.securityHandler.in_AuthLoginRequiredCheck && !firstTime) {
      return;
    }
    this.securityHandler.isCurrentSessionExpired().then(result => {
      if (result === true) {
        this.securityHandler.saveLatestURL(window.location.href);
        this.toaster.error('Your session has expired! Please log in.');

        this.securityHandler.logout();
      }
    });
  };

  pendingUsersCount = () => {
    return this.resources.catalogueUser.get(null, 'pending', { filters: 'count=true&disabled=false' });
  }

}
