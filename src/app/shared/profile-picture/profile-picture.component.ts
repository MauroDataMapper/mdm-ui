import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: "profile-picture",
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.sass']
})
export class ProfilePictureComponent implements OnInit {
  constructor() {}

  @Input('user') user: any;
  image: any;
  dynamicTooltipText: String;

  ngOnInit() {
    this.dynamicTooltipText =
      '<div>' +
      (this.user.firstName ? this.user.firstName : '') +
      '&nbsp;' +
      (this.user.lastName ? this.user.lastName : '') +
      '<br>' +
      (this.user.organisation ? this.user.organisation + '<br>' : '') +
      this.user.emailAddress +
      '</div>';
  }

  getImage = () => {
    if (this.user.profilePicture.fileType !== 'base64') {
      this.image = this.user.profilePicture.fileContents;
    }
  };
}
