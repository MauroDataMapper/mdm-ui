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
import { UserSettingsHandlerService } from '@mdm/services/utility/user-settings-handler.service';
import { MarkdownParserService } from '@mdm/utility/markdown/markdown-parser/markdown-parser.service';

@Component({
  selector: 'mdm-more-description',
  templateUrl: './more-description.component.html',
  styleUrls: ['./more-description.component.sass']
})
export class MoreDescriptionComponent implements OnInit {
  @Input() description: string;
  @Input() length: any;

  maxLength = 100;
  showMore = false;
  shortDesc: string;
  fullDesc: string;
  constructor(
    userSettingsHandler: UserSettingsHandlerService,
    private markdownParser: MarkdownParserService
  ) {
    this.showMore = userSettingsHandler.get('expandMoreDescription');
  }

  ngOnInit() {
    if (this.length !== undefined) {
      this.maxLength = this.length;
    }

    this.shortDesc = this.createShortDescription();
    this.fullDesc = this.markdownParser.parse(this.description, 'html');
  }

  toggle() {
    this.showMore = !this.showMore;
  }

  createShortDescription() {
    const desc = this.markdownParser.parse(this.description, 'text');
    if (desc && desc.length > this.maxLength) {
      let subStr = desc.substring(0, this.maxLength);
      const lastIndexOf = subStr.lastIndexOf(' ');
      subStr = subStr.substring(0, lastIndexOf);
      return `${subStr}...`;
    } else {
      return desc;
    }
  }
}
