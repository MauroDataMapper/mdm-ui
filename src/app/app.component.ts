import { Component, HostListener, OnInit } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import { SharedService } from './services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'mdm-ui';

  constructor(
    private userIdle: UserIdleService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    // Start watching for user inactivity.
    this.userIdle.startWatching();

    // Start watch when time is up.
    this.userIdle.onTimeout().subscribe(() => {
      console.log('Time is up!');
      this.sharedService.handleExpiredSession(), this.userIdle.resetTimer();
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    this.userIdle.resetTimer();
  }
}
