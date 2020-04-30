import { Component, OnInit } from '@angular/core';
import { SharedService } from '@mdm/services/shared.service';

@Component({
  selector: 'mdm-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  constructor(private sharedService: SharedService) {}

  year = new Date().getFullYear();
  showWikiLink = true;
  showYouTrackLink = true;
  wiki = this.sharedService.wiki;
  youTrack = this.sharedService.youTrack;

  ngOnInit() {
    if (
      this.sharedService.simpleViewSupport &&
      !this.sharedService.isLoggedIn()
    ) {
      this.showWikiLink = false;
    }

    if (
      this.sharedService.simpleViewSupport &&
      !this.sharedService.isLoggedIn()
    ) {
      this.showYouTrackLink = false;
    }
  }
}
