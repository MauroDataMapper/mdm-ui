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
  selector: 'mdm-all-links-in-paged-list',
  templateUrl: './all-links-in-paged-list.component.html',
  styleUrls: ['./all-links-in-paged-list.component.sass']
})
export class AllLinksInPagedListComponent implements OnInit {
  @Input() parent: any;

  @Input() showDescription: any;
  @Input() showNoLinksMessage: any;
  @Input() showLoadingSpinner: any;
  @Input() type: any;

  mcLinks = {
    refines: [],
    doesNotRefine: [],
    from: [],
    total: 0
  };
  linkTypes = [];
  allLinksMap: any;
  total: any;
  loading = false;

  constructor() { }

  ngOnInit() {
    if (!this.parent || (this.parent && this.parent.length === 0)) {
      this.loading = false;
      return;
    }
    this.loading = true;

    this.loadLinksStatic();
    this.loading = false;
  }

  loadLinksStatic = () => {
    this.linkTypes = [];
    this.allLinksMap = {};
    this.total = 0;
    this.loading = true;
    if (!this.parent || !this.parent.length) {
      return;
    }

    this.parent.forEach(link => {
      if (!this.allLinksMap[link.linkType]) {
        this.allLinksMap[link.linkType] = {
          linkType: link.linkType,
          count: 0,
          links: []
        };
        this.linkTypes.push(link.linkType);
      }
      this.allLinksMap[link.linkType].links.push(link);
      this.allLinksMap[link.linkType].count++;
      this.total++;
    });

    this.loading = false;
  };
}
