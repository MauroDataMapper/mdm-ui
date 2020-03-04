import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { ResourcesService } from 'src/app/services/resources.service';
import { BroadcastService } from 'src/app/services/broadcast.service';

@Component({
    selector: 'app-app-container',
    templateUrl: './app-container.component.html',
    styleUrls: ['./app-container.component.sass']
})
export class AdminAppContainerComponent implements OnInit {
    pendingUsersCount: any;
    constructor(private sharedService: SharedService, private resources: ResourcesService, private broadcastSvc: BroadcastService) { }

    ngOnInit() {
        this.findPendingCount();
        this.broadcastSvc.subscribe('$pendingUserUpdated', () => {
            this.pendingUsersCount();
        });
    }

    findPendingCount = () => {
        this.resources.catalogueUser.get(null, 'pending', {filters: 'count=true&disabled=false'}).subscribe((data) => {
            this.pendingUsersCount = data.body.count;
        });
    }

    logout = () => {
        this.sharedService.logout();
    }

}
