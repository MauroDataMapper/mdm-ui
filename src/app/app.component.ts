import { Component, HostListener, OnInit } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import { SharedService } from './services/shared.service';

@Component({
  selector: 'mdm-root',
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
    this.userIdle.onTimerStart().subscribe();
    // Start watch when time is up.
    let lastDigestRun: any = new Date();
    this.userIdle.onTimeout().subscribe(() => {
      const now: any = new Date();
      if (now - lastDigestRun > 300000) {// 5 min
        this.sharedService.handleExpiredSession(), this.userIdle.resetTimer();

      }
      lastDigestRun = now;

    });
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e) {
    this.userIdle.resetTimer();
  }
}
