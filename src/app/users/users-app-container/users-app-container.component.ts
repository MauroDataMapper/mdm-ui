import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'mdm-users-app-container',
  templateUrl: './users-app-container.component.html',
  styleUrls: ['./users-app-container.component.sass']
})
export class UsersAppContainerComponent implements OnInit {
  deleteInProgress: boolean;
  exporting: boolean; // TODO correct this
  pendingUsersCount = 0;


  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.pendingUsersCount().subscribe(data => {
      this.pendingUsersCount = data.body.count;
    });
  }

  logout = () => {
    this.sharedService.logout();
  }
}
