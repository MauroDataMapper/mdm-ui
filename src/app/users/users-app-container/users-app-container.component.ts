import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-users-app-container',
  templateUrl: './users-app-container.component.html',
  styleUrls: ['./users-app-container.component.sass']
})
export class UsersAppContainerComponent implements OnInit {
  deleteInProgress: boolean;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {}

  logout = () => {
    this.sharedService.logout();
  }
}
