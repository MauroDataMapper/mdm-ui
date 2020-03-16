import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'mdm-app-container',
  templateUrl: './app-container.component.html',
  styleUrls: ['./app-container.component.sass']
})
export class AdminAppContainerComponent implements OnInit {
  pendingUsersCount = 0;
  constructor(
    private sharedService: SharedService  ) {}

  ngOnInit() {
    this.sharedService.pendingUsersCount().subscribe(data => {
      this.pendingUsersCount = data.body.count;
    });
  }

  logout = () => {
    this.sharedService.logout();
  }
}
