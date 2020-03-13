import { Component, OnInit } from '@angular/core';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-app-container',
  templateUrl: './app-container.component.html',
  styleUrls: ['./app-container.component.sass']
})
export class AppContainerComponent implements OnInit {
  constructor(
    private securityHandler: SecurityHandlerService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {}

  isLoggedOn = () => {
    return this.securityHandler.isLoggedIn();
  };

  isAdminUser = () => {
    return this.sharedService.isAdminUser();
  };

  logout = () => {
    return this.sharedService.logout();
  }
}
