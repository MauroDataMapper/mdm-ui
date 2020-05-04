import { Component, OnInit } from '@angular/core';
import { SharedService } from '@mdm/services/shared.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';

@Component({
  selector: 'mdm-app-container',
  templateUrl: './app-container.component.html',
  styleUrls: ['./app-container.component.sass']
})
export class AdminAppContainerComponent implements OnInit {
  pendingUsersCount = 0;
  isAdmin = this.securityHandler.isAdmin();
  constructor(private sharedService: SharedService, private securityHandler: SecurityHandlerService, private broadcastSvc: BroadcastService) {}

  ngOnInit() {
    if (this.isAdmin) {
      this.pendingUsers();
      this.broadcastSvc.subscribe('pendingUserUpdated', () => {
        this.pendingUsers();
      });
    }
  }

  pendingUsers = () => {
    this.sharedService.pendingUsersCount().subscribe(data => {
      this.pendingUsersCount = data.body.count;
    });
  }

  logout = () => {
    this.sharedService.logout();
  }
}
