/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mdm-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.sass']
})
export class ProfilePictureComponent implements OnInit {
  @Input() user: any;
  image: any;
  dynamicTooltipText: string;
  constructor() {}

  ngOnInit() {
    const displayName = `${this.user?.firstName ?? ''} ${this.user?.lastName ?? ''}`;
    const organisation = this.user?.organisation ?? '';
    const emailAddress = this.user?.emailAddress ?? '';

    this.dynamicTooltipText = [displayName.trim(), organisation.trim(), emailAddress.trim()].join(', ');
  }

  getImage = () => {
    if (this.user.profilePicture.fileType !== 'base64') {
      this.image = this.user.profilePicture.fileContents;
    }
  };
}
