import { Component, OnInit } from '@angular/core';
import { SharedService } from '@mdm/services/shared.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';

@Component({
  selector: 'mdm-users-app-container',
  templateUrl: './users-app-container.component.html',
  styleUrls: ['./users-app-container.component.sass']
})
export class UsersAppContainerComponent implements OnInit {
  deleteInProgress: boolean;
  exporting: boolean; // TODO correct this
  pendingUsersCount = 0;
  isAdmin = this.securityHandler.isAdmin();

  constructor(private sharedService: SharedService, private securityHandler: SecurityHandlerService) {}

  ngOnInit() {
    if (this.isAdmin) {
      this.sharedService.pendingUsersCount().subscribe(data => {
        this.pendingUsersCount = data.body.count;
      });
    }
  }

  logout = () => {
    this.sharedService.logout();
  }
}
