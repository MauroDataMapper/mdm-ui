/*
Copyright 2020 University of Oxford

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Component, OnInit } from '@angular/core';
import { SharedService } from '@mdm/services/shared.service';

@Component({
  selector: 'mdm-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  year = new Date().getFullYear();
  showWikiLink = true;
  showYouTrackLink = true;
  wiki = this.sharedService.wiki;
  youTrack = this.sharedService.youTrack;

  constructor(private sharedService: SharedService) {}

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
